import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { sendDiscordNotification } from "@/service/discord-notify";
import { updateBrevoContact } from "@/lib/brevo-contact-update";
import { sendExistingUserRedeemEmail, sendWelcomeEmail } from "@/lib/emails/welcome";
import { lucia } from "@/lib/auth";
import { PlanDuration, PlanTier, PlanVendor, RedeemCodeStatus } from "@repo/db";
import { getRedemptionPlanDetails } from "@/utils/plans/plan-management";

/**
 * Check if a redeem code is valid and return its associated license key
 */
async function checkRedeemCode(redeemCode: string) {
  try {
    // Check the database for the redeem code with a more efficient query
    // Include only the necessary fields
    const dbRedeemCode = await prismadb.redeemCode.findUnique({
      where: { code: redeemCode },
      select: {
        id: true,
        code: true,
        status: true,
        licenseKey: {
          select: {
            id: true,
            key: true
          }
        }
      }
    });

    if (!dbRedeemCode || !dbRedeemCode.licenseKey) {
      throw new Error("Invalid redeem code");
    }

    // Check if the code has already been claimed
    if (dbRedeemCode.status === RedeemCodeStatus.CLAIMED) {
      throw new Error("This redeem code has already been claimed");
    }

    // Return the redeem code data with only necessary information
    return {
      redeemCode: dbRedeemCode.code,
      licenseKey: dbRedeemCode.licenseKey.key,
      status: dbRedeemCode.status,
    };
  } catch (error) {
    console.error('Error checking redeem code:', error);
    throw error;
  }
}

/**
 * Update the database to mark a redeem code as claimed and associate it with a user
 */
async function updateDatabase(userId: string, licenseKey: string, redeemCode: string) {
  try {
    const user = await prismadb.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Split the work into two transactions to reduce transaction time
    // First transaction: Handle license key and redeem code
    await prismadb.$transaction(async (prisma) => {
      // Update license key
      const license = await prisma.licenseKey.upsert({
        where: { key: licenseKey },
        update: {
          isActive: true,
          activatedAt: new Date(),
          vendor: "OLLY_REDEEM"
        },
        create: {
          key: licenseKey,
          isActive: true,
          activatedAt: new Date(),
          vendor: "OLLY_REDEEM"
        },
      });

      // Create the relation between user and license key
      await prisma.userLicenseKey.upsert({
        where: {
          userId_licenseKeyId: {
            userId: userId,
            licenseKeyId: license.id,
          },
        },
        update: {},
        create: {
          userId: userId,
          licenseKeyId: license.id,
        },
      });

      // Update redeem code status
      await prisma.redeemCode.update({
        where: { code: redeemCode },
        data: {
          status: RedeemCodeStatus.CLAIMED,
          claimedAt: new Date(),
          claimedBy: userId,
          licenseKeyId: license.id,
        },
      });

      // Update user status
      await prisma.user.update({
        where: { id: userId },
        data: { isPaidUser: true }
      });
    }, {
      timeout: 10000 // Increase timeout to 10 seconds
    });

    // Second transaction: Handle plan management
    await prismadb.$transaction(async (prisma) => {
      // Handle plan management
      const planDetails = getRedemptionPlanDetails(licenseKey);
      
      // Create or update plan record
      const plan = await prisma.plan.upsert({
        where: {
          vendor_productId: {
            vendor: PlanVendor.OLLY,
            productId: `redeem_${redeemCode}`
          }
        },
        create: {
          tier: planDetails.tier,
          duration: PlanDuration.LIFETIME, // Redemptions are typically lifetime
          vendor: PlanVendor.OLLY,
          productId: `redeem_${redeemCode}`,
          name: `${planDetails.tier.toString()} Lifetime (Redeemed)`,
          maxUsers: planDetails.maxUsers,
          isActive: true
        },
        update: {} // No updates needed if it exists
      });

      // Deactivate any existing subscriptions
      await prisma.userSubscription.updateMany({
        where: {
          userId,
          status: 'ACTIVE'
        },
        data: {
          status: 'CANCELLED',
          endDate: new Date()
        }
      });

      // Create new subscription
      await prisma.userSubscription.create({
        data: {
          userId,
          planId: plan.id,
          status: 'ACTIVE'
        }
      });
    }, {
      timeout: 10000 // Increase timeout to 10 seconds
    });

    // Send notifications and emails asynchronously (outside of transaction)
    try {
      // Send Discord notification
      await sendDiscordNotification(`User ${user.name || user.email} (${userId}) redeemed code: ${redeemCode} for license: ${licenseKey}`);
      
      // Update Brevo contact
      if (user.email) {
        // Extract first name from user.name or use email as fallback
        const firstName = user.name ? user.name.split(' ')[0] : user.email;
        const lastName = user.name ? user.name.split(' ').slice(1).join(' ') : '';
        
        await updateBrevoContact({
          email: user.email,
          attributes: {
            FIRSTNAME: firstName,
            LASTNAME: lastName,
            PAID: true,
            SOURCE: "OLLY_REDEEM_CODE"
          },
          listIds: [12]
        });
        
        await sendExistingUserRedeemEmail(firstName, user.email, licenseKey);
      }
    } catch (notifyError) {
      console.error('Error sending notifications:', notifyError);
      // Don't throw here, as the main transaction succeeded
    }

    console.log('Successfully updated database with plan management');
    return true;
  } catch (error) {
    console.error('Error updating database:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { redeemCode, userId } = body;

    if (!redeemCode || !userId) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields" 
      }, { status: 400 });
    }

    try {
      // Verify the redeem code
      const codeData = await checkRedeemCode(redeemCode);
      
      // Update the database
      await updateDatabase(userId, codeData.licenseKey, redeemCode);

      return NextResponse.json({ 
        success: true, 
        message: "License key successfully redeemed" 
      }, { status: 200 });
    } catch (specificError: any) {
      // Handle specific errors with appropriate status codes
      if (specificError.message.includes("Invalid redeem code")) {
        return NextResponse.json({ 
          success: false, 
          error: specificError.message 
        }, { status: 404 });
      } else if (specificError.message.includes("already been claimed")) {
        return NextResponse.json({ 
          success: false, 
          error: specificError.message 
        }, { status: 409 }); // Conflict
      } else if (specificError.message.includes("User not found")) {
        return NextResponse.json({ 
          success: false, 
          error: specificError.message 
        }, { status: 404 });
      } else if (specificError.message.includes("Transaction")) {
        // Handle transaction timeout errors
        console.error(`Transaction error: ${specificError.message}`);
        return NextResponse.json({ 
          success: false, 
          error: "The server is experiencing high load. Please try again in a moment." 
        }, { status: 503 }); // Service Unavailable
      } else {
        throw specificError; // Re-throw to be caught by the outer catch
      }
    }
  } catch (error: any) {
    console.error(`Error redeeming code: ${error.message}`);
    return NextResponse.json({ 
      success: false, 
      error: "An unexpected error occurred. Please try again or contact support.",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}