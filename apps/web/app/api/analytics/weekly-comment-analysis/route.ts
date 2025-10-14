import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prismadb";
export async function POST(request: NextRequest) {
  try {
    const { licenseKey, db_user_id, period = "7", startDate, endDate } = await request.json();

    if (!licenseKey && !db_user_id) {
      return NextResponse.json(
        { error: "Either license key or user ID is required" },
        { status: 400 }
      );
    }

    // Handle different time periods
    let startDateTime, endDateTime;
    let isHourly = false;

    if (startDate && endDate) {
      startDateTime = new Date(startDate);
      endDateTime = new Date(endDate);
    } else {
      endDateTime = new Date();

      if (period === "today") {
        // For today, we want to show hourly data
        startDateTime = new Date();
        startDateTime.setHours(0, 0, 0, 0); // Start of today
        isHourly = true;
      } else {
        // For other periods, use days
        const days = parseInt(period);
        startDateTime = new Date();
        startDateTime.setDate(startDateTime.getDate() - days);
      }
    }

    let userLicenses: any[] = [];
    let subLicenses: any[] = [];
    let userId: string | null = null;

    if (db_user_id) {
      // Handle user ID based analysis
      userId = db_user_id;

      // Get user's license keys
      userLicenses = await prisma.userLicenseKey.findMany({
        where: {
          userId: db_user_id,
        },
        include: {
          licenseKey: true,
        },
      });

      // Get user's sub-licenses
      const user = await prisma.user.findUnique({
        where: { id: db_user_id },
      });

      if (user) {
        subLicenses = await prisma.subLicense.findMany({
          where: {
            OR: [
              { assignedEmail: user.email },
              { assignedUserId: db_user_id }
            ],
            status: "ACTIVE",
          },
        });
      }
    } else if (licenseKey) {
      // Handle license key based analysis
      // Find the license key record
      const licenseKeyRecord = await prisma.licenseKey.findUnique({
        where: { key: licenseKey },
      });

      if (licenseKeyRecord) {
        // It's a main license key
        userLicenses = await prisma.userLicenseKey.findMany({
          where: { licenseKeyId: licenseKeyRecord.id },
          include: {
            licenseKey: true,
          },
        });

        subLicenses = await prisma.subLicense.findMany({
          where: {
            mainLicenseKeyId: licenseKeyRecord.id,
            status: "ACTIVE",
          },
        });
      } else {
        // Try finding as a sublicense
        const sublicenseRecord = await prisma.subLicense.findUnique({
          where: { key: licenseKey },
          include: {
            mainLicenseKey: true,
          },
        });

        if (!sublicenseRecord) {
          return NextResponse.json(
            { error: "Invalid license key or sublicense" },
            { status: 404 }
          );
        }

        // For sublicense, get the associated user and main license
        subLicenses = [sublicenseRecord];
        if (sublicenseRecord.assignedUserId) {
          userId = sublicenseRecord.assignedUserId;
        }
      }
    }

    const licenseKeyIds = userLicenses.map((ul) => ul.licenseKeyId);
    const subLicenseIds = subLicenses.map((sl) => sl.id);

    // Build the where clause for usage logs
    let usageWhereClause: any = {
      createdAt: {
        gte: startDateTime,
        lte: endDateTime,
      },
    };

    // Build OR conditions based on available data
    const orConditions = [];
    if (licenseKeyIds.length > 0) {
      orConditions.push({ licenseKeyId: { in: licenseKeyIds } });
    }
    if (subLicenseIds.length > 0) {
      orConditions.push({ subLicenseId: { in: subLicenseIds } });
    }
    if (userId) {
      orConditions.push({ userId: userId });
    }

    if (orConditions.length > 0) {
      usageWhereClause.OR = orConditions;
    } else {
      // No matching data found, return empty result
      usageWhereClause.id = -1; // This will return no results
    }

    // Get usage logs for the date range
    const usageLogs = await prisma.usageTracking.findMany({
      where: usageWhereClause,
      include: {
        licenseKey: true,
        subLicense: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Build where clause for auto-commenter history
    let autoCommenterWhereClause: any = {
      postedAt: {
        gte: startDateTime,
        lte: endDateTime,
      },
      status: 'POSTED',
    };

    if (userId) {
      autoCommenterWhereClause.userId = userId;
    } else {
      // If no specific user, try to get auto-commenter data based on license keys
      const autoCommenterOrConditions = [];
      if (licenseKeyIds.length > 0) {
        autoCommenterOrConditions.push({
          config: {
            licenseKeyId: { in: licenseKeyIds }
          }
        });
      }
      if (subLicenseIds.length > 0) {
        autoCommenterOrConditions.push({
          config: {
            subLicenseId: { in: subLicenseIds }
          }
        });
      }

      if (autoCommenterOrConditions.length > 0) {
        autoCommenterWhereClause.OR = autoCommenterOrConditions;
      } else {
        autoCommenterWhereClause.id = -1; // No results
      }
    }

    // Get auto-commenter history
    const autoCommenterLogs = await prisma.autoCommenterHistory.findMany({
      where: autoCommenterWhereClause,
      orderBy: {
        postedAt: 'asc',
      },
    });

    // Generate all dates/hours in the range for the map
    const dateMap = new Map<string, any>();
    const timePoints: string[] = [];

    const createDateEntry = (timeLabel: string, hourNum?: number) => {
      const entry: any = {
        date: timeLabel,
        total: 0,
        linkedin: { comment: 0, like: 0 },
        twitter: { comment: 0, like: 0 },
        instagram: { comment: 0, like: 0 },
        reddit: { comment: 0, like: 0 },
        facebook: { comment: 0, like: 0 }, // Added Facebook platform
        auto_commenter: 0,
        licenseKeys: new Set(),
      };

      if (hourNum !== undefined) {
        entry.hour = `${hourNum}:00`;
        entry.display = hourNum < 10 ? `0${hourNum}:00` : `${hourNum}:00`;
      }

      return entry;
    };

    // Helper function to normalize action types (combine comment and voice-comment)
    const normalizeAction = (action: string): string => {
      const normalizedAction = action.toLowerCase();
      // Combine 'voice-comment' with 'comment'
      if (normalizedAction === 'voice-comment') {
        return 'comment';
      }
      return normalizedAction;
    };

    // PRE-POPULATE the complete timeline
    if (isHourly) {
      // Generate all hours for today
      const current = new Date(startDateTime);
      const now = new Date();

      while (current <= now) {
        const hourNum = current.getHours();
        const timePoint = current.toISOString();

        if (!dateMap.has(timePoint)) {
          const entry = createDateEntry(timePoint, hourNum);
          dateMap.set(timePoint, entry);
          timePoints.push(timePoint);
        }

        current.setHours(current.getHours() + 1);
      }
    } else {
      // Generate all days in the range
      const current = new Date(startDateTime);

      while (current <= endDateTime) {
        const timePoint = current.toISOString().split('T')[0];

        if (!dateMap.has(timePoint)) {
          const entry = createDateEntry(timePoint);
          dateMap.set(timePoint, entry);
          timePoints.push(timePoint);
        }

        current.setDate(current.getDate() + 1);
      }
    }

    // Aggregate usage data
    usageLogs.forEach((log) => {
      let timePoint;

      if (isHourly) {
        // For hourly data, round to the beginning of the hour
        const logDate = new Date(log.createdAt);
        const hourNum = logDate.getHours();
        logDate.setMinutes(0, 0, 0);
        timePoint = logDate.toISOString();

        // Create entry if it doesn't exist (though it should already exist from pre-population)
        if (!dateMap.has(timePoint)) {
          const entry = createDateEntry(timePoint, hourNum);
          dateMap.set(timePoint, entry);
          timePoints.push(timePoint);
        }
      } else {
        // For daily data, use the date
        timePoint = log.createdAt.toISOString().split('T')[0];

        // Create entry if it doesn't exist (though it should already exist from pre-population)
        if (!dateMap.has(timePoint)) {
          const entry = createDateEntry(timePoint);
          dateMap.set(timePoint, entry);
          timePoints.push(timePoint);
        }
      }

      const entry = dateMap.get(timePoint);

      if (entry) {
        entry.total += 1;

        // Track the license key associated with this data point
        if (log.licenseKey) {
          entry.licenseKeys.add(log.licenseKey.key);
        } else if (log.subLicense) {
          entry.licenseKeys.add(log.subLicense.key);
        }

        // Handle platform-specific data
        const platform = log.platform.toLowerCase();
        const normalizedAction = normalizeAction(log.action); // Use normalized action

        // Ensure the platform exists in the entry
        if (!entry[platform]) {
          entry[platform] = { comment: 0, like: 0 };
        }

        // Ensure the action exists for this platform
        if (!entry[platform][normalizedAction]) {
          entry[platform][normalizedAction] = 0;
        }

        entry[platform][normalizedAction] += 1;
      }
    });

    // Aggregate auto-commenter data
    autoCommenterLogs.forEach((log: any) => {
      const logDate = log.postedAt || log.createdAt;
      let timePoint;

      if (isHourly) {
        // For hourly data, round to the beginning of the hour
        const hourDate = new Date(logDate);
        const hourNum = hourDate.getHours();
        hourDate.setMinutes(0, 0, 0);
        timePoint = hourDate.toISOString();

        // Create entry if it doesn't exist (though it should already exist from pre-population)
        if (!dateMap.has(timePoint)) {
          const entry = createDateEntry(timePoint, hourNum);
          dateMap.set(timePoint, entry);
          timePoints.push(timePoint);
        }
      } else {
        // For daily data, use the date
        timePoint = logDate.toISOString().split('T')[0];

        // Create entry if it doesn't exist (though it should already exist from pre-population)
        if (!dateMap.has(timePoint)) {
          const entry = createDateEntry(timePoint);
          dateMap.set(timePoint, entry);
          timePoints.push(timePoint);
        }
      }

      const entry = dateMap.get(timePoint);

      if (entry) {
        entry.total += 1;
        entry.auto_commenter += 1;
      }
    });

    // Convert map to array and ensure proper time order
    // Sort timePoints to ensure chronological order
    timePoints.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    const result = timePoints.map(timePoint => {
      const entry = dateMap.get(timePoint);

      // Convert Set to Array before returning
      if (entry && entry.licenseKeys) {
        entry.licenseKeys = Array.from(entry.licenseKeys);
      }

      return entry;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[USAGE_POST]", error);
    return NextResponse.json(
      { error: "Failed to fetch usage data" },
      { status: 500 }
    );
  }
}