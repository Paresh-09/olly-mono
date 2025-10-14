// app/api/admin/user-usage/route.ts (Enhanced Version)
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@repo/db";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Check admin permissions first
    const isAdmin = await checkAdminPermissions(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const includeHistory = searchParams.get("includeHistory") === "true";
    const days = parseInt(searchParams.get("days") || "30");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Find user with comprehensive data
    const user = await fetchUserWithRelations(email, days);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate all analytics
    const [
      usageStats,
      platformUsage,
      recentActivity,
      licenseKeys,
      engagementMetrics,
      timeBasedAnalytics,
      deviceInfo,
    ] = await Promise.all([
      calculateUsageStats(user.id, days),
      calculatePlatformUsage(user.id, days),
      getRecentActivity(user.id, days),
      getLicenseKeysWithDetails(user.id),
      calculateEngagementMetrics(user.id, days),
      getTimeBasedAnalytics(user.id, days),
      getDeviceAndLocationInfo(user.id),
    ]);

    // Format comprehensive response
    const response = {
      user: formatUserInfo(user),
      licenseKeys,
      usageStats,
      platformUsage,
      autoCommentingConfigs: formatAutoCommentingConfigs(
        user.autoCommenterConfigs,
      ),
      recentActivity,
      subscriptions: formatSubscriptions(user.subscriptions),
      installations: formatInstallations(user.installations),
      credits: formatCreditsInfo(user.credit),
      engagementMetrics,
      timeBasedAnalytics,
      deviceInfo,
      organizations: formatOrganizations(user.organizations),
      ...(includeHistory && {
        detailedHistory: await getDetailedHistory(user.id, days),
      }),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user usage data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function fetchUserWithRelations(email: string, days: number) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);

  return await prisma.user.findUnique({
    where: { email },
    include: {
      licenseKeys: {
        include: {
          licenseKey: {
            include: {
              subscriptions: {
                include: { plan: true },
              },
              usageTracking: {
                where: {
                  createdAt: { gte: dateThreshold },
                },
              },
            },
          },
        },
      },
      subscriptions: {
        include: {
          plan: true,
          licenseKey: true,
        },
      },
      credit: {
        include: {
          transactions: {
            orderBy: { createdAt: "desc" },
            take: 50,
          },
        },
      },
      usageTracking: {
        where: {
          createdAt: { gte: dateThreshold },
        },
        orderBy: { createdAt: "desc" },
      },
      autoCommenterConfigs: {
        include: {
          commentHistory: {
            where: {
              createdAt: { gte: dateThreshold },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      },
      autoCommenterHistory: {
        where: {
          createdAt: { gte: dateThreshold },
        },
        orderBy: { createdAt: "desc" },
      },
      installations: {
        orderBy: { installedAt: "desc" },
      },
      activations: {
        include: { licenseKey: true },
        orderBy: { activatedAt: "desc" },
        take: 10,
      },
      organizations: {
        include: {
          organization: {
            include: {
              plan: true,
            },
          },
        },
      },
      onboarding: true,
      journeyMilestones: {
        orderBy: { achievedAt: "desc" },
      },
    },
  });
}

async function calculateUsageStats(userId: string, days: number) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);

  const [usageData, autoCommentHistory, freeComments, apiUsages] =
    await Promise.all([
      prisma.usageTracking.findMany({
        where: {
          userId,
          createdAt: { gte: dateThreshold },
        },
      }),
      prisma.autoCommenterHistory.findMany({
        where: {
          userId,
          createdAt: { gte: dateThreshold },
        },
      }),
      prisma.freeComment.count({
        where: {
          licenseKey: {
            users: {
              some: { userId },
            },
          },
          createdAt: { gte: dateThreshold },
        },
      }),
      prisma.apiUsage.count({
        where: {
          licenseKey: {
            users: {
              some: { userId },
            },
          },
          createdAt: { gte: dateThreshold },
        },
      }),
    ]);

  const actionCounts = usageData.reduce(
    (acc, usage) => {
      acc[usage.action] = (acc[usage.action] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const autoCommentsByStatus = autoCommentHistory.reduce(
    (acc, comment) => {
      acc[comment.status] = (acc[comment.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    totalComments: actionCounts.comment || 0,
    autoComments: autoCommentsByStatus.POSTED || 0,
    manualComments:
      (actionCounts.comment || 0) - (autoCommentsByStatus.POSTED || 0),
    totalLikes: actionCounts.like || 0,
    totalShares: actionCounts.share || 0,
    freeComments,
    apiUsages,
    pendingAutoComments: autoCommentsByStatus.PENDING || 0,
    failedAutoComments: autoCommentsByStatus.FAILED || 0,
    skippedAutoComments: autoCommentsByStatus.SKIPPED || 0,
  };
}

async function calculatePlatformUsage(userId: string, days: number) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);

  const [usageData, autoCommentHistory] = await Promise.all([
    prisma.usageTracking.findMany({
      where: {
        userId,
        createdAt: { gte: dateThreshold },
      },
    }),
    prisma.autoCommenterHistory.findMany({
      where: {
        userId,
        createdAt: { gte: dateThreshold },
      },
    }),
  ]);

  const platformStats: Record<
    string,
    {
      comments: number;
      likes: number;
      shares: number;
      autoComments: number;
      manualComments: number;
    }
  > = {};

  // Process usage tracking data
  usageData.forEach((usage) => {
    const platform = usage.platform?.toLowerCase() || "unknown";
    if (!platformStats[platform]) {
      platformStats[platform] = {
        comments: 0,
        likes: 0,
        shares: 0,
        autoComments: 0,
        manualComments: 0,
      };
    }

    if (usage.action === "comment") {
      platformStats[platform].comments++;
      platformStats[platform].manualComments++;
    }
    if (usage.action === "like") platformStats[platform].likes++;
    if (usage.action === "share") platformStats[platform].shares++;
  });

  // Add auto comment history
  autoCommentHistory.forEach((history) => {
    if (history.status === "POSTED") {
      const platform = history.platform?.toLowerCase() || "unknown";
      if (!platformStats[platform]) {
        platformStats[platform] = {
          comments: 0,
          likes: 0,
          shares: 0,
          autoComments: 0,
          manualComments: 0,
        };
      }
      platformStats[platform].comments++;
      platformStats[platform].autoComments++;
    }
  });

  return platformStats;
}

async function calculateEngagementMetrics(userId: string, days: number) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);

  const autoCommentHistory = await prisma.autoCommenterHistory.findMany({
    where: {
      userId,
      createdAt: { gte: dateThreshold },
    },
  });

  const totalAttempts = autoCommentHistory.length;
  const successfulComments = autoCommentHistory.filter(
    (h) => h.status === "POSTED",
  ).length;
  const failedComments = autoCommentHistory.filter(
    (h) => h.status === "FAILED",
  ).length;

  const successRate =
    totalAttempts > 0 ? (successfulComments / totalAttempts) * 100 : 0;

  // Calculate average comments per day
  const avgCommentsPerDay = totalAttempts > 0 ? totalAttempts / days : 0;

  return {
    totalAttempts,
    successfulComments,
    failedComments,
    successRate: parseFloat(successRate.toFixed(2)),
    avgCommentsPerDay: parseFloat(avgCommentsPerDay.toFixed(2)),
  };
}

async function getTimeBasedAnalytics(userId: string, days: number) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);

  const usageData = await prisma.usageTracking.findMany({
    where: {
      userId,
      createdAt: { gte: dateThreshold },
    },
    orderBy: { createdAt: "asc" },
  });

  // Group by hour of day
  const hourlyActivity = new Array(24).fill(0);
  const dailyActivity: Record<string, number> = {};

  usageData.forEach((usage) => {
    const hour = usage.createdAt.getHours();
    const date = usage.createdAt.toISOString().split("T")[0];

    hourlyActivity[hour]++;
    dailyActivity[date] = (dailyActivity[date] || 0) + 1;
  });

  return {
    hourlyActivity,
    dailyActivity,
    totalDaysActive: Object.keys(dailyActivity).length,
    avgActivityPerActiveDay:
      Object.keys(dailyActivity).length > 0
        ? Object.values(dailyActivity).reduce((a, b) => a + b, 0) /
          Object.keys(dailyActivity).length
        : 0,
  };
}

async function getDeviceAndLocationInfo(userId: string) {
  const activations = await prisma.activation.findMany({
    where: { userId },
    orderBy: { activatedAt: "desc" },
    take: 10,
  });

  const deviceTypes = activations.reduce(
    (acc, activation) => {
      const device = activation.deviceType || "Unknown";
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const browsers = activations.reduce(
    (acc, activation) => {
      const browser = activation.browser || "Unknown";
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    deviceTypes,
    browsers,
    totalActivations: activations.length,
    // @ts-ignore
    uniqueIPs: [...new Set(activations.map((a) => a.ipAddress).filter(Boolean))]
      .length,
  };
}

async function getDetailedHistory(userId: string, days: number) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);

  const [usageHistory, autoCommentHistory, creditTransactions] =
    await Promise.all([
      prisma.usageTracking.findMany({
        where: {
          userId,
          createdAt: { gte: dateThreshold },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.autoCommenterHistory.findMany({
        where: {
          userId,
          createdAt: { gte: dateThreshold },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.creditTransaction.findMany({
        where: {
          userCredit: {
            userId,
          },
          createdAt: { gte: dateThreshold },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

  return {
    usageHistory,
    autoCommentHistory,
    creditTransactions,
  };
}

// Helper formatting functions
function formatUserInfo(user: any) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    isPremium: user.isPaidUser,
    isActive: !user.deactivated,
    lastActivity: getLastActivity(user),
    isAdmin: user.isAdmin,
    isSuperAdmin: user.isSuperAdmin,
    isBetaTester: user.isBetaTester,
    isSupport: user.isSupport,
    onboardingComplete: user.onboardingComplete,
    signInMethod: user.signInMethod,
    signupSource: user.signupSource,
    isEmailVerified: user.isEmailVerified,
    hasClaimedOnboardingCredits: user.hasClaimedOnboardingCredits,
    milestones: user.journeyMilestones?.length || 0,
    currentStreak: user.userStreak?.currentStreak || 0,
    maxStreak: user.userStreak?.maxStreak || 0,
  };
}

function formatAutoCommentingConfigs(configs: any[]) {
  return configs.map((config) => ({
    id: config.id,
    platform: config.platform,
    isEnabled: config.isEnabled,
    timeInterval: config.timeInterval,
    postsPerDay: config.postsPerDay,
    hashtags: config.hashtags,
    enabledPlatforms: config.enabledPlatforms,
    useBrandVoice: config.useBrandVoice,
    lastRun: getLastAutoCommentRun(config.commentHistory),
    totalComments: config.commentHistory.length,
    successfulComments: config.commentHistory.filter(
      (h: any) => h.status === "POSTED",
    ).length,
    failedComments: config.commentHistory.filter(
      (h: any) => h.status === "FAILED",
    ).length,
    createdAt: config.createdAt,
    updatedAt: config.updatedAt,
  }));
}

function formatSubscriptions(subscriptions: any[]) {
  return subscriptions.map((sub) => ({
    id: sub.id,
    planId: sub.planId,
    planName: sub.plan?.name,
    planTier: sub.plan?.tier,
    status: sub.status,
    startDate: sub.startDate,
    endDate: sub.endDate,
    nextBillingDate: sub.nextBillingDate,
    vendor: sub.plan?.vendor,
    licenseKey: sub.licenseKey?.key,
    vendorSubId: sub.vendorSubId,
    customerId: sub.customerId,
  }));
}

function formatInstallations(installations: any[]) {
  return installations.map((install) => ({
    id: install.id,
    status: install.status,
    installedAt: install.installedAt,
    uninstalledAt: install.uninstalledAt,
    reason: install.reason,
    specificReason: install.specificReason,
    additionalFeedback: install.additionalFeedback,
  }));
}

function formatCreditsInfo(credit: any) {
  return {
    balance: credit?.balance || 0,
    totalTransactions: credit?.transactions?.length || 0,
    recentTransactions: credit?.transactions?.slice(0, 10) || [],
    totalSpent:
      credit?.transactions
        ?.filter((t: any) => t.type === "SPENT")
        ?.reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0) || 0,
    totalEarned:
      credit?.transactions
        ?.filter((t: any) => t.type === "EARNED")
        ?.reduce((sum: number, t: any) => sum + t.amount, 0) || 0,
  };
}

function formatOrganizations(organizations: any[]) {
  return organizations.map((org) => ({
    id: org.organization.id,
    name: org.organization.name,
    role: org.role,
    assignedAt: org.assignedAt,
    isPremium: org.organization.isPremium,
    planName: org.organization.plan?.name,
  }));
}

async function getRecentActivity(userId: string, days: number) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);

  const [recentUsage, recentAutoComments] = await Promise.all([
    prisma.usageTracking.findMany({
      where: {
        userId,
        createdAt: { gte: dateThreshold },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.autoCommenterHistory.findMany({
      where: {
        userId,
        createdAt: { gte: dateThreshold },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Group by date
  const activityByDate: Record<
    string,
    {
      date: string;
      comments: number;
      autoComments: number;
      likes: number;
      shares: number;
      platform: string;
      platforms: Set<string>;
    }
  > = {};

  // Process manual usage
  recentUsage.forEach((usage) => {
    const date = usage.createdAt.toISOString().split("T")[0];
    if (!activityByDate[date]) {
      activityByDate[date] = {
        date,
        comments: 0,
        autoComments: 0,
        likes: 0,
        shares: 0,
        platform: usage.platform || "Unknown",
        platforms: new Set(),
      };
    }

    activityByDate[date].platforms.add(usage.platform || "Unknown");

    if (usage.action === "comment") {
      activityByDate[date].comments++;
    }
    if (usage.action === "like") {
      activityByDate[date].likes++;
    }
    if (usage.action === "share") {
      activityByDate[date].shares++;
    }
  });

  // Process auto comments
  recentAutoComments.forEach((comment) => {
    if (comment.status === "POSTED") {
      const date = comment.createdAt.toISOString().split("T")[0];
      if (!activityByDate[date]) {
        activityByDate[date] = {
          date,
          comments: 0,
          autoComments: 0,
          likes: 0,
          shares: 0,
          platform: comment.platform || "Unknown",
          platforms: new Set(),
        };
      }

      activityByDate[date].platforms.add(comment.platform || "Unknown");
      activityByDate[date].autoComments++;
      activityByDate[date].comments++;
    }
  });

  // Format and return
  return Object.values(activityByDate)
    .map((activity) => ({
      ...activity,
      platform: activity.platforms.size > 1 ? "Multiple" : activity.platform,
      platforms: Array.from(activity.platforms),
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 15);
}

async function getLicenseKeysWithDetails(userId: string) {
  const userLicenseKeys = await prisma.userLicenseKey.findMany({
    where: { userId },
    include: {
      licenseKey: {
        include: {
          subscriptions: {
            include: {
              plan: true,
            },
          },
          usageTracking: {
            where: {
              userId,
            },
            take: 10,
            orderBy: {
              createdAt: "desc",
            },
          },
          activations: {
            where: {
              userId,
            },
            take: 5,
            orderBy: {
              activatedAt: "desc",
            },
          },
          settings: true,
        },
      },
    },
  });

  return userLicenseKeys.map((ulk) => ({
    id: ulk.licenseKey.id,
    key: ulk.licenseKey.key,
    isActive: ulk.licenseKey.isActive,
    activatedAt: ulk.licenseKey.activatedAt,
    expiresAt: ulk.licenseKey.expiresAt,
    tier: ulk.licenseKey.tier,
    vendor: ulk.licenseKey.vendor,
    assignedAt: ulk.assignedAt,
    activationCount: ulk.licenseKey.activationCount,
    deActivatedAt: ulk.licenseKey.deActivatedAt,
    recentUsage: ulk.licenseKey.usageTracking.length,
    recentActivations: ulk.licenseKey.activations.length,
    settings: ulk.licenseKey.settings,
    subscriptions: ulk.licenseKey.subscriptions.map((sub) => ({
      id: sub.id,
      planName: sub.plan?.name,
      status: sub.status,
      vendor: sub.plan?.vendor,
    })),
  }));
}

function getLastActivity(user: any) {
  const activities = [
    user.usageTracking?.[0]?.createdAt,
    user.autoCommenterHistory?.[0]?.createdAt,
    user.activations?.[0]?.activatedAt,
    user.updatedAt,
  ].filter(Boolean);

  if (activities.length === 0) return user.createdAt;

  return activities.reduce((latest, current) =>
    new Date(current) > new Date(latest) ? current : latest,
  );
}

function getLastAutoCommentRun(commentHistory: any[]) {
  if (!commentHistory || commentHistory.length === 0) return null;

  const lastPosted = commentHistory.find((h) => h.status === "POSTED");
  const lastAttempt = commentHistory[0]; // Most recent regardless of status

  return {
    lastPosted: lastPosted?.createdAt || null,
    lastAttempt: lastAttempt?.createdAt || null,
    lastStatus: lastAttempt?.status || null,
  };
}

// Admin permission check function
async function checkAdminPermissions(request: NextRequest) {
  try {
    // Option 1: Check via Authorization header (JWT)
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      // Implement your JWT verification logic here
      // const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // return decoded.isAdmin || decoded.isSuperAdmin;
    }

    // Option 2: Check via session cookie
    const sessionCookie = request.cookies.get("session")?.value;
    if (sessionCookie) {
      // Implement your session verification logic here
      // const session = await verifySession(sessionCookie);
      // return session.user.isAdmin || session.user.isSuperAdmin;
    }

    // Option 3: Check via custom header (for internal APIs)
    const adminKey = request.headers.get("x-admin-key");
    if (adminKey && adminKey === process.env.ADMIN_API_KEY) {
      return true;
    }

    // For development/testing - remove in production
    if (process.env.NODE_ENV === "development") {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking admin permissions:", error);
    return false;
  }
}

// Additional utility functions for analytics

async function getUserGrowthMetrics(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      journeyMilestones: {
        orderBy: { achievedAt: "asc" },
      },
    },
  });

  if (!user) return null;

  const accountAge = Math.floor(
    (new Date().getTime() - new Date(user.createdAt).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  const milestonesByType = user.journeyMilestones.reduce(
    (acc, milestone) => {
      acc[milestone.milestone] = milestone.achievedAt;
      return acc;
    },
    {} as Record<string, Date>,
  );

  return {
    accountAge,
    totalMilestones: user.journeyMilestones.length,
    milestonesByType,
    timeToFirstComment: milestonesByType.FIRST_COMMENT
      ? Math.floor(
          (new Date(milestonesByType.FIRST_COMMENT).getTime() -
            new Date(user.createdAt).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : null,
    timeToFirstAutoComment: milestonesByType.FIRST_AUTO_COMMENT_SETUP
      ? Math.floor(
          (new Date(milestonesByType.FIRST_AUTO_COMMENT_SETUP).getTime() -
            new Date(user.createdAt).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : null,
  };
}

// Export additional endpoint for user search suggestions
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminPermissions(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchTerm } = await request.json();

    if (!searchTerm || searchTerm.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const suggestions = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: searchTerm, mode: "insensitive" } },
          { name: { contains: searchTerm, mode: "insensitive" } },
          { username: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        isPaidUser: true,
        isAdmin: true,
        createdAt: true,
      },
      take: 10,
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
