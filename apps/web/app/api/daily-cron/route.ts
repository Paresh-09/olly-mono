import { NextResponse } from "next/server";
import { sendDiscordNotification } from "@/service/discord-notify";
import prismadb from "@/lib/prismadb";

const LEMON_SQUEEZY_API_URL = "https://api.lemonsqueezy.com/v1";
const LEMON_SQUEEZY_API_KEY = process.env.LEMON_SQUEEZY_API_KEY;
const LEMON_STORE_ID = process.env.LEMON_STORE_ID;
const PRICE_PER_SALE_BEFORE_OCT_5 = 3.42; // $3.42 per sale before Oct 5
const PRICE_PER_SALE_AFTER_OCT_5 = 6.88; // $6.88 per sale after Oct 5
const PRICE_CHANGE_DATE = new Date('2024-10-05');
const CONVERT_TO_INR = 82;

const LEMON_ENTERPRISE_PRODUCT_IDS = [363041, 363064];
const LEMON_AGENCY_PRODUCT_IDS = [363063, 321751];
const LEMON_TEAM_PRODUCT_IDS = [363062, 363040];
const LEMON_INDIVIDUAL_PRODUCT_IDS = [328561, 285937];

type AppSumoTier = 1 | 2 | 3;
type LemonSqueezyCategory = 'Enterprise' | 'Agency' | 'Team' | 'Individual' | 'Unknown';

function getAppSumoPrice(tier: AppSumoTier, date: Date): number {
  if (tier === 1) {
    return date >= PRICE_CHANGE_DATE ? PRICE_PER_SALE_AFTER_OCT_5 : PRICE_PER_SALE_BEFORE_OCT_5;
  } else if (tier === 2) {
    return 29.8;
  } else if (tier === 3) {
    return 49.8;
  }
  return PRICE_PER_SALE_AFTER_OCT_5; // Default to current Tier 1 pricing if tier is unknown
}

function getLemonSqueezyPrice(productId: number | null): number {
  if (productId === null) return 49.99; // Default price if productId is null
  if (LEMON_ENTERPRISE_PRODUCT_IDS.includes(productId)) return 799;
  if (LEMON_AGENCY_PRODUCT_IDS.includes(productId)) return 299;
  if (LEMON_TEAM_PRODUCT_IDS.includes(productId)) return 199;
  if (LEMON_INDIVIDUAL_PRODUCT_IDS.includes(productId)) return 49.99;
  return 49.99; // Default to individual price if product ID is unknown
}

function getLemonSqueezyCategory(productId: number | null): LemonSqueezyCategory {
  if (productId === null) return 'Unknown';
  if (LEMON_ENTERPRISE_PRODUCT_IDS.includes(productId)) return 'Enterprise';
  if (LEMON_AGENCY_PRODUCT_IDS.includes(productId)) return 'Agency';
  if (LEMON_TEAM_PRODUCT_IDS.includes(productId)) return 'Team';
  if (LEMON_INDIVIDUAL_PRODUCT_IDS.includes(productId)) return 'Individual';
  return 'Unknown';
}

async function fetchStoreAnalytics() {
  const response = await fetch(`${LEMON_SQUEEZY_API_URL}/stores/${LEMON_STORE_ID}`, {
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${LEMON_SQUEEZY_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch store analytics: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
}

async function fetchLicenseKeysCount(licenseKeysUrl: string) {
  const response = await fetch(licenseKeysUrl, {
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${LEMON_SQUEEZY_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch license keys count: ${response.statusText}`);
  }

  const data = await response.json();
  return data.meta.page.total;
}

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

async function processLicenseKeysData() {
  const licenseKeys = await prismadb.licenseKey.findMany({
    include: {
      organization: true,
    },
  });

  const vendors: Record<string, number> = {};
  const statuses: Record<'ACTIVE' | 'INACTIVE', number> = { ACTIVE: 0, INACTIVE: 0 };
  const dailySales: Record<string, { sales: number, revenue: number }> = {};
  let totalSales = 0;
  let totalRevenue = 0;
  const appSumoSales: Record<AppSumoTier, number> = { 1: 0, 2: 0, 3: 0 };
  const appSumoRevenue: Record<AppSumoTier, number> = { 1: 0, 2: 0, 3: 0 };
  const lemonSqueezySales: Record<LemonSqueezyCategory, number> = { Enterprise: 0, Agency: 0, Team: 0, Individual: 0, Unknown: 0 };
  const lemonSqueezyRevenue: Record<LemonSqueezyCategory, number> = { Enterprise: 0, Agency: 0, Team: 0, Individual: 0, Unknown: 0 };
  let totalRefunds = 0;
  let refundRevenue = 0;

  const today = new Date().toISOString().split('T')[0];
  let newSalesToday = 0;
  let newAppSumoSalesToday = 0;
  let newLemonSqueezySalesToday = 0;
  let newRefundsToday = 0;

  licenseKeys.forEach(key => {
    const vendorCategory = getVendorCategory(key);
    const status = key.isActive ? 'ACTIVE' : 'INACTIVE';
    const createdAt = key.createdAt;
    const createdAtString = createdAt.toISOString().split('T')[0];

    let price = 0;
    if (vendorCategory === 'AppSumo') {
      const tier = (key.tier as AppSumoTier) || 1;
      price = getAppSumoPrice(tier, createdAt);
      appSumoSales[tier]++;
      appSumoRevenue[tier] += price;
    } else if (vendorCategory === 'LemonSqueezy') {
      price = getLemonSqueezyPrice(key.lemonProductId);
      const category = getLemonSqueezyCategory(key.lemonProductId);
      lemonSqueezySales[category]++;
      lemonSqueezyRevenue[category] += price;
    } else {
      price = 49.99; // Default price for other vendors
    }

    // Vendor breakdown
    vendors[vendorCategory] = (vendors[vendorCategory] || 0) + 1;

    // Status breakdown
    statuses[status]++;

    // Daily sales and refunds
    if (status === 'ACTIVE') {
      if (!dailySales[createdAtString]) {
        dailySales[createdAtString] = { sales: 0, revenue: 0 };
      }
      dailySales[createdAtString].sales++;
      dailySales[createdAtString].revenue += price;

      if (createdAtString === today) {
        newSalesToday++;
        if (vendorCategory === 'AppSumo') {
          newAppSumoSalesToday++;
        } else if (vendorCategory === 'LemonSqueezy') {
          newLemonSqueezySalesToday++;
        }
      }
      totalSales++;
      totalRevenue += price;
    } else if (status === 'INACTIVE') {
      totalRefunds++;
      refundRevenue += price;
      if (createdAtString === today) {
        newRefundsToday++;
      }
    }
  });

  return { 
    vendors, 
    statuses, 
    dailySales,
    newSalesToday, 
    totalSales, 
    totalRevenue,
    appSumoSales,
    appSumoRevenue,
    lemonSqueezySales,
    lemonSqueezyRevenue,
    newAppSumoSalesToday,
    newLemonSqueezySalesToday,
    totalRefunds,
    refundRevenue,
    newRefundsToday
  };
}

export async function GET(req: Request) {
  try {
    const isCronAuthorized = req.headers.get('Authorization') === `Bearer ${process.env.CRON_SECRET}`;

    if (!isCronAuthorized) {
      return new NextResponse("Unauthorized.", { status: 401 });
    }

    const [storeAnalytics, licenseKeysData] = await Promise.all([
      fetchStoreAnalytics(),
      processLicenseKeysData()
    ]);

    const attributes = storeAnalytics.attributes;
    const licenseKeysUrl = storeAnalytics.relationships["license-keys"].links.related;
    const activatedLemonsqueezyUsers = await fetchLicenseKeysCount(licenseKeysUrl);

    const { 
      vendors, 
      statuses, 
      dailySales,
      newSalesToday, 
      totalSales, 
      totalRevenue,
      appSumoSales,
      appSumoRevenue,
      lemonSqueezySales,
      lemonSqueezyRevenue,
      newAppSumoSalesToday,
      newLemonSqueezySalesToday,
      totalRefunds,
      refundRevenue,
      newRefundsToday
    } = licenseKeysData;

    const message = `
@everyone,
*OLLY Analytics*

**User Metrics:**
- Total Users: ${totalSales}
- LemonSqueezy Users: ${Object.values(lemonSqueezySales).reduce((a, b) => a + b, 0)}
- AppSumo Users: ${Object.values(appSumoSales).reduce((a, b) => a + b, 0)}
- Other Users: ${vendors['Other'] || 0}

**Vendor Breakdown:**
${Object.entries(vendors).map(([vendor, count]) => `- ${vendor}: ${count}`).join('\n')}

**LemonSqueezy Breakdown:**
${Object.entries(lemonSqueezySales).map(([category, count]) => `- ${category}: ${count} (Revenue: $${lemonSqueezyRevenue[category as LemonSqueezyCategory].toFixed(2)})`).join('\n')}

**AppSumo Breakdown:**
${Object.entries(appSumoSales).map(([tier, count]) => `- Tier ${tier}: ${count} (Revenue: $${appSumoRevenue[tier as unknown as AppSumoTier].toFixed(2)})`).join('\n')}

**Status Breakdown:**
- Active: ${statuses.ACTIVE}
- Inactive: ${statuses.INACTIVE}

**Sales Metrics:**
- New Sales Today: ${newSalesToday} (AppSumo: ${newAppSumoSalesToday}, LemonSqueezy: ${newLemonSqueezySalesToday})
- Total Sales: ${totalSales}
- LemonSqueezy 30 Day Sales: ${attributes.thirty_day_sales || 0}

**Refund Metrics:**
- Total Refunds: ${totalRefunds}
- New Refunds Today: ${newRefundsToday}
- Total Refund Revenue: $${refundRevenue.toFixed(2)} (₹${(refundRevenue * CONVERT_TO_INR).toFixed(2)})

**Revenue Metrics:**
- Total Revenue: $${totalRevenue.toFixed(2)} (₹${(totalRevenue * CONVERT_TO_INR).toFixed(2)})
- AppSumo Revenue: $${Object.values(appSumoRevenue).reduce((a, b) => a + b, 0).toFixed(2)}
- LemonSqueezy Revenue: $${Object.values(lemonSqueezyRevenue).reduce((a, b) => a + b, 0).toFixed(2)}
- LemonSqueezy 30 Day Revenue: $${((attributes.thirty_day_revenue || 0) / 100).toFixed(2)} (₹${((attributes.thirty_day_revenue || 0) / 100 * CONVERT_TO_INR).toFixed(2)})
- Net Revenue (after refunds): $${(totalRevenue - refundRevenue).toFixed(2)} (₹${((totalRevenue - refundRevenue) * CONVERT_TO_INR).toFixed(2)})

**Daily Breakdown (Last 7 Days):**
${Object.entries(dailySales)
  .sort((a, b) => b[0].localeCompare(a[0]))
  .slice(0, 7)
  .map(([date, { sales, revenue }]) => 
    `- ${date}: ${sales} sales, $${revenue.toFixed(2)} (₹${(revenue * CONVERT_TO_INR).toFixed(2)})`
  )
  .join('\n')}
    `;

    await sendDiscordNotification(message, true);

    return NextResponse.json({ message: "Analytics sent to Discord." });

  } catch (error) {
    console.error("Error sending analytics to Discord:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  } finally {
    await prismadb.$disconnect();
  }
}