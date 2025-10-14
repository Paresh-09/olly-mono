import { NextRequest, NextResponse } from "next/server";
import { sendDiscordNotification } from "@/service/discord-notify";
import { sendAppSumoWelcomeEmail, sendWelcomeEmail } from "@/lib/emails/welcome";
import { validateLicenseKey } from "@/service/validate-app-sumo-license";
import { google, sheets_v4 } from 'googleapis';
import { updateBrevoContact } from "@/lib/brevo-contact-update";
import prismadb from "@/lib/prismadb";
import bcrypt from "bcryptjs";
import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";
import { handlePlanUpdate } from "@/utils/plans/plan-management";
import { PlanVendor } from "@repo/db";

async function checkExistingActivation(licenseKey: string) {
  const existingLicense = await prismadb.licenseKey.findFirst({
    where: { 
      key: licenseKey,
      isActive: true,
      users: {
        some: {} // Check if there are any user associations
      }
    },
    include: {
      users: {
        include: {
          user: true
        }
      }
    }
  });

  if (existingLicense && existingLicense.users.length > 0) {
    const user = existingLicense.users[0].user;
    return {
      exists: true,
      email: user.email
    };
  }

  return { exists: false };
}


// First, update the function signature
async function updateDatabase(
  name: string, 
  email: string, 
  licenseKey: string, 
  accessToken?: string, 
  passwordHash?: string, 
  tier?: number
) {
  try {
    const now = new Date();

    // Create or update the LicenseKey
    const licenseKeyRecord = await prismadb.licenseKey.upsert({
      where: { key: licenseKey },
      update: {
        isActive: true,
        activatedAt: now,
        appsumoAccessToken: accessToken,
        tier: tier,
        vendor: 'AppSumo'
      },
      create: {
        key: licenseKey,
        isActive: true,
        activatedAt: now,
        appsumoAccessToken: accessToken,
        tier: tier,
        vendor: 'AppSumo'
      },
    });

    // Create or update the User with password
    const user = await prismadb.user.upsert({
      where: { email: email },
      update: {
        name: name,
        ...(passwordHash && { password: passwordHash }),
        isEmailVerified: true,
      },
      create: {
        email: email,
        name: name,
        password: passwordHash,
        isEmailVerified: true,
      },
    });

    // Create user-license relationship
    await prismadb.userLicenseKey.upsert({
      where: {
        userId_licenseKeyId: {
          userId: user.id,
          licenseKeyId: licenseKeyRecord.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        licenseKeyId: licenseKeyRecord.id,
      },
    });

    // Assign credits based on tier
    if (tier) {
      type TierNumber = 1 | 2 | 3 | 4;
      const TIER_CREDITS: Record<TierNumber, number> = {
        1: 100,  // Individual tier = 100 credits
        2: 500,  // Team tier = 500 credits
        3: 1000, // Agency tier = 1000 credits
        4: 2000  // Enterprise tier = 2000 credits
      };

      const validTier = tier >= 1 && tier <= 4 ? (tier as TierNumber) : 1;
      const creditAmount = TIER_CREDITS[validTier];
      
      if (creditAmount > 0) {
        // Create or update user credit balance
        const userCredit = await prismadb.userCredit.upsert({
          where: { userId: user.id },
          update: { balance: { increment: creditAmount } },
          create: { userId: user.id, balance: creditAmount },
        });

        // Create credit transaction record
        await prismadb.creditTransaction.create({
          data: {
            userCreditId: userCredit.id,
            amount: creditAmount,
            type: 'PLAN_CREDITS',
            description: `AppSumo tier ${tier} included credits: ${creditAmount} LLM credits`,
          },
        });


        await sendDiscordNotification(`Added ${creditAmount} credits for user ${email} (Tier ${tier})`);
      }

      // Create plan if tier is provided
      await handlePlanUpdate({
        userId: user.id,
        vendor: PlanVendor.APPSUMO,
        appsumoTier: tier,
        productId: `appsumo_tier${tier}`
      });
    }

    // Create installation record
    await prismadb.installation.create({
      data: {
        status: 'INSTALLED',
        licenseKeyId: licenseKeyRecord.id,
      },
    });

    // Create leaderboard entry
    await prismadb.leaderboard.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
      },
    });

    return user;
  } catch (error) {
    console.error('Error updating Prisma database:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  let errors = [];

  try {
    const body = await req.json();
    const { name, email, password, licenseKey, accessToken } = body;

    if (!licenseKey) {
      return NextResponse.json({ success: false, error: "Missing license key" }, { status: 400 });
    }

    const validationResult = await validateLicenseKey(licenseKey);
    if (!validationResult.isValid) {
      return NextResponse.json({ success: false, error: "Invalid or inactive license key" }, { status: 400 });
    }

    const existingActivation = await checkExistingActivation(licenseKey);
    if (existingActivation.exists) {
      return NextResponse.json({ 
        success: true, 
        alreadyActivated: true,
        message: `This license key has already been activated. If you are the owner, you can start using it with Olly. See our activation guide. For more questions, please write to support@explainx.ai.`,
        email: existingActivation.email
      }, { status: 200 });
    }

    if (!name || !email) {
      return NextResponse.json({ 
        success: false, 
        error: "Name and email are required fields",
      }, { status: 400 });
    }

    let passwordHash;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Update Database with tier information from validation
    let user;
    try {
      user = await updateDatabase(name, email, licenseKey, accessToken, passwordHash, validationResult.tier);
    } catch (error) {
      console.error('Error updating database:', error);
      errors.push("Failed to update database");
      throw error;
    }

    // Create session only if password was provided (for non-logged-in users)
    if (password) {
      const session = await lucia.createSession(user.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      (await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    }

    // Send notifications and emails
    try {
      const firstName = name.split(' ')[0];
      const lastName = name.split(' ').slice(1).join(' ');

      await Promise.all([
        sendDiscordNotification(`New Sign up & License key activation from: ${email}`),
        updateBrevoContact({
          email,
          attributes: {
            FIRSTNAME: firstName,
            LASTNAME: lastName,
            SOURCE: "APPSUMO_Olly_License_Activation",
            PAID: true
          },
          listIds: [12],
          updateEnabled: true
        }),
        sendAppSumoWelcomeEmail(firstName, email, licenseKey)
      ]);
    } catch (error) {
      console.error('Error with notifications:', error);
      errors.push("Some notifications failed to send");
    }

    return NextResponse.json({ 
      success: true, 
      message: "License activation process completed", 
      errors: errors.length > 0 ? errors : undefined 
    }, { status: 200 });

  } catch (error: any) {
    console.error(`Error processing license key activation: ${error.message}`);
    await sendDiscordNotification(`Error processing license key activation: ${error.message}`);
    
    return NextResponse.json({ 
      success: false, 
      error: "An unexpected error occurred. Please try again or contact support."
    }, { status: 500 });
  }
}