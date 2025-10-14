import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prismadb";

export async function GET(request: Request) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "7";
    const specificLicenseKey = searchParams.get("licenseKey");

    // Handle different time periods
    let startDate, endDate;
    let isHourly = false;

    endDate = new Date();

    if (period === "today") {
      // For today, we want to show hourly data
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0); // Start of today
      isHourly = true;
    } else {
      // For other periods, use days
      const days = parseInt(period);
      startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
    }

    // Get user's license keys
    let userLicenses = await prisma.userLicenseKey.findMany({
      where: {
        userId: user.id,
      },
      include: {
        licenseKey: true,
      },
    });

    // Get user's sub-licenses
    let subLicenses = await prisma.subLicense.findMany({
      where: {
        assignedEmail: user.email,
        status: "ACTIVE",
      },
    });

    // If a specific license key is requested, filter the data
    if (specificLicenseKey) {
      // Check if it's a main license key
      userLicenses = userLicenses.filter(ul => ul.licenseKey.key === specificLicenseKey);
      // Check if it's a sub-license key
      subLicenses = subLicenses.filter(sl => sl.key === specificLicenseKey);
    }

    const licenseKeyIds = userLicenses.map((ul) => ul.licenseKeyId);
    const subLicenseIds = subLicenses.map((sl) => sl.id);

    // Build the where clause for usage logs
    let usageWhereClause: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (specificLicenseKey) {
      // If specific license is requested, only get data for that license
      const orConditions = [];
      if (licenseKeyIds.length > 0) {
        orConditions.push({ licenseKeyId: { in: licenseKeyIds } });
      }
      if (subLicenseIds.length > 0) {
        orConditions.push({ subLicenseId: { in: subLicenseIds } });
      }
      if (orConditions.length > 0) {
        usageWhereClause.OR = orConditions;
      } else {
        // No matching license found, return empty result
        usageWhereClause.id = -1; // This will return no results
      }
    } else {
      // Get all user's data
      const allLicenseIds = [...licenseKeyIds, ...subLicenseIds];
      usageWhereClause.OR = [
        { licenseKeyId: { in: allLicenseIds } },
        { userId: user.id },
        {
          subLicenseId: { in: subLicenseIds },
        },
      ];
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

    // Get auto-commenter history
    const autoCommenterLogs = await prisma.autoCommenterHistory.findMany({
      where: {
        userId: user.id,
        postedAt: {
          gte: startDate,
          lte: endDate,
        },
        status: 'POSTED',
      },
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
        producthunt: { comment: 0, like: 0, upvote: 0 },
        auto_commenter: 0,
        licenseKeys: new Set(),
      };

      if (hourNum !== undefined) {
        entry.hour = `${hourNum}:00`;
        entry.display = hourNum < 10 ? `0${hourNum}:00` : `${hourNum}:00`;
      }

      return entry;
    };

    // PRE-POPULATE the complete timeline (this is what was missing!)
    if (isHourly) {
      // Generate all hours for today
      const current = new Date(startDate);
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
      const current = new Date(startDate);

      while (current <= endDate) {
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

        // Ensure Facebook is included in the aggregation logic
        if (entry[log.platform.toLowerCase()]) {
          const platform = log.platform.toLowerCase();
          const action = log.action.toLowerCase();

          if (!entry[platform][action]) {
            entry[platform][action] = 0;
          }

          entry[platform][action] += 1;
        } else if (log.platform.toLowerCase() === "facebook") {
          if (!entry.facebook) {
            entry.facebook = { comment: 0, like: 0 };
          }

          const action = log.action.toLowerCase();

          if (!entry.facebook[action]) {
            entry.facebook[action] = 0;
          }

          entry.facebook[action] += 1;
        } else if (log.platform.toLowerCase() === "tiktok") {
          if (!entry.tiktok) {
            entry.tiktok = { comment: 0, like: 0 };
          }

          const action = log.action.toLowerCase();

          if (!entry.tiktok[action]) {
            entry.tiktok[action] = 0;
          }

          entry.tiktok[action] += 1;
        } else if (log.platform.toLowerCase() === "producthunt") {
          if (!entry.producthunt) {
            entry.producthunt = { comment: 0, like: 0, upvote: 0 };
          }

          const action = log.action.toLowerCase();

          if (!entry.producthunt[action]) {
            entry.producthunt[action] = 0;
          }

          entry.producthunt[action] += 1;
        }
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

    // If no data found and a specific license was requested, still return the complete timeline with zeros
    return NextResponse.json(result);
  } catch (error) {
    console.error("[USAGE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}