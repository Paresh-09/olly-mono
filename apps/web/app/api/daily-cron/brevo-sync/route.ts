import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { sendDiscordNotification } from "@/service/discord-notify";
import { updateBrevoContact } from "@/lib/brevo-contact-update";

async function fetchTodaysNewUsers() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return await prismadb.user.findMany({
    where: {
      createdAt: { gte: today },
      email: {
        not: null
      }
    },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      createdAt: true,
      licenseKeys: {
        include: {
          licenseKey: true
        }
      }
    }
  });
}

function chunkMessage(message: string, maxLength: number = 1900): string[] {
  const chunks: string[] = [];
  let currentChunk = "";

  message.split('\n').forEach(line => {
    if (currentChunk.length + line.length + 1 > maxLength) {
      chunks.push(currentChunk);
      currentChunk = "";
    }
    currentChunk += line + '\n';
  });

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

export async function GET(req: Request) {
  try {
    const isCronAuthorized = req.headers.get('Authorization') === `Bearer ${process.env.CRON_SECRET}`;

    if (!isCronAuthorized) {
      return new NextResponse("Unauthorized.", { status: 401 });
    }

    const users = await fetchTodaysNewUsers();
    
    let successCount = 0;
    let failureCount = 0;
    let skippedCount = 0;
    let paidCount = 0;
    let freeCount = 0;
    const errors: string[] = [];

    for (const user of users) {
      if (!user.email) {
        skippedCount++;
        continue;
      }

      // Check current license status
      const hasActiveLicense = user.licenseKeys.some(key => 
        key.licenseKey.isActive && 
        (!key.licenseKey.expiresAt || new Date(key.licenseKey.expiresAt) > new Date())
      );

      if (hasActiveLicense) {
        paidCount++;
      } else {
        freeCount++;
      }

      try {
        // Split name into first and last name
        const nameParts = user.name?.split(' ') || [''];
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        // Get source from the first license key's vendor
        const source = user.licenseKeys[0]?.licenseKey.vendor || 'Direct Signup';

        await updateBrevoContact({
          email: user.email,
          attributes: {
            FIRSTNAME: firstName,
            LASTNAME: lastName,
            SOURCE: source,
            PAID: hasActiveLicense,
            SIGNUP_DATE: user.createdAt.toISOString(),
            USERNAME: user.username || ''
          },
          listIds: hasActiveLicense ? [16] : [] // Adjust list ID as needed
        });

        successCount++;
      } catch (error: any) {
        failureCount++;
        errors.push(`Failed to sync ${user.email}: ${error.message}`);
        console.error(`Error syncing user ${user.email}:`, error);
      }

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Prepare summary message for Discord
    const summaryMessage = `
*Daily OLLY New Users Brevo Sync Results*

**Date:** ${new Date().toISOString().split('T')[0]}

**Sync Metrics:**
- Total New Users Today: ${users.length}
- Successfully Synced: ${successCount}
- Failed to Sync: ${failureCount}
- Skipped (no email): ${skippedCount}

**New User Breakdown:**
- Paid Users: ${paidCount}
- Free Users: ${freeCount}

${errors.length > 0 ? `**Errors:**\n${errors.slice(0, 10).join('\n')}${errors.length > 10 ? `\n...and ${errors.length - 10} more errors` : ''}` : ''}
    `;

    // Send summary to Discord
    const messageChunks = chunkMessage(summaryMessage);
    for (const chunk of messageChunks) {
      try {
        await sendDiscordNotification(chunk, chunk === messageChunks[0]);
      } catch (error) {
        console.error("Error sending chunk to Discord:", error);
      }
    }

    return NextResponse.json({
      message: "Daily new users Brevo sync completed",
      date: new Date().toISOString().split('T')[0],
      stats: {
        total: users.length,
        success: successCount,
        failed: failureCount,
        skipped: skippedCount,
        paid: paidCount,
        free: freeCount
      }
    });

  } catch (error) {
    console.error("Error during Brevo sync:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  } finally {
    await prismadb.$disconnect();
  }
}