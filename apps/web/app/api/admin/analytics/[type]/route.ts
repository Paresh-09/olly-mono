import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from "@/lib/auth";
import prismadb from '@/lib/prismadb';
import { startOfDay, endOfDay, parseISO, format, subDays, eachDayOfInterval, eachMonthOfInterval, startOfMonth, endOfMonth } from 'date-fns';

const LEMON_ENTERPRISE_PRODUCT_IDS = [363041, 363064];
const LEMON_AGENCY_PRODUCT_IDS = [363063, 321751];
const LEMON_TEAM_PRODUCT_IDS = [363062, 363040];
const LEMON_INDIVIDUAL_PRODUCT_IDS = [328561, 285937];

const PRICE_PER_SALE_BEFORE_OCT_5 = 3.42; // $3.42 per sale before Oct 5
const PRICE_PER_SALE_AFTER_OCT_5 = 6.88; // $6.88 per sale after Oct 5
const PRICE_PER_SALE_AFTER_FEB_13 = 29; // $29 per sale after Feb 13th
const PRICE_CHANGE_DATE_OCT = new Date('2024-10-05');
const PRICE_CHANGE_DATE_FEB = new Date('2025-02-13');

function getAppSumoPrice(tier: number, date: Date): number {
  if (tier === 1) {
    if (date >= PRICE_CHANGE_DATE_FEB) return PRICE_PER_SALE_AFTER_FEB_13;
    if (date >= PRICE_CHANGE_DATE_OCT) return PRICE_PER_SALE_AFTER_OCT_5;
    return PRICE_PER_SALE_BEFORE_OCT_5;
  } else if (tier === 2) {
    return 29.8;
  } else if (tier === 3) {
    return 49.8;
  }
  return PRICE_PER_SALE_AFTER_FEB_13; // Default to current Tier 1 pricing
}

function getLemonSqueezyPrice(productId: number | null): number {
  if (productId === null) return 49.99; // Default price if productId is null
  if (LEMON_ENTERPRISE_PRODUCT_IDS.includes(productId)) return 799;
  if (LEMON_AGENCY_PRODUCT_IDS.includes(productId)) return 299;
  if (LEMON_TEAM_PRODUCT_IDS.includes(productId)) return 199;
  if (LEMON_INDIVIDUAL_PRODUCT_IDS.includes(productId)) return 49.99;
  return 49.99; // Default to individual price if product ID is unknown
}

function getVendorCategory(key: any): 'appsumo' | 'lemonsqueezy' | 'other' {
  const vendorLower = key.vendor?.toLowerCase() || '';
  
  // AppSumo check
  if (vendorLower.includes('appsumo') || 
      vendorLower.includes('app sumo') || 
      key.tier !== null || 
      key.planId) {
    return 'appsumo';
  }
  
  // LemonSqueezy check
  if (vendorLower.includes('lemonsqueezy') || 
      vendorLower.includes('lemon squeezy') || 
      key.lemonProductId !== null || 
      vendorLower.includes('lemon')) {
    return 'lemonsqueezy';
  }
  
  return 'other';
}

export async function GET(request: NextRequest, props: { params: Promise<{ type: string }> }) {
  const params = await props.params;
  try {
    // Validate admin access
    const { user } = await validateRequest();
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('from') ? startOfDay(parseISO(searchParams.get('from')!)) : subDays(new Date(), 30);
    const toDate = searchParams.get('to') ? endOfDay(parseISO(searchParams.get('to')!)) : new Date();

    const whereClause = {
      createdAt: {
        gte: fromDate,
        lte: toDate
      }
    };

    switch (params.type) {
      case 'revenue': {
        const licenses = await prismadb.licenseKey.findMany({
          where: whereClause,
          include: { subLicenses: true }
        });

        let totalRevenue = 0;
        let netRevenue = 0;
        let revenueByVendor = {
          appsumo: 0,
          lemonsqueezy: 0,
          other: 0
        };

        licenses.forEach(license => {
          const vendorCategory = getVendorCategory(license);
          let price = 0;

          if (vendorCategory === 'appsumo') {
            price = getAppSumoPrice(license.tier || 1, license.createdAt);
          } else if (vendorCategory === 'lemonsqueezy') {
            price = getLemonSqueezyPrice(license.lemonProductId);
          } else {
            price = 49.99; // Default price for other vendors
          }

          // Always add to total revenue
          totalRevenue += price;

          if (license.isActive) {
            netRevenue += price;
            revenueByVendor[vendorCategory] += price;
          } else {
            netRevenue -= price;
          }
        });

        return NextResponse.json({ 
          total: Math.round(totalRevenue * 100) / 100, 
          net: Math.round(netRevenue * 100) / 100,
          byVendor: {
            appsumo: Math.round(revenueByVendor.appsumo * 100) / 100,
            lemonsqueezy: Math.round(revenueByVendor.lemonsqueezy * 100) / 100,
            other: Math.round(revenueByVendor.other * 100) / 100
          }
        });
      }

      case 'revenue-trend': {
        const licenses = await prismadb.licenseKey.findMany({
          where: whereClause,
          include: { subLicenses: true }
        });

        // Generate all dates in the range
        const allDates = eachDayOfInterval({ start: fromDate, end: toDate });
        
        // Initialize map with all dates
        const dailyRevenue = new Map(
          allDates.map(date => [
            format(date, 'yyyy-MM-dd'),
            { revenue: 0, netRevenue: 0 }
          ])
        );

        licenses.forEach(license => {
          const date = format(license.createdAt, 'yyyy-MM-dd');
          const vendorCategory = getVendorCategory(license);
          let price = 0;

          if (vendorCategory === 'appsumo') {
            price = getAppSumoPrice(license.tier || 1, license.createdAt);
          } else if (vendorCategory === 'lemonsqueezy') {
            price = getLemonSqueezyPrice(license.lemonProductId);
          } else {
            price = 49.99; // Default price for other vendors
          }

          const dailyData = dailyRevenue.get(date);
          if (dailyData) {
            if (license.isActive) {
              dailyData.revenue += price;
              dailyData.netRevenue += price;
            } else {
              dailyData.netRevenue -= price;
            }
          }
        });

        // Convert to array and sort by date
        const sortedDailyRevenue = Array.from(dailyRevenue.entries())
          .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
          .map(([date, data]) => ({
            date,
            revenue: Math.round(data.revenue * 100) / 100,
            netRevenue: Math.round(data.netRevenue * 100) / 100
          }));

        return NextResponse.json({
          dailyRevenue: sortedDailyRevenue
        });
      }

      case 'api-usage': {
        const currentRange = {
          start: fromDate,
          end: toDate
        };

        // Get API usage statistics and top users
        const [apiUsage, platformUsage, last10DaysUsage] = await Promise.all([
          prismadb.apiUsage.groupBy({
            by: ['createdAt'],
            _count: {
              id: true
            },
            where: {
              createdAt: {
                gte: currentRange.start,
                lte: currentRange.end
              }
            },
            orderBy: {
              createdAt: 'asc'
            }
          }),
          prismadb.apiUsage.groupBy({
            by: ['platform'],
            _count: {
              id: true
            },
            where: {
              createdAt: {
                gte: currentRange.start,
                lte: currentRange.end
              }
            }
          }),
          prismadb.apiUsage.groupBy({
            by: ['createdAt'],
            _count: {
              id: true
            },
            where: {
              createdAt: {
                gte: subDays(new Date(), 9),
                lte: new Date()
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          })
        ]);

        // Get top users through license keys and API keys
        const topUsersResult = await prismadb.apiUsage.findMany({
          where: {
            createdAt: {
              gte: currentRange.start,
              lte: currentRange.end
            }
          },
          include: {
            licenseKey: {
              include: {
                users: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        username: true
                      }
                    }
                  }
                }
              }
            },
            apiKey: {
              include: {
                users: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        username: true
                      }
                    }
                  }
                }
              }
            }
          }
        });

        // Calculate usage per user
        const userUsage = topUsersResult.reduce((acc, usage) => {
          let userId: string | undefined;
          let username: string | null | undefined;

          // Try to get user from license key first
          if (usage.licenseKey?.users[0]?.user) {
            userId = usage.licenseKey.users[0].user.id;
            username = usage.licenseKey.users[0].user.username;
          }
          // If not found, try to get from API key
          else if (usage.apiKey?.users[0]?.user) {
            userId = usage.apiKey.users[0].user.id;
            username = usage.apiKey.users[0].user.username;
          }

          if (userId) {
            if (!acc[userId]) {
              acc[userId] = { userId, username: username ?? 'Unknown', count: 0 };
            }
            acc[userId].count++;
          }
          return acc;
        }, {} as Record<string, { userId: string; username: string; count: number }>);

        // Get top 10 users by usage
        const topUsers = Object.values(userUsage)
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        // Rest of the existing code...
        const dailyMap = new Map<string, number>();
        apiUsage.forEach(day => {
          const dateKey = format(day.createdAt, 'yyyy-MM-dd');
          dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + day._count.id);
        });

        const dailyUsage = Array.from(dailyMap.entries())
          .map(([date, count]) => ({
            date,
            count
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const sortedPlatforms = platformUsage
          .sort((a, b) => b._count.id - a._count.id)
          .slice(0, 10);

        const last10DaysMap = new Map<string, number>();
        last10DaysUsage.forEach(day => {
          const dateKey = format(day.createdAt, 'yyyy-MM-dd');
          last10DaysMap.set(dateKey, (last10DaysMap.get(dateKey) || 0) + day._count.id);
        });

        const last10Days = Array.from(last10DaysMap.entries())
          .map(([date, count]) => ({
            date,
            count
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json({
          total: dailyUsage.reduce((sum, day) => sum + day.count, 0),
          dailyUsage,
          byPlatform: sortedPlatforms.map(p => ({
            platform: p.platform,
            count: p._count.id
          })),
          last10Days: {
            total: last10Days.reduce((sum, day) => sum + day.count, 0),
            daily: last10Days
          },
          topUsers
        });
      }

      case 'credit-consumption': {
        // Get credit transactions
        const transactions = await prismadb.creditTransaction.findMany({
          where: whereClause,
          include: {
            userCredit: {
              include: {
                user: true
              }
            }
          }
        });

        // Group by user and calculate totals
        const userCredits = new Map();
        
        transactions.forEach(transaction => {
          const userId = transaction.userCredit.userId;
          const username = transaction.userCredit.user.username || 'Unknown';
          
          if (!userCredits.has(userId)) {
            userCredits.set(userId, {
              userId,
              username,
              totalSpent: 0,
              totalEarned: 0,
              byType: {},
              byDate: {}
            });
          }
          
          const userData = userCredits.get(userId);
          
          if (transaction.type === 'SPENT') {
            userData.totalSpent += Math.abs(transaction.amount);
          } else {
            userData.totalEarned += transaction.amount;
          }
          
          // Track by transaction type
          if (!userData.byType[transaction.type]) {
            userData.byType[transaction.type] = 0;
          }
          userData.byType[transaction.type] += transaction.amount;
          
          // Track by date
          const date = format(transaction.createdAt, 'yyyy-MM-dd');
          if (!userData.byDate[date]) {
            userData.byDate[date] = 0;
          }
          userData.byDate[date] += transaction.amount;
        });

        return NextResponse.json({
          users: Array.from(userCredits.values())
            .sort((a, b) => b.totalSpent - a.totalSpent)
        });
      }

      case 'license-usage': {
        const currentRange = {
          start: fromDate,
          end: toDate
        };

        // Get license usage statistics
        const [licenseUsage, last10DaysUsage] = await Promise.all([
          prismadb.usageTracking.groupBy({
            by: ['createdAt'],
            _count: {
              id: true
            },
            where: {
              createdAt: {
                gte: currentRange.start,
                lte: currentRange.end
              }
            },
            orderBy: {
              createdAt: 'asc'
            }
          }),
          prismadb.usageTracking.groupBy({
            by: ['createdAt'],
            _count: {
              id: true
            },
            where: {
              createdAt: {
                gte: subDays(new Date(), 9),
                lte: new Date()
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          })
        ]);

        // Get top users
        const topUsersResult = await prismadb.usageTracking.findMany({
          where: {
            createdAt: {
              gte: currentRange.start,
              lte: currentRange.end
            }
          },
          select: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        });

        // Calculate usage per user
        const userUsage = topUsersResult.reduce((acc, usage) => {
          if (!usage.user) return acc;
          const { id, username } = usage.user;
          if (!acc[id]) {
            acc[id] = { userId: id, username: username || 'Unknown', count: 0 };
          }
          acc[id].count++;
          return acc;
        }, {} as Record<string, { userId: string; username: string; count: number }>);

        // Get top 10 users by usage
        const topUsers = Object.values(userUsage)
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        // Rest of the existing code...
        const dailyMap = new Map<string, number>();
        licenseUsage.forEach(day => {
          const dateKey = format(day.createdAt, 'yyyy-MM-dd');
          dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + day._count.id);
        });

        const dailyUsage = Array.from(dailyMap.entries())
          .map(([date, count]) => ({
            date,
            count
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const last10DaysMap = new Map<string, number>();
        last10DaysUsage.forEach(day => {
          const dateKey = format(day.createdAt, 'yyyy-MM-dd');
          last10DaysMap.set(dateKey, (last10DaysMap.get(dateKey) || 0) + day._count.id);
        });

        const last10Days = Array.from(last10DaysMap.entries())
          .map(([date, count]) => ({
            date,
            count
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json({
          total: dailyUsage.reduce((sum, day) => sum + day.count, 0),
          dailyUsage,
          last10Days: {
            total: last10Days.reduce((sum, day) => sum + day.count, 0),
            daily: last10Days
          },
          topUsers
        });
      }

      case 'sales': {
        const totalSales = await prismadb.licenseKey.count({
          where: {
            ...whereClause,
            isActive: true
          }
        });

        return NextResponse.json({ total: totalSales });
      }

      case 'vendors': {
        const licenses = await prismadb.licenseKey.findMany({
          where: {
            ...whereClause,
            isActive: true
          }
        });

        const appsumo = licenses.filter(l => l.vendor?.toLowerCase().includes('appsumo')).length;
        const lemonsqueezy = licenses.filter(l => l.lemonProductId || l.vendor?.toLowerCase().includes('lemonsqueezy')).length;

        return NextResponse.json({ appsumo, lemonsqueezy });
      }

      case 'refunds-rate': {
        const totalLicenses = await prismadb.licenseKey.count({ where: whereClause });
        const refunds = await prismadb.licenseKey.count({
          where: {
            ...whereClause,
            isActive: false
          }
        });

        return NextResponse.json({
          rate: totalLicenses > 0 ? refunds / totalLicenses : 0
        });
      }

      case 'refunds-all': {
        const licenses = await prismadb.licenseKey.findMany({
          where: {
            ...whereClause,
            isActive: false
          }
        });

        const byVendor = {
          appsumo: 0,
          lemonsqueezy: 0,
          other: 0
        };

        let totalRevenue = 0;

        licenses.forEach(license => {
          const price = license.vendor?.toLowerCase().includes('appsumo') ? 
            (license.tier || 1) * 69 : 
            license.lemonProductId ? 199 : 49.99;

          totalRevenue += price;

          if (license.vendor?.toLowerCase().includes('appsumo')) {
            byVendor.appsumo++;
          } else if (license.lemonProductId || license.vendor?.toLowerCase().includes('lemonsqueezy')) {
            byVendor.lemonsqueezy++;
          } else {
            byVendor.other++;
          }
        });

        const totalLicenses = await prismadb.licenseKey.count({ where: whereClause });

        return NextResponse.json({
          total: licenses.length,
          revenue: totalRevenue,
          refundRate: totalLicenses > 0 ? licenses.length / totalLicenses : 0,
          byVendor
        });
      }

      case 'users-active': {
        const total = await prismadb.user.count({ where: whereClause });
        const active = await prismadb.user.count({
          where: {
            ...whereClause,
            licenseKeys: {
              some: {
                licenseKey: {
                  isActive: true
                }
              }
            }
          }
        });

        return NextResponse.json({ total, active });
      }

      case 'users-all': {
        const [total, active, newUsers] = await Promise.all([
          prismadb.user.count({ where: whereClause }),
          prismadb.user.count({
            where: {
              ...whereClause,
              licenseKeys: {
                some: {
                  licenseKey: {
                    isActive: true
                  }
                }
              }
            }
          }),
          prismadb.user.count({ where: whereClause })
        ]);

        // Get all users with their license keys
        const users = await prismadb.user.findMany({
          where: whereClause,
          include: {
            licenseKeys: {
              include: {
                licenseKey: true
              }
            }
          }
        });

        // Get daily signups
        const allDates = eachDayOfInterval({ start: fromDate, end: toDate });
        const dailySignups = new Map(
          allDates.map(date => [
            format(date, 'yyyy-MM-dd'),
            { total: 0, appsumo: 0, lemonsqueezy: 0, other: 0 }
          ])
        );

        users.forEach(user => {
          const dateKey = format(user.createdAt, 'yyyy-MM-dd');
          const signupData = dailySignups.get(dateKey);
          if (signupData) {
            signupData.total++;
            const license = user.licenseKeys[0]?.licenseKey;
            if (license) {
              if (license.vendor?.toLowerCase().includes('appsumo')) {
                signupData.appsumo++;
              } else if (license.lemonProductId || license.vendor?.toLowerCase().includes('lemonsqueezy')) {
                signupData.lemonsqueezy++;
              } else {
                signupData.other++;
              }
            } else {
              signupData.other++;
            }
          }
        });

        const usersByVendor = {
          appsumo: 0,
          lemonsqueezy: 0,
          other: 0
        };

        const usersByPlan = {
          individual: 0,
          team: 0,
          agency: 0,
          enterprise: 0
        };

        const activeLicenses = {
          total: 0,
          appsumo: 0,
          lemonsqueezy: 0,
          other: 0
        };

        users.forEach(user => {
          const license = user.licenseKeys[0]?.licenseKey;
          if (!license) {
            usersByVendor.other++;
            return;
          }

          if (license.vendor?.toLowerCase().includes('appsumo')) {
            usersByVendor.appsumo++;
            if (license.isActive) activeLicenses.appsumo++;
          } else if (license.lemonProductId || license.vendor?.toLowerCase().includes('lemonsqueezy')) {
            usersByVendor.lemonsqueezy++;
            if (license.isActive) activeLicenses.lemonsqueezy++;
            
            if (license.lemonProductId) {
              if (license.lemonProductId >= 363041) usersByPlan.enterprise++;
              else if (license.lemonProductId >= 363063) usersByPlan.agency++;
              else if (license.lemonProductId >= 363062) usersByPlan.team++;
              else usersByPlan.individual++;
            }
          } else {
            usersByVendor.other++;
            if (license.isActive) activeLicenses.other++;
          }
        });

        activeLicenses.total = activeLicenses.appsumo + activeLicenses.lemonsqueezy + activeLicenses.other;

        return NextResponse.json({
          totalUsers: total,
          activeUsers: active,
          newUsers,
          usersByVendor,
          usersByPlan,
          activeLicenses,
          dailySignups: Array.from(dailySignups.entries())
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .map(([date, data]) => ({
              date,
              ...data
            }))
        });
      }

      case 'revenue-all': {
        const licenses = await prismadb.licenseKey.findMany({
          where: whereClause,
          include: { subLicenses: true }
        });

        // Generate all dates in the range
        const allDates = eachDayOfInterval({ start: fromDate, end: toDate });
        const allMonths = eachMonthOfInterval({ start: fromDate, end: toDate });

        // Initialize maps with all dates/months
        const dailyRevenue = new Map(
          allDates.map(date => [
            format(date, 'yyyy-MM-dd'),
            { revenue: 0, netRevenue: 0 }
          ])
        );

        const monthlyRevenue = new Map(
          allMonths.map(date => [
            format(date, 'yyyy-MM'),
            { revenue: 0, netRevenue: 0 }
          ])
        );

        let totalRevenue = 0;
        let netRevenue = 0;
        let revenueByVendor = {
          appsumo: 0,
          lemonsqueezy: 0,
          other: 0
        };

        licenses.forEach(license => {
          const date = format(license.createdAt, 'yyyy-MM-dd');
          const month = format(license.createdAt, 'yyyy-MM');
          const price = license.vendor?.toLowerCase().includes('appsumo') ? 
            (license.tier || 1) * 69 : 
            license.lemonProductId ? 199 : 49.99;

          if (license.isActive) {
            totalRevenue += price;
            netRevenue += price;
            
            const dailyData = dailyRevenue.get(date);
            if (dailyData) {
              dailyData.revenue += price;
              dailyData.netRevenue += price;
            }
            
            const monthlyData = monthlyRevenue.get(month);
            if (monthlyData) {
              monthlyData.revenue += price;
              monthlyData.netRevenue += price;
            }

            if (license.vendor?.toLowerCase().includes('appsumo')) {
              revenueByVendor.appsumo += price;
            } else if (license.lemonProductId || license.vendor?.toLowerCase().includes('lemonsqueezy')) {
              revenueByVendor.lemonsqueezy += price;
            } else {
              revenueByVendor.other += price;
            }
          } else {
            netRevenue -= price;
            const dailyData = dailyRevenue.get(date);
            if (dailyData) {
              dailyData.netRevenue -= price;
            }
            
            const monthlyData = monthlyRevenue.get(month);
            if (monthlyData) {
              monthlyData.netRevenue -= price;
            }
          }
        });

        // Sort and convert to arrays
        const sortedDailyRevenue = Array.from(dailyRevenue.entries())
          .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
          .map(([date, data]) => ({
            date,
            revenue: Math.round(data.revenue * 100) / 100,
            netRevenue: Math.round(data.netRevenue * 100) / 100
          }));

        const sortedMonthlyRevenue = Array.from(monthlyRevenue.entries())
          .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
          .map(([month, data]) => ({
            month,
            revenue: Math.round(data.revenue * 100) / 100,
            netRevenue: Math.round(data.netRevenue * 100) / 100
          }));

        return NextResponse.json({
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          netRevenue: Math.round(netRevenue * 100) / 100,
          revenueByVendor: {
            appsumo: Math.round(revenueByVendor.appsumo * 100) / 100,
            lemonsqueezy: Math.round(revenueByVendor.lemonsqueezy * 100) / 100,
            other: Math.round(revenueByVendor.other * 100) / 100
          },
          dailyRevenue: sortedDailyRevenue,
          monthlyRevenue: sortedMonthlyRevenue
        });
      }

      case 'vendors-all': {
        const licenses = await prismadb.licenseKey.findMany({
          where: whereClause,
          include: { subLicenses: true }
        });

        // Generate all dates in the range
        const allDates = eachDayOfInterval({ start: fromDate, end: toDate });
        const allMonths = eachMonthOfInterval({ start: fromDate, end: toDate });

        // Initialize maps with all dates/months
        const dailyTrend = new Map(
          allDates.map(date => [
            format(date, 'yyyy-MM-dd'),
            {
              appsumo_sales: 0,
              appsumo_revenue: 0,
              lemonsqueezy_sales: 0,
              lemonsqueezy_revenue: 0
            }
          ])
        );

        const monthlyTrend = new Map(
          allMonths.map(date => [
            format(date, 'yyyy-MM'),
            {
              appsumo_sales: 0,
              appsumo_revenue: 0,
              lemonsqueezy_sales: 0,
              lemonsqueezy_revenue: 0
            }
          ])
        );
        
        const appsumoData = {
          total: 0,
          revenue: 0,
          tiers: {
            tier1: 0,
            tier2: 0,
            tier3: 0
          }
        };

        const lemonsqueezyData = {
          total: 0,
          revenue: 0,
          plans: {
            individual: 0,
            team: 0,
            agency: 0,
            enterprise: 0
          }
        };

        licenses.forEach(license => {
          const date = format(license.createdAt, 'yyyy-MM-dd');
          const month = format(license.createdAt, 'yyyy-MM');

          if (license.isActive) {
            if (license.vendor?.toLowerCase().includes('appsumo')) {
              const tier = license.tier || 1;
              const price = tier * 69;
              
              appsumoData.total++;
              appsumoData.revenue += price;
              appsumoData.tiers[`tier${tier}` as keyof typeof appsumoData.tiers]++;
              
              const dailyData = dailyTrend.get(date);
              if (dailyData) {
                dailyData.appsumo_sales++;
                dailyData.appsumo_revenue += price;
              }

              const monthlyData = monthlyTrend.get(month);
              if (monthlyData) {
                monthlyData.appsumo_sales++;
                monthlyData.appsumo_revenue += price;
              }
            } else if (license.lemonProductId || license.vendor?.toLowerCase().includes('lemonsqueezy')) {
              const price = license.lemonProductId ? 199 : 49.99;
              let plan = 'individual';
              
              if (license.lemonProductId) {
                if (license.lemonProductId >= 363041) plan = 'enterprise';
                else if (license.lemonProductId >= 363063) plan = 'agency';
                else if (license.lemonProductId >= 363062) plan = 'team';
              }
              
              lemonsqueezyData.total++;
              lemonsqueezyData.revenue += price;
              lemonsqueezyData.plans[plan as keyof typeof lemonsqueezyData.plans]++;
              
              const dailyData = dailyTrend.get(date);
              if (dailyData) {
                dailyData.lemonsqueezy_sales++;
                dailyData.lemonsqueezy_revenue += price;
              }

              const monthlyData = monthlyTrend.get(month);
              if (monthlyData) {
                monthlyData.lemonsqueezy_sales++;
                monthlyData.lemonsqueezy_revenue += price;
              }
            }
          }
        });

        // Sort and convert to arrays
        const sortedDailyTrend = Array.from(dailyTrend.entries())
          .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
          .map(([date, data]) => ({
            date,
            appsumo_sales: data.appsumo_sales,
            appsumo_revenue: Math.round(data.appsumo_revenue * 100) / 100,
            lemonsqueezy_sales: data.lemonsqueezy_sales,
            lemonsqueezy_revenue: Math.round(data.lemonsqueezy_revenue * 100) / 100
          }));

        const sortedMonthlyTrend = Array.from(monthlyTrend.entries())
          .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
          .map(([month, data]) => ({
            month,
            appsumo_sales: data.appsumo_sales,
            appsumo_revenue: Math.round(data.appsumo_revenue * 100) / 100,
            lemonsqueezy_sales: data.lemonsqueezy_sales,
            lemonsqueezy_revenue: Math.round(data.lemonsqueezy_revenue * 100) / 100
          }));

        return NextResponse.json({
          appsumo: {
            ...appsumoData,
            revenue: Math.round(appsumoData.revenue * 100) / 100
          },
          lemonsqueezy: {
            ...lemonsqueezyData,
            revenue: Math.round(lemonsqueezyData.revenue * 100) / 100
          },
          dailyTrend: sortedDailyTrend,
          monthlyTrend: sortedMonthlyTrend
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid analytics type' }, { status: 400 });
    }

  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 