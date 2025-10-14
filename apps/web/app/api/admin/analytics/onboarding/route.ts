import { NextRequest, NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { validateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Authentication check
    const { user } = await validateRequest();
    if (!user || !user.isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get query params
    const searchParams = req.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'all';
    const includeUnknown = searchParams.get('includeUnknown') !== 'false';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Base user query
    let userQuery: any = {};
    
    // Apply filter based on licenses instead of isPaidUser flag
    if (filter === 'paid') {
      // Paid users have active licenses
      userQuery = {
        licenseKeys: {
          some: {
            licenseKey: {
              isActive: true
            }
          }
        }
      };
    } else if (filter === 'free') {
      // Free users don't have any licenses
      userQuery = {
        licenseKeys: {
          none: {}
        }
      };
    } else if (filter === 'refunded') {
      // Refunded users have inactive licenses that were once active
      userQuery = {
        licenseKeys: {
          some: {
            licenseKey: {
              isActive: false,
              activatedAt: {
                not: null
              }
            }
          }
        }
      };
    }

    // Apply date filters to the createdAt field if provided
    if (startDate || endDate) {
      userQuery.createdAt = {};
      
      if (startDate) {
        userQuery.createdAt.gte = new Date(startDate);
      }
      
      if (endDate) {
        // Add 1 day to include the end date fully
        const endDateTime = new Date(endDate);
        endDateTime.setDate(endDateTime.getDate() + 1);
        userQuery.createdAt.lt = endDateTime;
      }
    }

    // Get total users count
    const totalUsers = await prismadb.user.count({
      where: userQuery
    });

    // Count users who completed onboarding
    const filledOnboarding = await prismadb.user.count({
      where: {
        ...userQuery,
        onboarding: {
          skipped: false
        }
      }
    });

    // Count users who skipped onboarding
    const skippedOnboarding = await prismadb.user.count({
      where: {
        ...userQuery,
        onboarding: {
          skipped: true
        }
      }
    });

    // Get industry breakdown
    const industries = await prismadb.onboarding.groupBy({
      by: ['industry'],
      where: {
        industry: {
          not: null
        },
        user: {
          ...userQuery
        }
      },
      _count: {
        industry: true
      }
    });

    // Get role breakdown
    const roles = await prismadb.onboarding.groupBy({
      by: ['role'],
      where: {
        role: {
          not: null
        },
        user: {
          ...userQuery
        }
      },
      _count: {
        role: true
      }
    });

    // Get platform breakdown
    const platforms = await prismadb.onboarding.groupBy({
      by: ['primaryPlatform'],
      where: {
        primaryPlatform: {
          not: null
        },
        user: {
          ...userQuery
        }
      },
      _count: {
        primaryPlatform: true
      }
    });

    // Get business type breakdown
    const businessTypes = await prismadb.onboarding.groupBy({
      by: ['businessType'],
      where: {
        businessType: {
          not: null
        },
        user: {
          ...userQuery
        }
      },
      _count: {
        businessType: true
      }
    });

    // Get referral source breakdown
    const referralSourcesQuery: any = {
      by: ['referralSource'],
      where: {
        user: {
          ...userQuery
        }
      },
      _count: {
        referralSource: true
      }
    };

    // Only include non-null sources if includeUnknown is false
    if (!includeUnknown) {
      referralSourcesQuery.where.referralSource = {
        not: null
      };
    }

    const referralSources = await prismadb.onboarding.groupBy(referralSourcesQuery);

    // Format data
    const formattedIndustries = industries.map((item: any) => ({
      name: item.industry || 'Unknown',
      count: item._count.industry
    }));

    const formattedRoles = roles.map((item: any) => ({
      name: item.role || 'Unknown',
      count: item._count.role
    }));

    const formattedPlatforms = platforms.map((item: any) => ({
      name: item.primaryPlatform || 'Unknown',
      count: item._count.primaryPlatform
    }));

    const formattedBusinessTypes = businessTypes.map((item: any) => ({
      name: item.businessType || 'Unknown',
      count: item._count.businessType
    }));

    const formattedReferralSources = referralSources.map((item: any) => ({
      name: item.referralSource || 'Unknown',
      count: item._count.referralSource
    }));

    return NextResponse.json({
      totalUsers,
      filledOnboarding,
      skippedOnboarding,
      industries: formattedIndustries,
      roles: formattedRoles,
      platforms: formattedPlatforms,
      businessTypes: formattedBusinessTypes,
      referralSources: formattedReferralSources
    });
  } catch (error) {
    console.error('Error fetching onboarding analytics:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 