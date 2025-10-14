import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();
    if (!user?.isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { licenseKey, newEmail, transferOptions } = body;

    if (!licenseKey || !newEmail) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Find the target user
    const targetUser = await prismadb.user.findUnique({
      where: { email: newEmail },
    });

    if (!targetUser) {
      return new NextResponse("Target user not found", { status: 404 });
    }

    // Find the license
    const license = await prismadb.licenseKey.findUnique({
      where: { key: licenseKey },
      include: {
        settings: true,
        customKnowledge: true,
        usageTracking: true,
      },
    });

    if (!license) {
      return new NextResponse("License not found", { status: 404 });
    }

    // Start a transaction to handle all transfer operations
    await prismadb.$transaction(async (tx) => {
      // Update the license ownership
      await tx.licenseKey.update({
        where: { id: license.id },
        data: {
          users: {
            deleteMany: {}, // Remove all current user associations
            create: {
              userId: targetUser.id,
            },
          },
        },
      });

      // Handle settings transfer if requested
      if (transferOptions.settings && license.settings) {
        await tx.licenseKeySettings.update({
          where: { licenseKeyId: license.id },
          data: {
            // Keep existing settings
          },
        });
      } else if (transferOptions.settings) {
        // Delete settings if not transferring
        await tx.licenseKeySettings.deleteMany({
          where: { licenseKeyId: license.id },
        });
      }

      // Handle custom knowledge transfer
      if (transferOptions.customKnowledge && license.customKnowledge) {
        await tx.licenseKeyCustomKnowledge.update({
          where: { licenseKeyId: license.id },
          data: {
            // Keep existing knowledge
          },
        });
      } else if (!transferOptions.customKnowledge) {
        await tx.licenseKeyCustomKnowledge.deleteMany({
          where: { licenseKeyId: license.id },
        });
      }

      // Handle usage tracking transfer
      if (!transferOptions.usageTracking) {
        await tx.usageTracking.deleteMany({
          where: { licenseKeyId: license.id },
        });
      }

      // Handle sub-licenses transfer
      if (!transferOptions.subLicenses) {
        await tx.subLicense.deleteMany({
          where: { mainLicenseKeyId: license.id },
        });
      }
    });

    return new NextResponse(JSON.stringify({
      message: "License transferred successfully"
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('License transfer error:', error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to transfer license" }),
      { status: 500 }
    );
  }
} 
