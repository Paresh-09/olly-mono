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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Base license query
    let licenseQuery: any = {};
    
    // Apply date filters if provided
    if (startDate || endDate) {
      licenseQuery.createdAt = {};
      
      if (startDate) {
        licenseQuery.createdAt.gte = new Date(startDate);
      }
      
      if (endDate) {
        // Add 1 day to include the end date fully
        const endDateTime = new Date(endDate);
        endDateTime.setDate(endDateTime.getDate() + 1);
        licenseQuery.createdAt.lt = endDateTime;
      }
    }

    // Count total licenses
    const totalLicenses = await prismadb.licenseKey.count({
      where: licenseQuery
    });

    // Count active licenses
    const activeLicenses = await prismadb.licenseKey.count({
      where: {
        ...licenseQuery,
        isActive: true
      }
    });

    // Count inactive licenses
    const inactiveLicenses = await prismadb.licenseKey.count({
      where: {
        ...licenseQuery,
        isActive: false
      }
    });

    // Group by vendor
    const byVendor = await prismadb.licenseKey.groupBy({
      by: ['vendor'],
      where: licenseQuery,
      _count: {
        id: true
      }
    });

    // Group by tier
    const byTier = await prismadb.licenseKey.groupBy({
      by: ['tier'],
      where: licenseQuery,
      _count: {
        id: true
      }
    });

    // Top plans via organizations
    const topPlans = await prismadb.organizationPlan.findMany({
      select: {
        name: true,
        _count: {
          select: {
            organizations: true
          }
        }
      }
    });

    // User-specific tier breakdown based on filter and date range
    let usersByTier: any[] = [];
    
    if (filter !== 'all') {
      let userQuery: any = {};
      let licenseKeyQuery: any = { ...licenseQuery };
      
      if (filter === 'paid') {
        licenseKeyQuery.isActive = true;
      } else if (filter === 'refunded') {
        licenseKeyQuery.isActive = false;
        licenseKeyQuery.activatedAt = {
          not: null
        };
      }
      
      if (filter === 'free') {
        // For free users, we need to get users without any licenses and respect the date range
        userQuery = {
          licenseKeys: {
            none: {}
          }
        };
        
        if (startDate || endDate) {
          userQuery.createdAt = {};
          
          if (startDate) {
            userQuery.createdAt.gte = new Date(startDate);
          }
          
          if (endDate) {
            const endDateTime = new Date(endDate);
            endDateTime.setDate(endDateTime.getDate() + 1);
            userQuery.createdAt.lt = endDateTime;
          }
        }
        
        const freeUsers = await prismadb.user.count({
          where: userQuery
        });
        
        usersByTier = [{ tier: "No Tier (Free)", count: freeUsers }];
      } else {
        // For paid or refunded users, get their tier distribution
        const userTierDistribution = await prismadb.licenseKey.groupBy({
          by: ['tier'],
          where: licenseKeyQuery,
          _count: {
            id: true
          }
        });
        
        usersByTier = userTierDistribution.map((item: any) => ({
          tier: item.tier ? `Tier ${item.tier}` : 'Unknown',
          count: item._count.id
        }));
      }
    }

    // Format data
    const formattedVendors = byVendor.map((item: any) => ({
      vendor: item.vendor || 'Unknown',
      count: item._count.id
    }));

    const formattedTiers = byTier.map((item: any) => ({
      tier: item.tier ? `Tier ${item.tier}` : 'Unknown',
      count: item._count.id
    }));

    const formattedPlans = topPlans.map((item: any) => ({
      plan: item.name.toString(),
      count: item._count.organizations
    }));

    return NextResponse.json({
      totalLicenses,
      activeLicenses,
      inactiveLicenses,
      byVendor: formattedVendors,
      byTier: formattedTiers,
      topPlans: formattedPlans,
      usersByTier
    });
  } catch (error) {
    console.error('Error fetching license analytics:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 