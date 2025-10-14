// app/api/analytics/team/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prismadb";
import { startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const licenseKey = searchParams.get('licenseKey');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const subLicenseId = searchParams.get('subLicense');
    const platform = searchParams.get('platform');
    const action = searchParams.get('action');

    if (!licenseKey || !startDate || !endDate) {
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));

    // First, try to find main license key
    const mainLicense = await prisma.licenseKey.findFirst({
      where: {
        key: licenseKey,
        isActive: true,
      },
      include: {
        subLicenses: {
          select: {
            id: true,
            key: true,
            status: true,
            activationCount: true,
            assignedEmail: true,
            mainLicenseKey: {
              select: {
                id: true,
                tier: true,
                vendor: true,
                lemonProductId: true
              }
            }
          },
        },
      },
    });

    // If not found as main license, try to find as sublicense
    const subLicense = await prisma.subLicense.findFirst({
      where: {
        key: licenseKey,
        status: 'ACTIVE',
      },
      include: {
        mainLicenseKey: {
          include: {
            subLicenses: {
              select: {
                id: true,
                key: true,
                status: true,
                activationCount: true,
                assignedEmail: true,
                mainLicenseKey: {
                  select: {
                    id: true,
                    tier: true,
                    vendor: true,
                    lemonProductId: true
                  }
                }
              },
            },
          }
        }
      }
    });

    // Determine if this is a main license or sublicense request
    let isMainLicense = false;
    let targetLicense = null;
    let allSubLicenses = [];

    if (mainLicense) {
      // User is requesting analytics for a main license they own
      isMainLicense = true;
      targetLicense = mainLicense;
      allSubLicenses = mainLicense.subLicenses;
    } else if (subLicense) {
      // User is requesting analytics for a sublicense
      isMainLicense = false;
      targetLicense = subLicense.mainLicenseKey;
      allSubLicenses = [subLicense]; // Only show this sublicense's data
    } else {
      return new NextResponse("License key not found", { status: 404 });
    }

    // Define the where clause based on selection
    let whereClause: any = {
      createdAt: {
        gte: start,
        lte: end,
      },
      ...(platform ? { platform } : {}),
      ...(action ? { action } : {})
    };

    // Handle different license types
    if (isMainLicense) {
      // Main license holder - can see all sublicenses
      if (subLicenseId && subLicenseId !== 'all') {
        whereClause = {
          ...whereClause,
          subLicenseId,
        };
      } else {
        whereClause = {
          ...whereClause,
          OR: [
            { licenseKeyId: targetLicense.id },
            {
              subLicenseId: {
                in: allSubLicenses.map(sl => sl.id)
              }
            }
          ]
        };
      }
    } else {
      if (!subLicense) {
        return new NextResponse("Missing subLicenseId for sublicense request", { status: 400 });
      }
      // Sublicense holder - can only see their own data
      whereClause = {
        ...whereClause,
        subLicenseId: subLicense.id,
      };
    }

    // Generate all dates in the range
    const allDates = eachDayOfInterval({ start, end }).map(date =>
      date.toISOString().split('T')[0]
    );

    // Extract sublicense IDs for the query
    const subLicenseIds = allSubLicenses.map(sl => sl.id);

    // Fetch daily usage with proper date handling
    let dailyUsageQuery;

    if (isMainLicense) {
      // Main license query
      dailyUsageQuery = await prisma.$queryRaw`
        SELECT 
          DATE("createdAt") as date,
          COUNT(*) as total
        FROM "UsageTracking"
        WHERE "createdAt" >= ${start}
        AND "createdAt" <= ${end}
        ${subLicenseId && subLicenseId !== 'all'
          ? Prisma.sql`AND "subLicenseId" = ${subLicenseId}`
          : subLicenseIds.length > 0
            ? Prisma.sql`AND ("licenseKeyId" = ${targetLicense.id} OR "subLicenseId" IN (${Prisma.join(subLicenseIds)}))`
            : Prisma.sql`AND "licenseKeyId" = ${targetLicense.id}`
        }
        ${platform ? Prisma.sql`AND platform = ${platform}` : Prisma.sql``}
        ${action ? Prisma.sql`AND action = ${action}` : Prisma.sql``}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `;
    } else {
      // Sublicense query
      dailyUsageQuery = await prisma.$queryRaw`
        SELECT 
          DATE("createdAt") as date,
          COUNT(*) as total
        FROM "UsageTracking"
        WHERE "createdAt" >= ${start}
        AND "createdAt" <= ${end}
        AND "subLicenseId" = ${subLicense!.id}
        ${platform ? Prisma.sql`AND platform = ${platform}` : Prisma.sql``}
        ${action ? Prisma.sql`AND action = ${action}` : Prisma.sql``}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `;
    }

    // Create a map of date to count
    const dateCountMap = new Map(
      (dailyUsageQuery as { date: Date; total: number }[]).map(({ date, total }) => [
        date.toISOString().split('T')[0],
        Number(total)
      ])
    );

    // Fill in missing dates with zero counts
    const completeUsage = allDates.map(date => ({
      date,
      count: dateCountMap.get(date) || 0
    }));

    // Fetch analytics data with the same where clause
    const [byPlatform, byAction, total] = await Promise.all([
      prisma.usageTracking.groupBy({
        by: ['platform'],
        where: whereClause,
        _count: true,
      }),

      prisma.usageTracking.groupBy({
        by: ['action'],
        where: whereClause,
        _count: true,
      }),

      prisma.usageTracking.count({
        where: whereClause,
      }),
    ]);

    // Fetch sublicense usage
    let subLicenseUsage = [];
    if (isMainLicense) {
      // Main license can see all sublicense usage
      subLicenseUsage = await prisma.usageTracking.groupBy({
        by: ['subLicenseId'],
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
          subLicenseId: {
            in: subLicenseIds
          }
        },
        _count: true,
      });
    } else {
      // Sublicense can only see their own usage
      subLicenseUsage = await prisma.usageTracking.groupBy({
        by: ['subLicenseId'],
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
          subLicenseId: subLicense!.id
        },
        _count: true,
      });
    }

    // Process analytics data
    const analytics = {
      byPlatform: Object.fromEntries(
        byPlatform.map(({ platform, _count }) => [platform, _count])
      ),
      byAction: Object.fromEntries(
        byAction.map(({ action, _count }) => [action, _count])
      ),
      bySubLicense: Object.fromEntries(
        subLicenseUsage.map(({ subLicenseId, _count }) => [subLicenseId || 'unknown', _count])
      ),
      dailyUsage: completeUsage,
      total,
    };

    // Map usage data to sublicenses
    const subLicenseUsageMap = new Map(
      subLicenseUsage.map(({ subLicenseId, _count }) => [subLicenseId, _count])
    );

    // Add usage count to sublicense data
    const subLicensesWithUsage = allSubLicenses.map(license => ({
      ...license,
      usage: subLicenseUsageMap.get(license.id) || 0
    }));

    return NextResponse.json({
      analytics,
      subLicenses: subLicensesWithUsage,
      subLicenseCount: allSubLicenses.length,
      isMainLicense, // Let frontend know if this is main license or sublicense
      licenseInfo: isMainLicense ?
        { type: 'main', key: targetLicense.key, tier: targetLicense.tier } :
        { type: 'sub', key: subLicense!.key, mainLicenseKey: targetLicense.key }
    });
  } catch (error) {
    console.error('Error fetching team analytics:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}