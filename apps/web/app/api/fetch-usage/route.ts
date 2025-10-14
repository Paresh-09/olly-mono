import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const licenseKey = searchParams.get('licenseKey');

  if (!userId && !licenseKey) {
    return NextResponse.json({ error: 'Either userId or licenseKey is required' }, { status: 400 });
  }

  try {
    let whereClause: any = {};

    if (licenseKey) {
      // Check in LicenseKey table
      const license = await prisma.licenseKey.findUnique({
        where: { key: licenseKey },
        select: { id: true }
      });

      if (license) {
        whereClause.licenseKeyId = license.id;
      } else {
        // If not found in LicenseKey table, check in SubLicense table
        const subLicense = await prisma.subLicense.findUnique({
          where: { key: licenseKey },
          select: { id: true }
        });

        if (subLicense) {
          whereClause.subLicenseId = subLicense.id;
        } else {
          return NextResponse.json({ error: 'License key not found' }, { status: 404 });
        }
      }
    } else if (userId) {
      whereClause.userId = userId;
    }

    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6);

    // Fetch all usage data for the past 7 days
    const usageData = await prisma.usageTracking.findMany({
      where: {
        ...whereClause,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        createdAt: true,
        platform: true,
        action: true,
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

   

    const formattedData = usageData.reduce((acc, entry) => {
      const date = entry.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { total: 0 };
      }
      if (!acc[date][entry.platform]) {
        acc[date][entry.platform] = {};
      }
      if (!acc[date][entry.platform][entry.action]) {
        acc[date][entry.platform][entry.action] = 0;
      }
      acc[date][entry.platform][entry.action]++;
      acc[date].total++;
      return acc;
    }, {} as Record<string, any>);

    // Ensure all 7 days are represented
    const allDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      return day.toISOString().split('T')[0];
    });

    const finalData = allDays.map(date => ({
      date,
      ...formattedData[date] || { total: 0 }
    }));

    return NextResponse.json(finalData);
  } catch (error) {
    console.error('Error fetching usage data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}