// app/api/analytics/user-journey/route.ts
import prismadb from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";
import { MilestoneType } from "@repo/db";
import { validateRequest } from "@/lib/auth";

// Simplified response types
interface MilestoneStats {
  milestone: string;
  displayName: string;
  order: number;
  count: number;
  completionRate: number;
  avgDaysFromSignup: number;
}

interface JourneyTransition {
  fromMilestone: string;
  fromDisplayName: string;
  toMilestone: string;
  toDisplayName: string;
  avgDays: number;
  userCount: number;
  conversionRate: number;
}

interface JourneyResponse {
  totalUsers: number;
  milestones: MilestoneStats[];
  transitions: JourneyTransition[];
  timeframe: string;
}

// Display names and order for milestones
const MILESTONE_INFO: Record<string, { displayName: string; order: number }> = {
  SIGNUP: { displayName: "Sign Up", order: 1 },
  FIRST_LOGIN: { displayName: "First Login", order: 2 },
  EXTENSION_INSTALLED: { displayName: "Extension Installed", order: 3 },
  EXTENSION_ACTIVATED: { displayName: "Extension Activated", order: 4 },
  ONBOARDING_STARTED: { displayName: "Onboarding Started", order: 5 },
  ONBOARDING_COMPLETED: { displayName: "Onboarding Completed", order: 6 },
  ONBOARDING_SKIPPED: { displayName: "Onboarding Skipped", order: 7 },
  FIRST_COMMENT: { displayName: "First Comment", order: 8 },
  FIFTH_COMMENT: { displayName: "Fifth Comment", order: 9 },
  TENTH_COMMENT: { displayName: "Tenth Comment", order: 10 },
  FIRST_LIKE: { displayName: "First Like", order: 11 },
  FIRST_AUTO_COMMENT_SETUP: { displayName: "Auto Comment Setup", order: 12 },
  FIRST_AUTO_COMMENT_EXECUTED: { displayName: "Auto Comment Executed", order: 13 },
  FIRST_TASK_CREATED: { displayName: "Task Created", order: 14 },
  FIRST_TEAM_MEMBER_ADDED: { displayName: "Team Member Added", order: 15 },
  BUSINESS_PROFILE_COMPLETED: { displayName: "Business Profile Completed", order: 16 },
  PLATFORM_CONNECTED: { displayName: "Platform Connected", order: 17 },
  LICENSE_ACTIVATED: { displayName: "License Activated", order: 18 },
  PREMIUM_UPGRADED: { displayName: "Premium Upgrade", order: 19 },
  HIGH_QUALITY_LEAD_IDENTIFIED: { displayName: "High Quality Lead", order: 20 },
  ADVANCED_FEATURE_USED: { displayName: "Advanced Feature Used", order: 21 },
  EXTENSION_UNINSTALLED: { displayName: "Extension Uninstalled", order: 22 },
};

/**
 * GET endpoint for simplified user journey analytics
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
    
    // Get total user count in timeframe
    const totalUsers = await prismadb.user.count({
      where: dateRange ? { createdAt: dateRange } : {},
    });

    // Get milestone statistics
    const milestones = await getMilestoneStats(totalUsers, dateRange);
    
    // Get transitions between sequential milestone pairs
    const transitions = await getSequentialTransitions(dateRange);

    const response: JourneyResponse = {
      totalUsers,
      milestones,
      transitions,
      timeframe,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user journey analytics:", error);
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

/**
 * Get milestone completion statistics
 */
async function getMilestoneStats(
  totalUsers: number, 
  dateRange: { gte: Date } | null
): Promise<MilestoneStats[]> {
  // Get milestone counts
  const milestoneCounts = await prismadb.userJourneyMilestone.groupBy({
    by: ["milestone"],
    _count: { milestone: true },
    where: dateRange ? { achievedAt: dateRange } : {},
  });
  
  // Get average days from signup for each milestone
  let avgDaysQuery;
  if (dateRange) {
    avgDaysQuery = await prismadb.$queryRaw<Array<{ milestone: string; avgDays: number }>>`
      SELECT 
        ujm.milestone::text, 
        AVG(EXTRACT(EPOCH FROM (ujm."achievedAt" - u."createdAt")) / 86400) as "avgDays"
      FROM "UserJourneyMilestone" ujm
      JOIN "User" u ON ujm."userId" = u.id
      WHERE ujm."achievedAt" >= ${dateRange.gte}
      GROUP BY ujm.milestone
    `;
  } else {
    avgDaysQuery = await prismadb.$queryRaw<Array<{ milestone: string; avgDays: number }>>`
      SELECT 
        ujm.milestone::text, 
        AVG(EXTRACT(EPOCH FROM (ujm."achievedAt" - u."createdAt")) / 86400) as "avgDays"
      FROM "UserJourneyMilestone" ujm
      JOIN "User" u ON ujm."userId" = u.id
      GROUP BY ujm.milestone
    `;
  }
  
  // Build milestone stats
  const milestoneStats: MilestoneStats[] = [];
  
  for (const [milestone, info] of Object.entries(MILESTONE_INFO)) {
    const count = milestoneCounts.find(m => m.milestone === milestone)?._count?.milestone || 0;
    const avgDaysFromSignup = avgDaysQuery.find(m => m.milestone === milestone)?.avgDays || 0;
    
    milestoneStats.push({
      milestone,
      displayName: info.displayName,
      order: info.order,
      count,
      completionRate: totalUsers > 0 ? count / totalUsers : 0,
      avgDaysFromSignup,
    });
  }
  
  return milestoneStats.sort((a, b) => a.order - b.order);
}

/**
 * Get transitions between sequential milestones
 */
async function getSequentialTransitions(
  dateRange: { gte: Date } | null
): Promise<JourneyTransition[]> {
  const transitions: JourneyTransition[] = [];
  
  // Sort milestones by order
  const orderedMilestones = Object.entries(MILESTONE_INFO)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([key]) => key);
  
  // For each pair of sequential milestones
  for (let i = 0; i < orderedMilestones.length - 1; i++) {
    const fromMilestone = orderedMilestones[i];
    const toMilestone = orderedMilestones[i + 1];
    
    // Skip extension uninstalled transition as it's not part of forward progression
    if (fromMilestone === "EXTENSION_UNINSTALLED" || toMilestone === "EXTENSION_UNINSTALLED") {
      continue;
    }
    
    // Find users who completed both milestones and calculate time between
    let results;
    
    if (dateRange) {
      results = await prismadb.$queryRaw<
        Array<{ userId: string; daysDiff: number }>
      >`
        SELECT
          a."userId",
          EXTRACT(EPOCH FROM (b."achievedAt" - a."achievedAt")) / 86400 as "daysDiff"
        FROM
          "UserJourneyMilestone" a
        JOIN
          "UserJourneyMilestone" b
        ON
          a."userId" = b."userId"
        WHERE
          a.milestone::text = ${fromMilestone}
          AND b.milestone::text = ${toMilestone}
          AND a."achievedAt" <= b."achievedAt"
          AND a."achievedAt" >= ${dateRange.gte}
      `;
    } else {
      results = await prismadb.$queryRaw<
        Array<{ userId: string; daysDiff: number }>
      >`
        SELECT
          a."userId",
          EXTRACT(EPOCH FROM (b."achievedAt" - a."achievedAt")) / 86400 as "daysDiff"
        FROM
          "UserJourneyMilestone" a
        JOIN
          "UserJourneyMilestone" b
        ON
          a."userId" = b."userId"
        WHERE
          a.milestone::text = ${fromMilestone}
          AND b.milestone::text = ${toMilestone}
          AND a."achievedAt" <= b."achievedAt"
      `;
    }
    
    // Get counts to calculate conversion rates
    const fromCount = await prismadb.userJourneyMilestone.count({
      where: {
        milestone: fromMilestone as MilestoneType,
        ...(dateRange ? { achievedAt: dateRange } : {}),
      },
    });
    
    // Calculate average transition time
    const userCount = results.length;
    const totalDays = results.reduce((sum, r) => sum + r.daysDiff, 0);
    const avgDays = userCount > 0 ? totalDays / userCount : 0;
    const conversionRate = fromCount > 0 ? userCount / fromCount : 0;
    
    transitions.push({
      fromMilestone,
      fromDisplayName: MILESTONE_INFO[fromMilestone].displayName,
      toMilestone,
      toDisplayName: MILESTONE_INFO[toMilestone].displayName,
      avgDays,
      userCount,
      conversionRate,
    });
  }
  
  return transitions;
}
