import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { lucia } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const sessionToken = authHeader.replace('Bearer ', '');
    const { session, user } = await lucia.validateSession(sessionToken);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "7";
    let startDate, endDate;
    let isHourly = false;
    endDate = new Date();
    if (period === "1") {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      isHourly = true;
    } else if (period === "month" || period === "30") {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    } else {
      const days = parseInt(period);
      startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
    }

    // Get usage logs for the date range for this user and event 'mobile'
    const usageLogs = await prismadb.usageTracking.findMany({
      where: {
        userId: user.id,
        event: 'mobile',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Generate all dates/hours in the range for the map
    const dateMap = new Map();
    const timePoints = [];
    if (isHourly) {
      const now = new Date();
      const currentHour = now.getHours();
      for (let hour = 0; hour <= currentHour; hour++) {
        const date = new Date(now);
        date.setHours(hour, 0, 0, 0);
        const timeLabel = date.toISOString();
        const hourLabel = `${hour}:00`;
        timePoints.push(timeLabel);
        dateMap.set(timeLabel, {
          date: timeLabel,
          hour: hourLabel,
          display: hour < 10 ? `0${hour}:00` : `${hour}:00`,
          total: 0,
          actions: {},
        });
      }
    } else {
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        timePoints.push(dateStr);
        dateMap.set(dateStr, {
          date: dateStr,
          total: 0,
          actions: {},
        });
      }
    }

    // Aggregate usage data
    usageLogs.forEach((log) => {
      let timePoint;
      if (isHourly) {
        const logDate = new Date(log.createdAt);
        logDate.setMinutes(0, 0, 0);
        timePoint = logDate.toISOString();
      } else {
        timePoint = log.createdAt.toISOString().split('T')[0];
      }
      const entry = dateMap.get(timePoint);
      if (entry) {
        entry.total += 1;
        if (!entry.actions[log.action]) {
          entry.actions[log.action] = 0;
        }
        entry.actions[log.action] += 1;
      }
    });

    // Convert map to array and ensure proper time order
    const result = timePoints.map(timePoint => {
      return dateMap.get(timePoint);
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[MOBILE_USAGE_ANALYTICS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
