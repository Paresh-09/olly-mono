import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from "@/lib/auth";
import prismadb from '@/lib/prismadb';
import { startOfDay, endOfDay, parseISO, format } from 'date-fns';

const LEMON_ENTERPRISE_PRODUCT_IDS = [363041, 363064];
const LEMON_AGENCY_PRODUCT_IDS = [363063, 321751];
const LEMON_TEAM_PRODUCT_IDS = [363062, 363040];
const LEMON_INDIVIDUAL_PRODUCT_IDS = [328561, 285937];

function getVendorCategory(key: any): 'AppSumo' | 'LemonSqueezy' | 'Other' {
  const vendorLower = key.vendor?.toLowerCase() || '';
  if (['appsumo', 'app sumo'].includes(vendorLower) || key.tier || key.planId) {
    return 'AppSumo';
  }
  if (['lemonsqueezy', 'lemon squeezy', 'lemonsqueezy'].includes(vendorLower) || key.lemonProductId) {
    return 'LemonSqueezy';
  }
  return 'Other';
}

function getLemonSqueezyCategory(productId: number | null): 'Individual' | 'Team' | 'Agency' | 'Enterprise' | 'Unknown' {
  if (productId === null) return 'Unknown';
  if (LEMON_ENTERPRISE_PRODUCT_IDS.includes(productId)) return 'Enterprise';
  if (LEMON_AGENCY_PRODUCT_IDS.includes(productId)) return 'Agency';
  if (LEMON_TEAM_PRODUCT_IDS.includes(productId)) return 'Team';
  if (LEMON_INDIVIDUAL_PRODUCT_IDS.includes(productId)) return 'Individual';
  return 'Unknown';
}

function getLemonSqueezyPrice(productId: number | null): number {
  if (productId === null) return 49.99;
  if (LEMON_ENTERPRISE_PRODUCT_IDS.includes(productId)) return 799;
  if (LEMON_AGENCY_PRODUCT_IDS.includes(productId)) return 299;
  if (LEMON_TEAM_PRODUCT_IDS.includes(productId)) return 199;
  if (LEMON_INDIVIDUAL_PRODUCT_IDS.includes(productId)) return 49.99;
  return 49.99;
}

function getAppSumoPrice(tier: number): number {
  switch (tier) {
    case 1: return 69;
    case 2: return 138;
    case 3: return 207;
    default: return 69;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Validate super admin access
    const { user } = await validateRequest();
    if (!user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('from') ? startOfDay(parseISO(searchParams.get('from')!)) : null;
    const toDate = searchParams.get('to') ? endOfDay(parseISO(searchParams.get('to')!)) : null;

    let whereClause: any = {};
    if (fromDate && toDate) {
      whereClause.createdAt = {
        gte: fromDate,
        lte: toDate
      };
    }

    const licenseKeys = await prismadb.licenseKey.findMany({
      where: whereClause,
      include: {
        subLicenses: true
      }
    });

    // Initialize metrics
    const metrics = {
      totalSales: 0,
      totalRevenue: 0,
      netRevenue: 0,
      salesByVendor: {
        appsumo: {
          tier1: 0,
          tier2: 0,
          tier3: 0,
          total: 0,
          revenue: 0
        },
        lemonsqueezy: {
          individual: 0,
          team: 0,
          agency: 0,
          enterprise: 0,
          total: 0,
          revenue: 0
        },
        other: {
          total: 0,
          revenue: 0
        }
      },
      refunds: {
        total: 0,
        revenue: 0,
        byVendor: {
          appsumo: 0,
          lemonsqueezy: 0,
          other: 0
        }
      },
      dailyMetrics: new Map()
    };

    // Process each license key
    licenseKeys.forEach(key => {
      const vendorCategory = getVendorCategory(key);
      const isActive = key.isActive;
      const createdAt = format(key.createdAt, 'yyyy-MM-dd');

      // Initialize daily metrics if not exists
      if (!metrics.dailyMetrics.has(createdAt)) {
        metrics.dailyMetrics.set(createdAt, {
          sales: 0,
          revenue: 0,
          refunds: 0,
          refundRevenue: 0,
          byVendor: {
            appsumo: { sales: 0, revenue: 0 },
            lemonsqueezy: { sales: 0, revenue: 0 },
            other: { sales: 0, revenue: 0 }
          }
        });
      }

      let price = 0;
      if (vendorCategory === 'AppSumo') {
        price = getAppSumoPrice(key.tier || 1);
        if (isActive) {
          metrics.salesByVendor.appsumo[`tier${key.tier || 1}` as keyof typeof metrics.salesByVendor.appsumo]++;
          metrics.salesByVendor.appsumo.total++;
          metrics.salesByVendor.appsumo.revenue += price;
          metrics.dailyMetrics.get(createdAt)!.byVendor.appsumo.sales++;
          metrics.dailyMetrics.get(createdAt)!.byVendor.appsumo.revenue += price;
        } else {
          metrics.refunds.total++;
          metrics.refunds.revenue += price;
          metrics.refunds.byVendor.appsumo++;
          metrics.dailyMetrics.get(createdAt)!.refunds++;
          metrics.dailyMetrics.get(createdAt)!.refundRevenue += price;
        }
      } else if (vendorCategory === 'LemonSqueezy') {
        price = getLemonSqueezyPrice(key.lemonProductId);
        const category = getLemonSqueezyCategory(key.lemonProductId).toLowerCase();
        if (isActive) {
          metrics.salesByVendor.lemonsqueezy[category as keyof typeof metrics.salesByVendor.lemonsqueezy]++;
          metrics.salesByVendor.lemonsqueezy.total++;
          metrics.salesByVendor.lemonsqueezy.revenue += price;
          metrics.dailyMetrics.get(createdAt)!.byVendor.lemonsqueezy.sales++;
          metrics.dailyMetrics.get(createdAt)!.byVendor.lemonsqueezy.revenue += price;
        } else {
          metrics.refunds.total++;
          metrics.refunds.revenue += price;
          metrics.refunds.byVendor.lemonsqueezy++;
          metrics.dailyMetrics.get(createdAt)!.refunds++;
          metrics.dailyMetrics.get(createdAt)!.refundRevenue += price;
        }
      } else {
        price = 49.99;
        if (isActive) {
          metrics.salesByVendor.other.total++;
          metrics.salesByVendor.other.revenue += price;
          metrics.dailyMetrics.get(createdAt)!.byVendor.other.sales++;
          metrics.dailyMetrics.get(createdAt)!.byVendor.other.revenue += price;
        } else {
          metrics.refunds.total++;
          metrics.refunds.revenue += price;
          metrics.refunds.byVendor.other++;
          metrics.dailyMetrics.get(createdAt)!.refunds++;
          metrics.dailyMetrics.get(createdAt)!.refundRevenue += price;
        }
      }

      if (isActive) {
        metrics.totalSales++;
        metrics.totalRevenue += price;
        metrics.dailyMetrics.get(createdAt)!.sales++;
        metrics.dailyMetrics.get(createdAt)!.revenue += price;
      }
    });

    // Calculate net revenue
    metrics.netRevenue = metrics.totalRevenue - metrics.refunds.revenue;

    // Convert daily metrics map to array and sort by date
    const dailyMetrics = Array.from(metrics.dailyMetrics.entries())
      .map(([date, data]) => ({
        date,
        ...data
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      ...metrics,
      dailyMetrics
    });

  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 