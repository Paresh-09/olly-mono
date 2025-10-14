import prismadb from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";
import { MilestoneType } from "@repo/db";
import { validateRequest } from "@/lib/auth";

// Interface for premium user journey data
interface PremiumUserJourneyData {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  vendor: string;
  licenseKey: string;
  licenseStatus: string;
  milestones: UserMilestone[];
  lastActive: string;
  activationStatus: string;
  daysSinceSignup: number;
  subscriptionStatus: string;
  isTrialUser: boolean;
  trialEndsAt: string | null;
  cancelledAt: string | null;
  progressPercentage: number;
  currentStage: string;
  stagesCompleted: string[];
  hasUnsubscribed: boolean;
}

interface UserMilestone {
  milestone: string;
  displayName: string;
  achievedAt: string;
  daysSinceSignup: number;
}

interface PremiumJourneyResponse {
  totalUsers: number;
  users: PremiumUserJourneyData[];
  milestoneOverview: MilestoneOverview[];
  timeframe: string;
}

interface MilestoneOverview {
  milestone: string;
  displayName: string;
  count: number;
  percentage: number;
}

// Display names for milestones
const MILESTONE_INFO: Record<string, string> = {
  SIGNUP: "Sign Up",
  FIRST_LOGIN: "First Login",
  EXTENSION_INSTALLED: "Extension Installed",
  EXTENSION_ACTIVATED: "Extension Activated",
  ONBOARDING_STARTED: "Onboarding Started",
  ONBOARDING_COMPLETED: "Onboarding Completed",
  ONBOARDING_SKIPPED: "Onboarding Skipped",
  FIRST_COMMENT: "First Comment",
  FIFTH_COMMENT: "Fifth Comment",
  TENTH_COMMENT: "Tenth Comment",
  FIRST_LIKE: "First Like",
  FIRST_AUTO_COMMENT_SETUP: "Auto Comment Setup",
  FIRST_AUTO_COMMENT_EXECUTED: "Auto Comment Executed",
  FIRST_TASK_CREATED: "Task Created",
  FIRST_TEAM_MEMBER_ADDED: "Team Member Added",
  BUSINESS_PROFILE_COMPLETED: "Business Profile Completed",
  PLATFORM_CONNECTED: "Platform Connected",
  LICENSE_ACTIVATED: "License Activated",
  PREMIUM_UPGRADED: "Premium Upgrade",
  HIGH_QUALITY_LEAD_IDENTIFIED: "High Quality Lead",
  ADVANCED_FEATURE_USED: "Advanced Feature Used",
  EXTENSION_UNINSTALLED: "Extension Uninstalled",
};

/**
 * GET endpoint for premium user journey analytics (non-AppSumo users)
 * 
 * Query parameters:
 * - timeframe: 'all', 'year', 'month', 'week', 'day', '3months' (defaults to 'all')
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await validateRequest();
    if (!session || !(session.user?.isAdmin || session.user?.isSuperAdmin)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Parse timeframe parameter
    const url = new URL(req.url);
    const timeframe = url.searchParams.get("timeframe") || "all";
    
    // Get date filter based on timeframe
    const dateRange = getDateRange(timeframe);
    
    // Get users with any licenses (all vendors, both active and inactive)
    const premiumUsers = await prismadb.user.findMany({
      where: {
        AND: [
          dateRange ? { createdAt: dateRange } : {},
          {
            licenseKeys: {
              some: {}
            }
          }
        ]
      },
      include: {
        licenseKeys: {
          include: {
            licenseKey: true
          }
        },
        journeyMilestones: {
          orderBy: {
            achievedAt: 'asc'
          }
        },
        sessions: {
          orderBy: {
            lastActive: 'desc'
          },
          take: 1
        },
        subscriptions: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Define key journey stages for progress tracking
    const JOURNEY_STAGES = [
      'SIGNUP',
      'FIRST_LOGIN', 
      'EXTENSION_INSTALLED',
      'FIRST_COMMENT',
      'FIFTH_COMMENT',
      'TENTH_COMMENT'
    ];

    // Transform data for response
    const usersData: PremiumUserJourneyData[] = premiumUsers.map(user => {
      // Get primary license (prefer active, but include inactive if no active)
      const activeLicense = user.licenseKeys.find(ul => 
        ul.licenseKey.isActive
      )?.licenseKey;
      const inactiveLicense = user.licenseKeys.find(ul => 
        !ul.licenseKey.isActive
      )?.licenseKey;
      const primaryLicense = activeLicense || inactiveLicense;

      // Get subscription info
      const subscription = user.subscriptions?.[0];

      // Calculate days since signup
      const daysSinceSignup = Math.floor(
        (new Date().getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Transform milestones
      const milestones: UserMilestone[] = user.journeyMilestones.map(milestone => ({
        milestone: milestone.milestone,
        displayName: MILESTONE_INFO[milestone.milestone] || milestone.milestone,
        achievedAt: milestone.achievedAt.toISOString(),
        daysSinceSignup: Math.floor(
          (milestone.achievedAt.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        )
      }));

      // Calculate progress through journey stages
      const stagesCompleted = JOURNEY_STAGES.filter(stage => 
        milestones.some(m => m.milestone === stage)
      );
      const progressPercentage = Math.round((stagesCompleted.length / JOURNEY_STAGES.length) * 100);

      // Determine current stage
      let currentStage = "Signup";
      if (stagesCompleted.length > 0) {
        const lastCompletedStageIndex = JOURNEY_STAGES.findLastIndex(stage => 
          stagesCompleted.includes(stage)
        );
        if (lastCompletedStageIndex < JOURNEY_STAGES.length - 1) {
          currentStage = MILESTONE_INFO[JOURNEY_STAGES[lastCompletedStageIndex + 1]] || "Next Stage";
        } else {
          currentStage = "Fully Activated";
        }
      }

      // Determine activation status
      let activationStatus = "Not Started";
      if (milestones.some(m => m.milestone === "EXTENSION_INSTALLED")) {
        activationStatus = "Extension Installed";
      }
      if (milestones.some(m => m.milestone === "FIRST_COMMENT")) {
        activationStatus = "First Comment";
      }
      if (milestones.some(m => m.milestone === "TENTH_COMMENT")) {
        activationStatus = "Fully Activated";
      }

      // Check if user has unsubscribed
      const hasUnsubscribed = subscription?.status === "CANCELLED" || subscription?.cancelledAt !== null;

      return {
        id: user.id,
        name: user.name || "Unknown",
        email: user.email || "No email",
        createdAt: user.createdAt.toISOString(),
        vendor: primaryLicense?.vendor || (user.email ? "lemonsqueezy" : "appsumo"),
        licenseKey: primaryLicense?.key || "No license",
        licenseStatus: primaryLicense?.isActive ? "Active" : "Inactive",
        milestones,
        lastActive: user.sessions[0]?.lastActive.toISOString() || user.createdAt.toISOString(),
        activationStatus,
        daysSinceSignup,
        subscriptionStatus: subscription?.status || "No Subscription",
        isTrialUser: subscription?.trialEndsAt !== null,
        trialEndsAt: subscription?.trialEndsAt?.toISOString() || null,
        cancelledAt: subscription?.cancelledAt?.toISOString() || null,
        progressPercentage,
        currentStage,
        stagesCompleted: stagesCompleted.map(stage => MILESTONE_INFO[stage] || stage),
        hasUnsubscribed
      };
    });

    // Calculate milestone overview
    const allMilestones = premiumUsers.flatMap(user => user.journeyMilestones);
    const milestoneOverview: MilestoneOverview[] = [];
    
    // Count each milestone type
    const milestoneCounts = allMilestones.reduce((acc, milestone) => {
      acc[milestone.milestone] = (acc[milestone.milestone] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Convert to overview format
    Object.entries(milestoneCounts).forEach(([milestone, count]) => {
      milestoneOverview.push({
        milestone,
        displayName: MILESTONE_INFO[milestone] || milestone,
        count,
        percentage: Math.round((count / premiumUsers.length) * 100)
      });
    });

    // Sort by count descending
    milestoneOverview.sort((a, b) => b.count - a.count);

    const response: PremiumJourneyResponse = {
      totalUsers: premiumUsers.length,
      users: usersData,
      milestoneOverview,
      timeframe,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching premium user journey analytics:", error);
    return NextResponse.json({ message: "Internal server error", error: String(error) }, { status: 500 });
  }
}

/**
 * Returns date filter range based on timeframe
 */
function getDateRange(timeframe: string): { gte: Date } | null {
  const now = new Date();
  
  switch (timeframe) {
    case "day":
      return { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
    case "week":
      return { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
    case "month":
      return { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    case "3months":
      return { gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
    case "year":
      return { gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
    default:
      return null; // All time
  }
} 