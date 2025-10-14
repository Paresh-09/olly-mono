import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

// Simple in-memory cache to avoid excessive database queries
let cachedData: Record<string, any> = {};
let cacheTime: Record<string, number> = {};
const CACHE_TTL = 3600000; // 1 hour in milliseconds

// In-memory rate limiting
const ipRequests: Record<string, { count: number; timestamp: number }> = {};
const RATE_LIMIT_MAX = 30; // Maximum requests per window
const RATE_LIMIT_WINDOW = 60000; // 1 minute window

export async function GET(request: Request) {
  try {
    // Rate limiting
    const headersList = await headers();
    const ip = (headersList.get("x-forwarded-for") || "unknown-ip")
      .split(",")[0]
      .trim();

    // Check if this IP has hit the rate limit
    const now = Date.now();
    if (ipRequests[ip]) {
      // Reset counter if window has passed
      if (now - ipRequests[ip].timestamp > RATE_LIMIT_WINDOW) {
        ipRequests[ip] = { count: 1, timestamp: now };
      } else if (ipRequests[ip].count >= RATE_LIMIT_MAX) {
        // Rate limit exceeded
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 429 },
        );
      } else {
        // Increment counter
        ipRequests[ip].count++;
      }
    } else {
      // First request from this IP
      ipRequests[ip] = { count: 1, timestamp: now };
    }

    // Parse month parameter from URL
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month");
    const cacheKey = monthParam || "all";

    // Use cached data if available and not expired
    if (cachedData[cacheKey] && now - (cacheTime[cacheKey] || 0) < CACHE_TTL) {
      return NextResponse.json(cachedData[cacheKey]);
    }

    if (monthParam && monthParam !== "all") {
      // Monthly streaks calculation
      const [year, month] = monthParam.split("-");
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(
        parseInt(year),
        parseInt(month),
        0,
        23,
        59,
        59,
        999,
      );

      // For monthly data, we need to calculate streaks based on daily activity within that month
      // This is a simplified approach - you might want to implement more sophisticated streak calculation

      // Get daily activity counts for the month
      const dailyActivity = await prismadb.usageTracking.groupBy({
        by: ["userId", "externalUserId"],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          action: "comment",
        },
        _count: {
          action: true,
        },
        _min: {
          createdAt: true,
        },
        _max: {
          createdAt: true,
        },
      });

      // Get user details
      const userIds = dailyActivity
        .filter((activity) => activity.userId)
        .map((activity) => activity.userId)
        .filter(Boolean) as string[];

      const users = await prismadb.user.findMany({
        where: {
          id: {
            in: userIds,
          },
        },
        select: {
          id: true,
          username: true,
          createdAt: true,
        },
      });

      // Calculate monthly streaks (simplified - based on activity frequency)
      const monthlyStreaks = dailyActivity
        .map((activity) => {
          const user = users.find((u) => u.id === activity.userId);
          if (!user) return null;

          const daysInMonth = endDate.getDate();
          const activityDays = Math.ceil(activity._count.action / 5); // Assume 5 comments per active day
          const estimatedStreak = Math.min(activityDays, daysInMonth);

          return {
            userId: user.id,
            username: user.username,
            currentStreak: estimatedStreak,
            maxStreak: estimatedStreak, // For monthly view, current = max
            lastActivity:
              activity._max.createdAt?.toISOString() ||
              new Date().toISOString(),
            memberSince: user.createdAt?.toISOString().split("T")[0],
          };
        })
        .filter(Boolean)
        .sort((a, b) => b!.currentStreak - a!.currentStreak);

      const result = monthlyStreaks.slice(0, 50);

      // Update cache
      cachedData[cacheKey] = result;
      cacheTime[cacheKey] = now;

      return NextResponse.json(result);
    }

    // Default behavior for all-time streaks (existing code)
    const topStreaks = await prismadb.userStreak.findMany({
      take: 50,
      orderBy: {
        maxStreak: "desc",
      },
      include: {
        user: {
          select: {
            username: true,
            createdAt: true,
          },
        },
      },
    });

    const formatted = topStreaks.map((entry) => ({
      userId: entry.userId,
      username: entry.user?.username || "Unknown",
      currentStreak: entry.currentStreak,
      maxStreak: entry.maxStreak,
      lastActivity: entry.lastActivity,
      memberSince: entry.user?.createdAt
        ? entry.user.createdAt.toISOString().split("T")[0]
        : undefined,
    }));

    // Update cache
    cachedData[cacheKey] = formatted;
    cacheTime[cacheKey] = now;

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching streak leaderboard:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
// import prismadb from '@/lib/prismadb';
// import { NextResponse } from 'next/server';

// export async function GET() {
//   try {
//     // Fetch top 50 users by maxStreak
//     const topStreaks = await prismadb.userStreak.findMany({
//       take: 50,
//       orderBy: {
//         maxStreak: 'desc',
//       },
//       include: {
//         user: {
//           select: {
//             username: true,
//             createdAt: true,
//           },
//         },
//       },
//     });

//     const formatted = topStreaks.map((entry) => ({
//       userId: entry.userId,
//       username: entry.user?.username || 'Unknown',
//       currentStreak: entry.currentStreak,
//       maxStreak: entry.maxStreak,
//       lastActivity: entry.lastActivity,
//       memberSince: entry.user?.createdAt ? entry.user.createdAt.toISOString().split('T')[0] : undefined,
//     }));

//     return NextResponse.json(formatted);
//   } catch (error) {
//     console.error('Error fetching streak leaderboard:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }

