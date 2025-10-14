// app/api/fetch-usage/team/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { subDays } from 'date-fns';
import prismadb from '@/lib/prismadb';

interface AnalyticsData {
  byPlatform: Record<string, number>;
  byAction: Record<string, number>;
  bySubLicense: Record<string, number>;
  total: number;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const licenseKey = searchParams.get('licenseKey');
  const startDate = searchParams.get('startDate') || subDays(new Date(), 7).toISOString();
  const endDate = searchParams.get('endDate') || new Date().toISOString();

  if (!licenseKey) {
    return NextResponse.json({ error: 'License key is required' }, { status: 400 });
  }

  try {
    // Fetch the main license key and its sub-licenses
    const mainLicenseKey = await prismadb.licenseKey.findUnique({
      where: { key: licenseKey },
      include: { subLicenses: true }
    });

    if (!mainLicenseKey) {
      return NextResponse.json({ error: 'License key not found' }, { status: 404 });
    }

    // Fetch usage data for the main license key and its sub-licenses
    const usageData = await prismadb.usageTracking.findMany({
      where: {
        OR: [
          { licenseKeyId: mainLicenseKey.id },
          { subLicenseId: { in: mainLicenseKey.subLicenses.map(sl => sl.id) } }
        ],
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }
    });

    // Process the usage data
    const analytics: AnalyticsData = {
      byPlatform: {},
      byAction: {},
      bySubLicense: {},
      total: usageData.length
    };

    usageData.forEach(usage => {
      // Count by platform
      analytics.byPlatform[usage.platform] = (analytics.byPlatform[usage.platform] || 0) + 1;
      // Count by action
      analytics.byAction[usage.action] = (analytics.byAction[usage.action] || 0) + 1;
      // Count by sub-license
      const subLicenseKey = usage.subLicenseId || mainLicenseKey.id;
      analytics.bySubLicense[subLicenseKey] = (analytics.bySubLicense[subLicenseKey] || 0) + 1;
    });

    // Prepare sub-license data
    const subLicenses = mainLicenseKey.subLicenses.map(sl => ({
      id: sl.id,
      key: sl.key,
      status: sl.status,
      activationCount: sl.activationCount,
      assignedEmail: sl.assignedEmail
    }));

    const result = {
      licenseKey: mainLicenseKey.key,
      subLicenseCount: mainLicenseKey.subLicenses.length,
      subLicenses: subLicenses,
      analytics: analytics
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching team analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}