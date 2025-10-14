// app/api/user/plan/route.ts
import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { PlanTier, PlanDuration, PlanVendor } from "@repo/db";

// Constants for vendor-specific plan details
const VENDOR = {
  APPSUMO: 'appsumo',
  LEMON: 'lemonsqueezy',
  INTERNAL: 'olly'
} as const;

// AppSumo tier details
const APPSUMO_TIERS = {
  T1: { tier: 1, name: 'Individual', subLicenses: 1 },
  T2: { tier: 2, name: 'Team', subLicenses: 5 },
  T3: { tier: 3, name: 'Agency', subLicenses: 10 },
  T4: { tier: 4, name: 'Enterprise', subLicenses: 20 },
} as const;

// LemonSqueezy product mappings
const LEMON_PRODUCTS = {
  INDIVIDUAL: { ids: [process.env.LEMON_INDIVIDUAL_PRODUCT_ID], name: 'Individual', subLicenses: 1 },
  TEAM: { ids: [process.env.LEMON_TEAM_PRODUCT_ID], name: 'Team', subLicenses: 5 },
  AGENCY: { ids: [process.env.LEMON_AGENCY_PRODUCT_ID], name: 'Agency', subLicenses: 10 },
  ENTERPRISE: { ids: [process.env.LEMON_ENTERPRISE_PRODUCT_ID], name: 'Enterprise', subLicenses: 20 },
} as const;

// Helper function to get AppSumo tier details
function getAppSumoTierDetails(tier: number) {
  const tierKey = `T${tier}` as keyof typeof APPSUMO_TIERS;
  return APPSUMO_TIERS[tierKey] || APPSUMO_TIERS.T1;
}

// Helper function to get LemonSqueezy plan details
function getLemonPlanDetails(productId: number) {
  for (const [key, value] of Object.entries(LEMON_PRODUCTS)) {
    if (value.ids.includes(String(productId))) {
      return value;
    }
  }
  return LEMON_PRODUCTS.INDIVIDUAL;
}

// Define types for the response data
interface PlanDetails {
  name: string;
  vendor?: PlanVendor | string | null;
  tier?: PlanTier | number | null;
  subLicenses: number;
  maxSubLicenses?: number;
  duration: PlanDuration | string;
  expiresAt?: Date | null;
  isTeamConverted?: boolean | null;
  key: string;
  activeSubLicenses?: number;
  totalSubLicenses?: number;
  canUpgrade?: boolean;
}

interface SubLicense {
  key: string;
  status: string;
  assignedUserId?: string;
  assignedEmail?: string;
}

interface LicenseKeyPlan {
  key: string;
  vendor?: string;
  tier?: number;
  isActive: boolean;
  planId?: string;
  subLicenses?: SubLicense[];
  expiresAt?: Date;
  lemonProductId?: number;
  converted_to_team?: boolean;
  deActivatedAt?: Date;
}

interface SubscriptionPlan {
  plan: {
    name: string;
    tier?: number;
    duration?: string;
    vendor?: string;
    maxUsers: number;
  };
  endDate?: Date;
  licenseKey?: {
    key: string;
    subLicenses?: number;
  };
}

interface UserWithPlans {
  licenseKeys: Array<{
    licenseKey: LicenseKeyPlan;
  }>;
  subscriptions: SubscriptionPlan[];
}

export async function GET() {
  try {
    const { user } = await validateRequest();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Modified query to only fetch through licenseKeys relation
    const userWithPlans = await prismadb.user.findUnique({
      where: { id: user.id },
      select: {
        licenseKeys: {
          include: {
            licenseKey: {
              select: {
                key: true,
                vendor: true,
                tier: true,
                isActive: true,
                planId: true,
                expiresAt: true,
                lemonProductId: true,
                converted_to_team: true,
                deActivatedAt: true,
                subLicenses: {
                  select: {
                    key: true,
                    status: true,
                    assignedUserId: true,
                    assignedEmail: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!userWithPlans) {
      return NextResponse.json({ plans: [], hasPremium: false });
    }

    // Process only license key based plans
    const plans: PlanDetails[] = userWithPlans.licenseKeys
      .filter(({ licenseKey }) => 
        licenseKey.isActive && 
        !licenseKey.deActivatedAt && 
        (!licenseKey.expiresAt || new Date(licenseKey.expiresAt) > new Date())
      )
      .map(({ licenseKey }) => {
        // Consider the main license as active if the license key is active
        const mainLicenseActive = licenseKey.isActive && !licenseKey.deActivatedAt;
        const activeSubLicenses = licenseKey.subLicenses?.filter(sub => sub.status === "ACTIVE")?.length || 0;
        // Add 1 to both counts to account for the main license
        const totalActive = mainLicenseActive ? activeSubLicenses + 1 : activeSubLicenses;
        const totalLicenses = (licenseKey.subLicenses?.length || 0) + 1;

        let planDetails: PlanDetails = {
          name: "", // We'll set this based on vendor
          vendor: licenseKey.vendor,
          tier: licenseKey.tier,
          subLicenses: totalActive,
          maxSubLicenses: totalLicenses,
          duration: "LIFETIME",
          expiresAt: licenseKey.expiresAt,
          isTeamConverted: licenseKey.converted_to_team,
          key: licenseKey.key,
          activeSubLicenses: totalActive,
          totalSubLicenses: totalLicenses,
          canUpgrade: totalLicenses === 1, // Add this flag for the frontend
        };

        // Set plan name based on vendor
        if (licenseKey.vendor?.toLowerCase() === VENDOR.APPSUMO && licenseKey.tier) {
          const tierDetails = getAppSumoTierDetails(licenseKey.tier);
          planDetails.name = `AppSumo ${tierDetails.name}`;
          planDetails.maxSubLicenses = tierDetails.subLicenses;
        } else if (licenseKey.vendor?.toLowerCase() === VENDOR.LEMON && licenseKey.lemonProductId) {
          const lemonDetails = getLemonPlanDetails(licenseKey.lemonProductId);
          planDetails.name = `LEMON ${lemonDetails.name}`;
          planDetails.maxSubLicenses = lemonDetails.subLicenses;
        } else {
          planDetails.name = "Lifetime Plan";
        }

        return planDetails;
      });

    // Determine if user has any premium features
    const hasPremium = plans.length > 0;

    return NextResponse.json({
      plans,
      hasPremium,
    });
  } catch (error) {
    console.error("Error fetching user plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch user plans" },
      { status: 500 }
    );
  }
}
