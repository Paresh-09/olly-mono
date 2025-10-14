// app/api/usage-tracking/route.ts
import prismadb from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";
import { MilestoneType } from "@repo/db"; // Import the enum type from Prisma client

const TESTING_USER_ID = "1111-1111-1111-111";

interface TrackingData {
  action: string;
  platform: string;
  db_user_id?: string;
  licenseKey?: { connect: { id: string } };
  subLicense?: { connect: { id: string } };
  user?: { connect: { id: string } };
  event?: string; // Add event to the interface
}

interface TrackingRequestBody {
  licenseKey: string | null;
  db_user_id: string | null;
  action: string;
  platform: string;
  event?: string;
  metadata?: any; // Allow additional metadata to be passed
}

interface TrackingResponse {
  message: string;
  creditBalance?: number;
}

// Map of action names to milestone types
const ACTION_TO_MILESTONE: Record<string, MilestoneType> = {
  first_comment: MilestoneType.FIRST_COMMENT,
  fifth_comment: MilestoneType.FIFTH_COMMENT,
  tenth_comment: MilestoneType.TENTH_COMMENT,
  first_like: MilestoneType.FIRST_LIKE,
  extension_activated: MilestoneType.EXTENSION_ACTIVATED,
  first_auto_comment_setup: MilestoneType.FIRST_AUTO_COMMENT_SETUP,
  first_auto_comment_executed: MilestoneType.FIRST_AUTO_COMMENT_EXECUTED,
  first_task_created: MilestoneType.FIRST_TASK_CREATED,
  first_team_member_added: MilestoneType.FIRST_TEAM_MEMBER_ADDED,
  premium_upgraded: MilestoneType.PREMIUM_UPGRADED,
  license_activated: MilestoneType.LICENSE_ACTIVATED,
  // Add more mappings as needed
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TrackingRequestBody;
    const { licenseKey, db_user_id, action, platform, event, metadata } =
      body;

    if (!action || !platform) {
      return NextResponse.json(
        { message: "action and platform are required" },
        { status: 400 },
      );
    }

    // Process the tracking request and get user credit info
    const { userId, creditBalance } = await processTrackingRequest(
      licenseKey,
      db_user_id,
      action,
      platform,
      event,
      metadata,
    );

    // Prepare response with credit balance if available
    const responseData: TrackingResponse = {
      message: "Usage tracking completed",
    };

    if (creditBalance !== null) {
      responseData.creditBalance = creditBalance;
    }

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Error processing usage tracking request:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

async function processTrackingRequest(
  licenseKey: string | null,
  db_user_id: string | null,
  action: string,
  platform: string,
  event?: string,
  metadata?: any,
): Promise<{ userId: string | null; creditBalance: number | null }> {
  let licenseKeyId: string | null = null;
  let subLicenseId: string | null = null;
  let userId: string | null = null;
  let creditBalance: number | null = null;
  let useTestingUserId = false;

  // First determine the user and license keys
  if (licenseKey) {
    // Check if this is a sublicense
    const foundSubLicense = await prismadb.subLicense.findUnique({
      where: { key: licenseKey },
      select: {
        id: true,
        mainLicenseKeyId: true,
        assignedUserId: true,
      },
    });

    if (foundSubLicense) {
      // If it's a sublicense, track both the sublicense and main license
      subLicenseId = foundSubLicense.id;
      licenseKeyId = foundSubLicense.mainLicenseKeyId;

      // Get the user ID from the sublicense if available
      if (foundSubLicense.assignedUserId) {
        userId = foundSubLicense.assignedUserId;
      }
    } else {
      // If not a sublicense, check if it's a main license
      const foundLicenseKey = await prismadb.licenseKey.findUnique({
        where: { key: licenseKey },
        select: {
          id: true,
          // Get the first user associated with this license key
          users: {
            take: 1,
            select: {
              userId: true,
            },
          },
        },
      });

      if (foundLicenseKey) {
        licenseKeyId = foundLicenseKey.id;

        // Get the user ID from the license key if available
        if (foundLicenseKey.users.length > 0) {
          userId = foundLicenseKey.users[0].userId;
        }
      } else {
        useTestingUserId = true;
      }
    }
  }

  // If we haven't found a user ID yet, try to find one by db_user_id
  if (!userId && db_user_id && !useTestingUserId) {
    const foundUser = await prismadb.user.findUnique({
      where: { id: db_user_id },
      select: { id: true },
    });

    if (foundUser) {
      userId = foundUser.id;
    } else {
      useTestingUserId = true;
    }
  }

  // Use testing user ID if needed
  if (useTestingUserId) {
    db_user_id = TESTING_USER_ID;
  }

  // Get user credit balance if we have a user ID
  if (userId) {
    const userCredit = await prismadb.userCredit.findUnique({
      where: { userId },
      select: { balance: true },
    });

    if (userCredit) {
      creditBalance = userCredit.balance;
    }

    // Check if this action maps to a milestone and should be tracked
    await trackMilestoneIfNeeded(userId, action, platform, metadata);
  }

  // Prepare the tracking data
  const usageTrackingData: TrackingData = {
    action,
    platform,
    db_user_id: useTestingUserId
      ? TESTING_USER_ID
      : db_user_id || undefined,
  };

  // Add event if provided
  if (event) {
    usageTrackingData.event = event;
  }

  // Connect the appropriate license keys and sublicenses
  if (licenseKeyId) {
    usageTrackingData.licenseKey = { connect: { id: licenseKeyId } };
  }

  if (subLicenseId) {
    usageTrackingData.subLicense = { connect: { id: subLicenseId } };
  }

  // Connect user if we have a user ID
  if (userId) {
    usageTrackingData.user = { connect: { id: userId } };
  }

  try {
    // Create the usage tracking record
    await prismadb.usageTracking.create({
      data: usageTrackingData,
    });

    return { userId, creditBalance };
  } catch (error) {
    console.error("Error creating usage tracking record:", error);
    throw error;
  }
}

/**
 * Track a user journey milestone if the action corresponds to a milestone
 */
async function trackMilestoneIfNeeded(
  userId: string,
  action: string,
  platform: string,
  metadata?: any,
): Promise<void> {
  // Check for comment count milestones
  if (action === "comment") {
    await trackCommentMilestone(userId, platform, metadata);
    return;
  }

  // Check direct action-to-milestone mappings
  const milestoneType = ACTION_TO_MILESTONE[action];
  if (milestoneType && userId) {
    try {
      await prismadb.userJourneyMilestone.upsert({
        where: {
          userId_milestone: {
            userId,
            milestone: milestoneType,
          },
        },
        update: {}, // No update needed if it already exists
        create: {
          userId,
          milestone: milestoneType,
          metadata: {
            platform,
            ...metadata,
          },
        },
      });
    } catch (error) {
      console.error(`Failed to track milestone ${milestoneType}:`, error);
      // Don't rethrow - we don't want milestone tracking to break usage tracking
    }
  }
}

/**
 * Specific handling for comment milestones
 */
async function trackCommentMilestone(
  userId: string,
  platform: string,
  metadata?: any,
): Promise<void> {
  try {
    // Get total comment count for this user
    const commentCount = await prismadb.usageTracking.count({
      where: {
        userId,
        action: "comment",
      },
    });


    // The current comment being tracked is not yet counted in the database
    // So we need to consider the actual count as commentCount + 1
    const actualCount = commentCount + 1;

    // Track appropriate milestone based on the actual comment count
    if (actualCount === 1) {
      console.log("Processing first comment milestone");
      await trackMilestoneWithCount(
        userId,
        MilestoneType.FIRST_COMMENT,
        platform,
        1,
        metadata,
      );
    } else if (actualCount === 5) {
      console.log("Processing fifth comment milestone");
      await trackMilestoneWithCount(
        userId,
        MilestoneType.FIFTH_COMMENT,
        platform,
        5,
        metadata,
      );
    } else if (actualCount === 10) {
      console.log("Processing tenth comment milestone");
      await trackMilestoneWithCount(
        userId,
        MilestoneType.TENTH_COMMENT,
        platform,
        10,
        metadata,
      );
    }
  } catch (error) {
    console.error(`Failed to track comment milestone:`, error);
  }
}

/**
 * Helper to track milestone with count information
 */
async function trackMilestoneWithCount(
  userId: string,
  milestone: MilestoneType,
  platform: string,
  count: number,
  metadata?: any,
): Promise<void> {
  try {
    await prismadb.userJourneyMilestone.upsert({
      where: {
        userId_milestone: {
          userId,
          milestone,
        },
      },
      update: {}, // No update needed if it already exists
      create: {
        userId,
        milestone,
        metadata: {
          platform,
          count,
          ...metadata,
        },
      },
    });

  } catch (error) {
    console.error(`Error tracking milestone ${milestone}:`, error);
  }
}
