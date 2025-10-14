import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import prismadb from "@/lib/prismadb";
import DashboardContent from "../_components/dashboard-content";
import { PlanTier, PlanDuration, PlanVendor } from "@repo/db";

// Helper function to fetch active plan
async function fetchActivePlan() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/user/plans`,
      {
        method: "GET",
        headers: {
          Cookie: (await headers()).get("cookie") || "",
        },
      },
    );
    const planData = await response.json();
    return planData.plans?.[0] || null;
  } catch (error) {
    console.error("Failed to fetch active plan:", error);
    return null;
  }
}

// Helper function to fetch all license-related data in parallel
async function fetchLicenseData(userId: string, userEmail: string) {
  const [rawLicenses, rawSubLicenses, apiKeys] = await Promise.all([
    prismadb.userLicenseKey.findMany({
      where: { userId },
      select: {
        userId: true,
        licenseKeyId: true,
        assignedAt: true,
        licenseKey: {
          select: {
            id: true,
            key: true,
            isActive: true,
            tier: true,
            vendor: true,
            lemonProductId: true,
          },
        },
      },
    }),
    prismadb.subLicense.findMany({
      where: { assignedEmail: userEmail },
      select: {
        id: true,
        key: true,
        status: true,
        assignedEmail: true,
        mainLicenseKey: {
          select: {
            id: true,
            tier: true,
            vendor: true,
            lemonProductId: true,
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),
    prismadb.userApiKey.findMany({
      where: { userId },
      include: { apiKey: true },
    }),
  ]);

  // Process licenses
  const licenses = rawLicenses.map((license) => ({
    ...license,
    licenseKey: {
      ...license.licenseKey,
      vendor: license.licenseKey.vendor || "unknown",
    },
  }));

  // Process sub-licenses
  const subLicenses = rawSubLicenses.map((subLicense) => ({
    id: subLicense.id,
    key: subLicense.key,
    status: subLicense.status,
    assignedEmail: subLicense.assignedEmail,
    mainLicenseKey: {
      id: subLicense.mainLicenseKey.id,
      tier: subLicense.mainLicenseKey.tier,
      vendor: subLicense.mainLicenseKey.vendor || "unknown",
      lemonProductId: subLicense.mainLicenseKey.lemonProductId,
    },
    organization: subLicense.mainLicenseKey.organization || undefined
  }));

  // Check if user has any premium licenses
  const hasPremiumLicense =
    licenses.some(l => l.licenseKey.isActive) ||
    subLicenses.some(s => s.status === 'ACTIVE');

  return {
    licenses,
    subLicenses,
    apiKeys,
    hasPremiumLicense,
  };
}

// Helper function to get license key IDs for usage tracking
function getLicenseKeyIds(licenses: any[], subLicenses: any[]) {
  const userLicenseKeyIds = licenses.map((l) => l.licenseKey.id);
  const subLicenseIds = subLicenses.map((sl) => sl.id);
  return [...userLicenseKeyIds, ...subLicenseIds];
}

// Helper function to fetch usage logs with date calculations
async function fetchUsageLogs(licenseKeyIds: string[], userId: string, hasPremiumLicense: boolean) {
  if (!hasPremiumLicense) {
    return [];
  }

  // Calculate the date range
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const usageLogs = await prismadb.usageTracking.groupBy({
    by: ["action", "platform", "createdAt"],
    _count: {
      _all: true,
    },
    where: {
      OR: [
        { licenseKeyId: { in: licenseKeyIds } },
        { userId: userId }
      ],
      createdAt: {
        gte: sevenDaysAgo,
        lte: today,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Format usage logs
  const formattedUsageLogs: {
    date: string;
    total: number;
    [key: string]: number | string | { [action: string]: number };
  }[] = [];

  usageLogs.forEach((log) => {
    const date = log.createdAt.toISOString().split("T")[0];
    let dateEntry = formattedUsageLogs.find((entry) => entry.date === date);

    if (!dateEntry) {
      dateEntry = { date, total: 0 };
      formattedUsageLogs.push(dateEntry);
    }

    const platform = log.platform as string;
    const action = log.action as string;

    if (!dateEntry[platform]) {
      dateEntry[platform] = {};
    }

    (dateEntry[platform] as { [action: string]: number })[action] =
      log._count._all;
    dateEntry.total += log._count._all;
  });

  // Fill in missing days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();

  return last7Days.map((date) => {
    return (
      formattedUsageLogs.find((log) => log.date === date) || { date, total: 0 }
    );
  });
}

// Helper function to fetch secondary data (goals and leaderboard)
async function fetchSecondaryData(userId: string, userEmail: string, licenseKeyIds: string[], subLicenseIds: string[]) {
  // Separate main license key IDs from the combined array
  const mainLicenseKeyIds = licenseKeyIds.slice(0, licenseKeyIds.length - subLicenseIds.length);
  const results = await Promise.allSettled([
    // Leaderboard
    prismadb.leaderboard.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
        updatedAt: true,
        freeUserId: true,
        level: true,
        totalComments: true,
      },
    }),
    // Sub-license goals - fetch ALL goals for sublicenses assigned to this user
    subLicenseIds.length > 0 ? prismadb.subLicenseGoal.findMany({
      where: {
        subLicenseId: { in: subLicenseIds },
        subLicense: {
          OR: [
            { assignedUserId: userId },
            { assignedEmail: userEmail }
          ]
        }
        // Removed userId filter so sublicense users see ALL goals for their sublicense
      },
      select: {
        id: true,
        goal: true,
        daysToAchieve: true,
        platform: true,
        userId: true,
        target: true,
        progress: true,
        status: true,
        achievedAt: true,
        createdAt: true,
        subLicense: {
          select: {
            mainLicenseKey: {
              select: {
                organization: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    }) : Promise.resolve([]),
    // License goals - only for main licenses (not sublicenses)
    prismadb.licenseGoal.findMany({
      where: {
        userId,
        licenseKeyId: { in: mainLicenseKeyIds },
      },
      select: {
        id: true,
        goal: true,
        daysToAchieve: true,
        platform: true,
        target: true,
        progress: true,
        status: true,
        achievedAt: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    leaderboard: results[0].status === 'fulfilled' ? results[0].value : null,
    subLicenseGoals: results[1].status === 'fulfilled' ? results[1].value : [],
    licenseGoals: results[2].status === 'fulfilled' ? results[2].value : [],
  };
}

export default async function Page() {
  // TIER 1 - IMMEDIATE: Critical data needed for basic rendering
  const immediateResults = await Promise.all([
    validateRequest(),
    fetchActivePlan(),
  ]);

  const { user } = immediateResults[0];
  const activePlan = immediateResults[1];

  // Handle redirects immediately
  if (!user) {
    return redirect("/login");
  }

  if (!user.onboardingComplete) {
    return redirect("/onboarding");
  }

  // TIER 2 - PRIORITY: Essential dashboard data
  const priorityResults = await Promise.all([
    fetchLicenseData(user.id, user.email),
  ]);

  const { licenses, subLicenses, apiKeys, hasPremiumLicense } = priorityResults[0];

  // Get license key IDs for subsequent queries
  const licenseKeyIds = getLicenseKeyIds(licenses, subLicenses);
  const subLicenseIds = subLicenses.map((sl) => sl.id);

  // TIER 3 - SECONDARY: Additional data that can load progressively
  const secondaryResults = await Promise.allSettled([
    fetchUsageLogs(licenseKeyIds, user.id, hasPremiumLicense),
    fetchSecondaryData(user.id, user.email, licenseKeyIds, subLicenseIds),
  ]);

  // Extract secondary data with fallbacks
  const usageLogs = secondaryResults[0].status === 'fulfilled' ? secondaryResults[0].value : [];
  const secondaryData = secondaryResults[1].status === 'fulfilled' ? secondaryResults[1].value : {
    leaderboard: null,
    subLicenseGoals: [],
    licenseGoals: [],
  };

  const { leaderboard, subLicenseGoals, licenseGoals } = secondaryData;

  // Calculate total goals
  const totalGoals = subLicenseGoals.length + licenseGoals.length;

  // Render with all available data
  return (
    <DashboardContent
      user={{
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      }}
      licenses={licenses}
      subLicenses={subLicenses}
      apiKeys={apiKeys}
      leaderboard={leaderboard}
      usageLogs={usageLogs}
      subLicenseGoals={subLicenseGoals}
      licenseGoals={licenseGoals}
      totalGoals={totalGoals}
      activePlan={activePlan}
      hasPremiumLicense={hasPremiumLicense}
    />
  );
}