// app/api/redeem-code/route.ts
import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { RedeemCodeStatus, TransactionType } from "@repo/db";

// Define interface types for metadata
interface CodeMetadata {
  credits?: number;
}

interface BatchMetadata {
  tier?: string;
  credits?: number;
  createdById?: string;
  createdByName?: string;
}

interface LicenseMetadata {
  credits?: number;
}

/**
 * Check if a redeem code is valid and return its associated license key with tier information
 */
async function checkRedeemCode(redeemCode: string) {
  try {
    // Check the database for the redeem code with expanded license key information
    const dbRedeemCode = await prismadb.redeemCode.findUnique({
      where: { code: redeemCode },
      include: {
        licenseKey: {
          include: {
            subLicenses: true, // Include sublicenses
          },
        },
        batch: true, // Include batch for metadata
      },
    });

    if (!dbRedeemCode || !dbRedeemCode.licenseKey) {
      throw new Error("Invalid redeem code");
    }

    // Check if the code has already been claimed
    if (dbRedeemCode.status === RedeemCodeStatus.CLAIMED) {
      throw new Error("This redeem code has already been claimed");
    }

    // Check if the code has expired
    if (dbRedeemCode.batch) {
      if (new Date(dbRedeemCode.batch.validity) < new Date()) {
        // Update the code status to expired
        await prismadb.redeemCode.update({
          where: { id: dbRedeemCode.id },
          data: { status: RedeemCodeStatus.EXPIRED },
        });

        throw new Error("This redeem code has expired");
      }
    }

    // Extract credits from metadata (fallback to batch metadata if code metadata is not available)
    let credits = 0;
    try {
      // Try to get credits from code metadata first
      if (dbRedeemCode.metadata) {
        const codeMetadata: CodeMetadata = JSON.parse(
          //@ts-ignore
          dbRedeemCode.metadata || "{}",
        );
        credits = codeMetadata.credits || 0;
      }
      // If not found in code metadata, try batch metadata
      else if (dbRedeemCode.batch?.metadata) {
        const batchMetadata: BatchMetadata = JSON.parse(
          //@ts-ignore
          dbRedeemCode.batch.metadata || "{}",
        );
        credits = batchMetadata.credits || 0;
      }
      // If not found in license key metadata, try license key metadata
      else if (dbRedeemCode.licenseKey.metadata) {
        const licenseMetadata: LicenseMetadata = JSON.parse(
          //@ts-ignore
          dbRedeemCode.licenseKey.metadata || "{}",
        );
        credits = licenseMetadata.credits || 0;
      }
    } catch (e) {
      console.error("Error parsing metadata:", e);
    }

    // Determine tier information
    const tier = dbRedeemCode.licenseKey.tier
      ? `T${dbRedeemCode.licenseKey.tier}`
      : "T1";
    const sublicenseCount = dbRedeemCode.licenseKey.subLicenses?.length || 0;

    // Return the redeem code data with tier information and credits
    const redeemData = {
      redeemCode: dbRedeemCode.code,
      licenseKey: dbRedeemCode.licenseKey.key,
      status: dbRedeemCode.status,
      isActivatedInDb: dbRedeemCode.licenseKey.isActive,
      tier: tier,
      sublicenseCount: sublicenseCount,
      credits: credits,
      // Only include sublicense keys if they exist
      sublicenses:
        dbRedeemCode.licenseKey.subLicenses?.map((sub) => ({
          key: sub.key,
          status: sub.status,
        })) || [],
    };

    return redeemData;
  } catch (error) {
    console.error("Error checking redeem code:", error);
    throw error;
  }
}

async function activateLicense(redeemCodeId: string, userId?: string) {
  try {
    // Get the redeem code with license key and sublicenses
    const redeemCode = await prismadb.redeemCode.findUnique({
      where: { id: redeemCodeId },
      include: {
        licenseKey: {
          include: {
            subLicenses: true,
          },
        },
        batch: true, // Include batch for metadata
      },
    });

    if (!redeemCode || !redeemCode.licenseKey) {
      throw new Error("Invalid redeem code");
    }

    // Activate the main license key
    await prismadb.licenseKey.update({
      //@ts-ignore
      where: { id: redeemCode.licenseKeyId },
      data: {
        isActive: true,
        activatedAt: new Date(),
        activationCount: { increment: 1 },
      },
    });

    // Activate all sublicenses if they exist
    if (
      redeemCode.licenseKey.subLicenses &&
      redeemCode.licenseKey.subLicenses.length > 0
    ) {
      for (const sublicense of redeemCode.licenseKey.subLicenses) {
        await prismadb.subLicense.update({
          where: { id: sublicense.id },
          data: {
            status: "ACTIVE",
          },
        });
      }
    }

    // If userId is provided, link the license key to the user and add credits
    let updatedBalance = 0;
    let creditsAdded = 0;
    if (userId) {
      // Check if the association already exists
      const existingLink = await prismadb.userLicenseKey.findFirst({
        where: {
          userId: userId,
          //@ts-ignore
          licenseKeyId: redeemCode.licenseKeyId,
        },
      });

      if (!existingLink) {
        await prismadb.userLicenseKey.create({
          data: {
            userId: userId,
            //@ts-ignore
            licenseKeyId: redeemCode.licenseKeyId,
          },
        });
      }

      // Extract credits from metadata
      try {
        // Try to get credits from code metadata first
        if (redeemCode.metadata) {
          try {
            const codeMetadata: CodeMetadata = JSON.parse(
              //@ts-ignore
              redeemCode.metadata || "{}",
            );
            creditsAdded = codeMetadata.credits || 0;
          } catch (e) {
            console.error("Failed to parse redeemCode metadata:", e);
          }
        }

        // If not found in code metadata, try batch metadata
        if (creditsAdded === 0 && redeemCode.batch?.metadata) {
          try {
            const batchMetadata: BatchMetadata = JSON.parse(
              //@ts-ignore
              redeemCode.batch.metadata || "{}",
            );
            creditsAdded = batchMetadata.credits || 0;
          } catch (e) {
            console.error("Failed to parse batch metadata:", e);
          }
        }

        // If not found in batch metadata, try license key metadata
        if (creditsAdded === 0 && redeemCode.licenseKey.metadata) {
          try {
            const licenseMetadata: LicenseMetadata = JSON.parse(
              //@ts-ignore
              redeemCode.licenseKey.metadata || "{}",
            );
            creditsAdded = licenseMetadata.credits || 0;
          } catch (e) {
            console.error("Failed to parse licenseKey metadata:", e);
          }
        }
      } catch (e) {
        console.error("Error in entire credits determination process:", e);
      }

      // Add credits to user if any credits are specified
      if (creditsAdded > 0) {
        updatedBalance = await addCreditsToUser(
          userId,
          creditsAdded,
          redeemCode.licenseKey.key,
        );
      }
    }

    // Mark the redeem code as claimed
    await prismadb.redeemCode.update({
      where: { id: redeemCode.id },
      data: {
        status: RedeemCodeStatus.CLAIMED,
        claimedAt: new Date(),
        claimedBy: userId || undefined,
      },
    });

    return {
      success: true,
      updatedBalance,
      creditsAdded,
    };
  } catch (error) {
    console.error("Error activating license:", error);
    throw error;
  }
}

// Function to add credits to user
async function addCreditsToUser(
  userId: string,
  credits: number,
  licenseKey: string,
) {
  // If credits is 0, skip this step
  if (credits <= 0) {
    return 0;
  }

  try {
    // First, check if the user has a UserCredit record
    let userCredit = await prismadb.userCredit.findUnique({
      where: { userId },
    });

    // If not, create one
    if (!userCredit) {
      userCredit = await prismadb.userCredit.create({
        data: {
          userId,
          balance: credits, // Set initial balance to the gifted credits
        },
      });
    } else {
      // Update the existing balance
      userCredit = await prismadb.userCredit.update({
        where: { userId },
        data: {
          balance: {
            increment: credits,
          },
        },
      });
    }

    // Record the transaction
    const transaction = await prismadb.creditTransaction.create({
      data: {
        userCreditId: userCredit.id,
        amount: credits,
        type: TransactionType.PLAN_CREDITS,
        description: `Credits from license key: ${licenseKey}`,
      },
    });

    return userCredit.balance;
  } catch (error) {
    console.error("Error adding credits to user:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, userId, activate = true } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Missing redeem code" },
        { status: 400 },
      );
    }

    // First check if the redeem code is valid
    const redeemData = await checkRedeemCode(code);

    // If activate flag is true, activate the license and sublicenses
    if (activate) {
      if (!userId) {
        return NextResponse.json(
          {
            success: false,
            error: "User ID is required to activate a license",
          },
          { status: 400 },
        );
      }

      // Get the redeem code record to get its ID
      const redeemCode = await prismadb.redeemCode.findUnique({
        where: { code: code },
      });

      if (!redeemCode) {
        return NextResponse.json(
          { success: false, error: "Invalid redeem code" },
          { status: 400 },
        );
      }

      const activationResult = await activateLicense(redeemCode.id, userId);

      // Get updated data after activation
      const updatedRedeemData = await prismadb.redeemCode.findUnique({
        where: { code: code },
        include: {
          licenseKey: {
            include: {
              subLicenses: true,
            },
          },
          batch: true,
        },
      });

      // Format the response data
      const responseData = {
        redeemCode: updatedRedeemData?.code,
        licenseKey: updatedRedeemData?.licenseKey?.key,
        status: updatedRedeemData?.status,
        isActivatedInDb: updatedRedeemData?.licenseKey?.isActive,
        tier: updatedRedeemData?.licenseKey?.tier
          ? `T${updatedRedeemData.licenseKey.tier}`
          : "T1",
        sublicenseCount:
          updatedRedeemData?.licenseKey?.subLicenses?.length || 0,
        creditsAdded: activationResult.creditsAdded,
        creditBalance: activationResult.updatedBalance,
        sublicenses:
          updatedRedeemData?.licenseKey?.subLicenses?.map((sub) => ({
            key: sub.key,
            status: sub.status,
          })) || [],
        activated: true,
      };

      return NextResponse.json(
        { success: true, data: responseData },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { success: true, data: redeemData },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(`Error in POST /api/redeem-code:`, error);
    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "An unexpected error occurred. Please try again or contact support.",
      },
      { status: 500 },
    );
  }
}

// Optional GET endpoint to check a redeem code without claiming it
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Missing redeem code" },
        { status: 400 },
      );
    }

    const redeemData = await checkRedeemCode(code);
    return NextResponse.json(
      { success: true, data: redeemData },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(`Error checking redeem code: ${error.message}`);
    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "An unexpected error occurred. Please try again or contact support.",
      },
      { status: 500 },
    );
  }
}
