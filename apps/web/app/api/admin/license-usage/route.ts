import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function GET() {
  try {
    const { user } = await validateRequest();

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get users with license keys and usage data - only users with emails
    const licenseUsers = await prismadb.userLicenseKey.findMany({
      where: {
        user: {
          email: {
            not: null,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
          },
        },
        licenseKey: {
          select: {
            id: true,
            key: true,
            isActive: true,
            activatedAt: true,
            expiresAt: true,
            activationCount: true,
            vendor: true,
            tier: true,
            createdAt: true,
          },
        },
      },
    });

    // Get usage data for each license key
    const licenseKeyIds = licenseUsers.map((lu) => lu.licenseKey.id);
    
    const usageData = await prismadb.usageTracking.groupBy({
      by: ['licenseKeyId'],
      where: {
        licenseKeyId: {
          in: licenseKeyIds,
        },
      },
      _count: {
        id: true,
      },
      _max: {
        createdAt: true,
      },
    });

    // Create a map for quick lookup
    const usageMap = new Map(
      usageData.map((usage) => [
        usage.licenseKeyId,
        {
          count: usage._count.id,
          lastUsed: usage._max.createdAt,
        },
      ])
    );

    // Group by user and take the latest license for each user to avoid duplicates
    const userLicenseMap = new Map();
    
    licenseUsers.forEach((lu) => {
      const userId = lu.user.id;
      const existing = userLicenseMap.get(userId);
      
      // If no existing entry or current license is more recent, update
      if (!existing || new Date(lu.licenseKey.createdAt) > new Date(existing.licenseKey.createdAt)) {
        userLicenseMap.set(userId, lu);
      }
    });

    // Transform the data
    const transformedUsers = Array.from(userLicenseMap.values()).map((lu) => {
      const usage = usageMap.get(lu.licenseKey.id) || { count: 0, lastUsed: null };
      
      return {
        id: lu.user.id,
        email: lu.user.email,
        name: lu.user.name,
        licenseKey: lu.licenseKey.key,
        isActive: lu.licenseKey.isActive,
        activatedAt: lu.licenseKey.activatedAt?.toISOString() || null,
        expiresAt: lu.licenseKey.expiresAt?.toISOString() || null,
        activationCount: lu.licenseKey.activationCount,
        usageCount: usage.count,
        lastUsed: usage.lastUsed?.toISOString() || null,
        createdAt: lu.user.createdAt.toISOString(),
        vendor: lu.licenseKey.vendor,
        tier: lu.licenseKey.tier,
      };
    });

    // Calculate stats
    const totalUsers = transformedUsers.length;
    const activeUsers = transformedUsers.filter((u) => u.isActive).length;
    const totalUsage = transformedUsers.reduce((sum, u) => sum + u.usageCount, 0);
    const averageUsage = totalUsers > 0 ? Math.round(totalUsage / totalUsers) : 0;

    const stats = {
      totalUsers,
      activeUsers,
      totalUsage,
      averageUsage,
    };

    return NextResponse.json({
      users: transformedUsers,
      stats,
    });
  } catch (error) {
    console.error("Error fetching license usage data:", error);
    return NextResponse.json(
      { error: "Failed to fetch license usage data" },
      { status: 500 }
    );
  }
}