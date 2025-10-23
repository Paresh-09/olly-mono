import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { validateRequest } from "@/lib/auth";
import { sendDiscordNotification } from "@/service/discord-notify";
import { MilestoneType } from "@repo/db"; // Import the enum from Prisma client

function isBusinessEmail(email: string): boolean {
  // Common personal email domains
  const personalDomains = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "aol.com",
    "icloud.com",
    "protonmail.com",
    "mail.com",
  ];
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? !personalDomains.includes(domain) : false;
}

function classifyLeadQuality(
  companySize: string,
  industry: string,
  email: string,
): {
  isHighQuality: boolean;
  reason: string[];
} {
  const reasons: string[] = [];
  let isHighQuality = false;
  // Company sizes that indicate larger organizations
  const largeCompanySizes = ["51-200", "201-1000", "1000+"];
  // Industries that are highly relevant
  const targetIndustries = [
    "technology",
    "finance",
    "professional_services",
    "media",
    "manufacturing",
    "healthcare",
  ];
  const hasLargeCompanySize = largeCompanySizes.includes(companySize);
  const isTargetIndustry = targetIndustries.includes(industry);
  const hasBusinessEmail = isBusinessEmail(email);
  // Check each criterion and collect reasons
  if (hasLargeCompanySize) {
    reasons.push(`Large company size (${companySize} employees)`);
    isHighQuality = true;
  }
  if (isTargetIndustry) {
    reasons.push(`Target industry (${industry})`);
    isHighQuality = true;
  }
  if (hasBusinessEmail) {
    reasons.push(`Business email (${email.split("@")[1]})`);
    isHighQuality = true;
  }
  // If no reasons found, it's a standard lead
  if (reasons.length === 0) {
    return {
      isHighQuality: false,
      reason: [
        `Standard lead: ${industry} company with ${companySize} employees`,
      ],
    };
  }
  // For high quality leads, format the message based on collected reasons
  return {
    isHighQuality,
    reason: reasons,
  };
}

export async function GET() {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    // Fetch existing onboarding data for the user
    const onboardingData = await prisma.onboarding.findUnique({
      where: { userId: user.id },
    });
    if (!onboardingData) {
      return NextResponse.json(
        {
          success: true,
          message: "No onboarding data found for this user",
          data: null,
        },
        { status: 200 },
      );
    }
    return NextResponse.json(
      {
        success: true,
        message: "Onboarding data retrieved successfully",
        data: onboardingData,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching onboarding data:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    const errorResponse = {
      success: false,
      message: "Error retrieving onboarding data",
      error: errorMessage,
      details:
        error instanceof Error
          ? {
              name: error.name,
              stack:
                process.env.NODE_ENV === "development"
                  ? error.stack
                  : undefined,
            }
          : undefined,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { skipped } = body;
    // Update user's onboarding status first
    await prisma.user.update({
      where: { id: user.id },
      data: { onboardingComplete: true },
    });
    let result;

    // Track milestone: ONBOARDING_STARTED (if this is their first interaction with onboarding)
    // Only create if it doesn't exist yet (using upsert with the unique constraint)
    await prisma.userJourneyMilestone.upsert({
      where: {
        userId_milestone: {
          userId: user.id,
          milestone: MilestoneType.ONBOARDING_STARTED,
        },
      },
      update: {}, // No updates needed if it exists
      create: {
        userId: user.id,
        milestone: MilestoneType.ONBOARDING_STARTED,
      },
    });

    if (skipped) {
      result = await prisma.onboarding.upsert({
        where: { userId: user.id },
        update: {
          skipped: true,
          completedAt: new Date(),
        },
        create: {
          userId: user.id,
          skipped: true,
          completedAt: new Date(),
        },
      });

      // Track milestone: ONBOARDING_SKIPPED
      await prisma.userJourneyMilestone.upsert({
        where: {
          userId_milestone: {
            userId: user.id,
            milestone: MilestoneType.ONBOARDING_SKIPPED,
          },
        },
        update: {},
        create: {
          userId: user.id,
          milestone: MilestoneType.ONBOARDING_SKIPPED,
        },
      });

      await sendDiscordNotification(
        `
User Skipped Onboarding:
- User Email: ${user.email}
      `.trim(),
        true,
      );
    } else {
      const {
        role,
        roleOther,
        industry,
        businessType,
        primaryPlatform,
        primaryPlatformOther,
        companySize,
        referralSource,
      } = body;
      // Create or update full onboarding data
      const onboardingData = {
        role,
        roleOther,
        industry,
        businessType,
        primaryPlatform,
        primaryPlatformOther,
        companySize,
        referralSource,
        skipped: false,
        completedAt: new Date(),
      };
      result = await prisma.onboarding.upsert({
        where: { userId: user.id },
        update: onboardingData,
        create: {
          ...onboardingData,
          userId: user.id,
        },
      });

      // Track milestone: ONBOARDING_COMPLETED
      await prisma.userJourneyMilestone.upsert({
        where: {
          userId_milestone: {
            userId: user.id,
            milestone: MilestoneType.ONBOARDING_COMPLETED,
          },
        },
        update: {},
        create: {
          userId: user.id,
          milestone: MilestoneType.ONBOARDING_COMPLETED,
          // Store relevant metadata about their profile
          metadata: {
            role,
            industry,
            businessType,
            primaryPlatform,
            companySize,
          },
        },
      });

      const leadQuality = classifyLeadQuality(
        companySize,
        industry,
        user.email,
      );

      // If it's a high-quality lead, track that as a milestone
      if (leadQuality.isHighQuality) {
        await prisma.userJourneyMilestone.upsert({
          where: {
            userId_milestone: {
              userId: user.id,
              milestone: MilestoneType.HIGH_QUALITY_LEAD_IDENTIFIED,
            },
          },
          update: {},
          create: {
            userId: user.id,
            milestone: MilestoneType.HIGH_QUALITY_LEAD_IDENTIFIED,
            metadata: {
              reasons: leadQuality.reason,
              companySize,
              industry,
              emailDomain: user.email.split("@")[1],
            },
          },
        });
      }

      const qualityIndicator = leadQuality.isHighQuality ? "🔥" : "⚪";
      const notificationMessage = `
      User Completed Onboarding:
      - User ID: ${user.email}
      - Role: ${role}${roleOther ? ` (${roleOther})` : ""}
      - Industry: ${industry || "N/A"}
      - Business Type: ${businessType || "N/A"}
      - Primary Platform: ${primaryPlatform}${primaryPlatformOther ? ` (${primaryPlatformOther})` : ""}
      - Company Size: ${companySize || "N/A"}
      - Referral Source: ${referralSource || "N/A"}
      
      ${qualityIndicator} Lead Quality Indicators:
      ${leadQuality.reason.map((reason) => `• ${reason}`).join("\n")}
      `.trim();

      await sendDiscordNotification(notificationMessage, true);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Onboarding completed successfully",
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in onboarding:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    const errorResponse = {
      success: false,
      message: "Error processing onboarding",
      error: errorMessage,
      details:
        error instanceof Error
          ? {
              name: error.name,
              stack:
                process.env.NODE_ENV === "development"
                  ? error.stack
                  : undefined,
            }
          : undefined,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
