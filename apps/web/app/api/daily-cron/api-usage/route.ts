import { NextResponse } from "next/server";
import axios from "axios";
import prismadb from "@/lib/prismadb";

function getDateRange(daysAgo: number, isCurrentPeriod = true): { start: Date, end: Date } {
  const end = new Date();
  if (isCurrentPeriod) {
    end.setHours(23, 59, 59, 999);
  } else {
    end.setDate(end.getDate() - daysAgo);
    end.setHours(23, 59, 59, 999);
  }

  const start = new Date(end);
  start.setDate(start.getDate() - (daysAgo - 1));
  start.setHours(0, 0, 0, 0);

  return { start, end };
}

function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

async function getLicenseUsage(startDate: Date, endDate: Date) {
  return await prismadb.usageTracking.groupBy({
    by: ['createdAt'],
    _count: {
      id: true
    },
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });
}

async function getApiUsage(startDate: Date, endDate: Date) {
  return await prismadb.apiUsage.groupBy({
    by: ['createdAt'],
    _count: {
      id: true
    },
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });
}

// Get platform-specific API usage
async function getPlatformUsage(startDate: Date, endDate: Date) {
  return await prismadb.apiUsage.groupBy({
    by: ['platform'],
    _count: {
      id: true
    },
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }
  });
}

async function getDetailedApiMetrics(startDate: Date, endDate: Date) {
  const apiKeyMetrics = await prismadb.apiKeyUsageTracking.groupBy({
    by: ['apiKeyId'],
    _sum: {
      usage: true
    },
    where: {
      date: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  return apiKeyMetrics;
}

async function sendDiscordNotification(content: string) {
  const webhookUrl = process.env.OLLY_ANALYTICS_WEBHOOK;
  if (!webhookUrl) {
    console.error('Analytics webhook URL is not defined.');
    throw new Error('Webhook URL is not defined.');
  }

  try {
    await axios.post(webhookUrl, { content });
  } catch (error) {
    console.error('Error sending Discord notification:', error);
    throw error;
  }
}

function formatNumberWithCommas(num: number): string {
  return num.toLocaleString();
}

function formatPercentage(num: number): string {
  return num.toFixed(2) + '%';
}

function getEmoji(percentageChange: number): string {
  if (percentageChange > 15) return '🚀';
  if (percentageChange > 0) return '📈';
  if (percentageChange < -15) return '📉';
  if (percentageChange < 0) return '⚠️';
  return '➖';
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

async function getLast10DaysUsage(usageType: 'license' | 'api') {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date();
    start.setDate(start.getDate() - 9);
    start.setHours(0, 0, 0, 0);
  
    if (usageType === 'license') {
      const result = await prismadb.usageTracking.groupBy({
        by: ['createdAt'],
        _count: {
          id: true
        },
        where: {
          createdAt: {
            gte: start,
            lte: end
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
  
      // Consolidate entries by date
      const dailyMap = new Map<string, number>();
      result.forEach(day => {
        const dateKey = day.createdAt.toISOString().split('T')[0];
        dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + day._count.id);
      });
  
      // Convert to array and sort by date descending
      const consolidated = Array.from(dailyMap.entries())
        .map(([date, count]) => ({
          date: new Date(date),
          count
        }))
        .sort((a, b) => b.date.getTime() - a.date.getTime());
  
      return {
        total: consolidated.reduce((sum, day) => sum + day.count, 0),
        daily: consolidated
      };
    } else {
      const result = await prismadb.apiUsage.groupBy({
        by: ['createdAt'],
        _count: {
          id: true
        },
        where: {
          createdAt: {
            gte: start,
            lte: end
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
  
      // Consolidate entries by date
      const dailyMap = new Map<string, number>();
      result.forEach(day => {
        const dateKey = day.createdAt.toISOString().split('T')[0];
        dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + day._count.id);
      });
  
      // Convert to array and sort by date descending
      const consolidated = Array.from(dailyMap.entries())
        .map(([date, count]) => ({
          date: new Date(date),
          count
        }))
        .sort((a, b) => b.date.getTime() - a.date.getTime());
  
      return {
        total: consolidated.reduce((sum, day) => sum + day.count, 0),
        daily: consolidated
      };
    }
  }

export async function GET(request: Request) {
  try {
    const isCronAuthorized = request.headers.get('Authorization') === `Bearer ${process.env.CRON_SECRET}`;

    if (!isCronAuthorized) {
      return new NextResponse("Unauthorized.", { status: 401 });
    }

    const url = new URL(request.url);
    const period = parseInt(url.searchParams.get('period') || '30', 10);
    
    const currentRange = getDateRange(period, true);
    const previousRange = getDateRange(period, false);
    
    const [
      currentLicenseData,
      previousLicenseData,
      currentApiData,
      previousApiData,
      currentPlatformData,
      previousPlatformData,
      last10DaysLicense,
      last10DaysApi
    ] = await Promise.all([
      getLicenseUsage(currentRange.start, currentRange.end),
      getLicenseUsage(previousRange.start, previousRange.end),
      getApiUsage(currentRange.start, currentRange.end),
      getApiUsage(previousRange.start, previousRange.end),
      getPlatformUsage(currentRange.start, currentRange.end),
      getPlatformUsage(previousRange.start, previousRange.end),
      getLast10DaysUsage('license'),
      getLast10DaysUsage('api')
    ]);

    const licenseMetrics = {
      current: {
        total: currentLicenseData.reduce((sum, day) => sum + day._count.id, 0),
        daily: currentLicenseData.map(day => ({
          date: day.createdAt,
          count: day._count.id
        }))
      },
      previous: {
        total: previousLicenseData.reduce((sum, day) => sum + day._count.id, 0)
      }
    };

    const apiMetrics = {
      current: {
        total: currentApiData.reduce((sum, day) => sum + day._count.id, 0),
        daily: currentApiData.map(day => ({
          date: day.createdAt,
          count: day._count.id
        })),
        byPlatform: currentPlatformData
      },
      previous: {
        total: previousApiData.reduce((sum, day) => sum + day._count.id, 0),
        byPlatform: previousPlatformData
      }
    };

    const licenseChange = calculatePercentageChange(licenseMetrics.current.total, licenseMetrics.previous.total);
    const apiChange = calculatePercentageChange(apiMetrics.current.total, apiMetrics.previous.total);

    // Sort platforms by usage in descending order
    const sortedPlatforms = apiMetrics.current.byPlatform
      .sort((a, b) => b._count.id - a._count.id)
      .slice(0, 10); // Only show top 10 platforms

      const mainMetrics = `
      @everyone 📊 **Usage Analytics Report** (${period} Days)
      
      🔑 **License Usage**
      ${getEmoji(licenseChange)} Trend: ${licenseChange >= 0 ? 'Increasing' : 'Decreasing'} (${formatPercentage(licenseChange)})
      • Current Total: ${formatNumberWithCommas(licenseMetrics.current.total)}
      • Previous Total: ${formatNumberWithCommas(licenseMetrics.previous.total)}
      • Last 10 Days Total: ${formatNumberWithCommas(last10DaysLicense.total)}
      
      🔌 **API Usage**
      ${getEmoji(apiChange)} Trend: ${apiChange >= 0 ? 'Increasing' : 'Decreasing'} (${formatPercentage(apiChange)})
      • Current Total: ${formatNumberWithCommas(apiMetrics.current.total)}
      • Previous Total: ${formatNumberWithCommas(apiMetrics.previous.total)}
      • Last 10 Days Total: ${formatNumberWithCommas(last10DaysApi.total)}
      
      📱 **Top Platforms (Current Period)**
      ${sortedPlatforms.map(p => `• ${p.platform}: ${formatNumberWithCommas(p._count.id)}`).join('\n')}
      
      📈 **Period: ${formatDate(currentRange.start)} - ${formatDate(currentRange.end)}**`;
      
          const last10DaysBreakdown = `
      📅 **Last 10 Days Details**
      
      🔑 **License Usage Last 10 Days**
      ${last10DaysLicense.daily.map(day => 
        `• ${formatDate(day.date)}: ${formatNumberWithCommas(day.count)}`
      ).slice(0, 10).join('\n')}
      
      🔌 **API Usage Last 10 Days**
      ${last10DaysApi.daily.map(day => 
        `• ${formatDate(day.date)}: ${formatNumberWithCommas(day.count)}`
      ).slice(0, 10).join('\n')}`;
      
          // Send messages separately
          await sendDiscordNotification(mainMetrics);
          await sendDiscordNotification(last10DaysBreakdown);
      
          return NextResponse.json({
            success: true,
          });
      
        } catch (error: any) {
          console.error('Error analyzing usage:', error);
          return NextResponse.json({
            success: false,
            error: "Failed to analyze usage",
            details: error.message
          }, { status: 500 });
        }
      }