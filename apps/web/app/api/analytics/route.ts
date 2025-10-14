import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { fetchGoogleSheetsData, fetchStoreAnalytics, fetchLicenseKeysCount } from "@/lib/analytics";
import { processGoogleSheetsData } from "@/lib/process-google-sheet-data";

export async function GET(req: Request) {
  try {
    const { user } = await validateRequest();

    if (!user || !user.isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const [storeAnalytics, sheetsData] = await Promise.all([
      fetchStoreAnalytics(),
      fetchGoogleSheetsData()
    ]);

    const attributes = storeAnalytics.attributes;
    const licenseKeysUrl = storeAnalytics.relationships["license-keys"].links.related;
    const activatedLemonsqueezyUsers = await fetchLicenseKeysCount(licenseKeysUrl);

    const processedData = processGoogleSheetsData(sheetsData);

    const analyticsData = {
      userMetrics: {
        totalUsers: processedData.totalSales + (attributes.total_sales || 0),
        lemonsqueezyActivatedUsers: activatedLemonsqueezyUsers,
        appSumoUsers: processedData.appSumoSales,
      },
      vendorBreakdown: {
        ...processedData.vendors,
        lemonsqueezy: attributes.total_sales || 0,
      },
      statusBreakdown: processedData.statuses,
      salesMetrics: {
        newSalesToday: processedData.newSalesToday,
        newAppSumoSalesToday: processedData.newAppSumoSalesToday,
        totalSales: processedData.totalSales,
        appSumoTotalSales: processedData.appSumoSales,
        lemonsqueezyTotalSales: attributes.total_sales || 0,
        lemonsqueezy30DaySales: attributes.thirty_day_sales || 0,
      },
      refundMetrics: {
        totalRefunds: processedData.totalRefunds,
        newRefundsToday: processedData.newRefundsToday,
        totalRefundRevenue: processedData.refundRevenue,
        refundRate: processedData.refundRate,
        refundsByVendor: processedData.refundsByVendor,
        refundsByDate: processedData.refundsByDate,
      },
      revenueMetrics: {
        nonLemonsqueezyRevenue: processedData.totalRevenue,
        appSumoRevenue: processedData.appSumoRevenue,
        lemonsqueezy30DayRevenue: (attributes.thirty_day_revenue || 0) / 100 * 3.42,
        lemonsqueezyTotalRevenue: (attributes.total_revenue || 0) / 100,
        totalCombinedRevenue: processedData.totalRevenue + (attributes.total_revenue || 0) / 100,
      },
      dailySales: processedData.dailySales,
    };

    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}