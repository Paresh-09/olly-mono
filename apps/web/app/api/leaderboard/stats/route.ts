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
      // Monthly stats calculation
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

      // Get monthly usage data
      const monthlyUsage = await prismadb.usageTracking.groupBy({
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
      });

      const daysInMonth = endDate.getDate();
      let totalComments = 0;
      let totalCommentsPerDay = 0;
      let inflatedTotalComments = 0;
      let inflatedTotalCommentsPerDay = 0;
      let userCount = monthlyUsage.length;

      monthlyUsage.forEach((usage) => {
        const commentsPerDay = usage._count.action / daysInMonth;

        totalComments += usage._count.action;
        totalCommentsPerDay += commentsPerDay;

        // Apply inflation only to users with less than 10 comments per day
        if (commentsPerDay < 10) {
          inflatedTotalComments += usage._count.action * 2;
          inflatedTotalCommentsPerDay += commentsPerDay * 2;
        } else {
          inflatedTotalComments += usage._count.action;
          inflatedTotalCommentsPerDay += commentsPerDay;
        }
      });

      // Calculate averages
      const avgCommentsPerDay = totalCommentsPerDay / Math.max(1, userCount);
      const inflatedAvgCommentsPerDay =
        inflatedTotalCommentsPerDay / Math.max(1, userCount);

      // Calculate top ten average with inflation
      const sortedUsage = monthlyUsage
        .sort((a, b) => b._count.action - a._count.action)
        .slice(0, 10);

      const topTenAvg =
        sortedUsage.reduce((sum, usage) => {
          const commentsPerDay = usage._count.action / daysInMonth;

          // Apply inflation only to users with less than 10 comments per day
          if (commentsPerDay < 10) {
            return sum + commentsPerDay * 2;
          }
          return sum + commentsPerDay;
        }, 0) / Math.max(1, sortedUsage.length);

      const result = {
        averageCommentsPerDay: Math.round(inflatedAvgCommentsPerDay * 10) / 10,
        topTenAverage: Math.round(topTenAvg * 10) / 10,
        totalUsers: userCount,
        totalComments: inflatedTotalComments,
        visibilityMultiplier: 3.5,
        averageProfileViews:
          Math.round(inflatedAvgCommentsPerDay * 3.5 * 10) / 10,
      };

      // Update cache
      cachedData[cacheKey] = result;
      cacheTime[cacheKey] = now;

      return NextResponse.json(result);
    }

    // Default behavior for all-time stats (existing code)
    const leaderboardEntries = await prismadb.leaderboard.findMany({
      orderBy: {
        totalComments: "desc",
      },
      include: {
        user: {
          select: {
            username: true,
            createdAt: true,
          },
        },
        freeUser: {
          select: {
            username: true,
            createdAt: true,
          },
        },
      },
    });

    // Get the total comments and calculate comments per day
    let totalComments = 0;
    let totalCommentsPerDay = 0;
    let inflatedTotalComments = 0;
    let inflatedTotalCommentsPerDay = 0;
    let userCount = 0;

    leaderboardEntries.forEach((entry) => {
      // Calculate days since creation for this user
      const createdAt =
        entry.user?.createdAt || entry.freeUser?.createdAt || new Date();
      const daysSinceCreation = Math.max(
        1,
        Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)),
      );

      // Calculate comments per day
      const commentsPerDay = entry.totalComments / daysSinceCreation;

      // Add to totals
      totalComments += entry.totalComments;
      totalCommentsPerDay += commentsPerDay;
      userCount++;

      // Apply inflation only to users with less than 10 comments per day
      if (commentsPerDay < 10) {
        inflatedTotalComments += entry.totalComments * 2;
        inflatedTotalCommentsPerDay += commentsPerDay * 2;
      } else {
        inflatedTotalComments += entry.totalComments;
        inflatedTotalCommentsPerDay += commentsPerDay;
      }
    });

    // Calculate averages
    const avgCommentsPerDay = totalCommentsPerDay / Math.max(1, userCount);
    const inflatedAvgCommentsPerDay =
      inflatedTotalCommentsPerDay / Math.max(1, userCount);

    // Calculate top ten average with inflation
    const topTenAvg =
      leaderboardEntries.slice(0, 10).reduce((sum, entry) => {
        const createdAt =
          entry.user?.createdAt || entry.freeUser?.createdAt || new Date();
        const days = Math.max(
          1,
          Math.floor(
            (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
          ),
        );
        const commentsPerDay = entry.totalComments / days;

        // Apply inflation only to users with less than 10 comments per day
        if (commentsPerDay < 10) {
          return sum + commentsPerDay * 2;
        }
        return sum + commentsPerDay;
      }, 0) / 10;

    // Prepare result
    const result = {
      averageCommentsPerDay: Math.round(inflatedAvgCommentsPerDay * 10) / 10,
      topTenAverage: Math.round(topTenAvg * 10) / 10,
      totalUsers: leaderboardEntries.length,
      totalComments: inflatedTotalComments,
      visibilityMultiplier: 3.5, // Average of 3-4x
      averageProfileViews:
        Math.round(inflatedAvgCommentsPerDay * 3.5 * 10) / 10, // Inflated comments * visibility
    };

    // Update cache
    cachedData[cacheKey] = result;
    cacheTime[cacheKey] = now;

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error calculating leaderboard stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// import prismadb from '@/lib/prismadb';
// import { NextResponse } from 'next/server';
// import { headers } from 'next/headers';

// // Simple in-memory cache to avoid excessive database queries
// let cachedData: any = null;
// let cacheTime: number = 0;
// const CACHE_TTL = 3600000; // 1 hour in milliseconds

// // In-memory rate limiting
// const ipRequests: Record<string, { count: number, timestamp: number }> = {};
// const RATE_LIMIT_MAX = 30; // Maximum requests per window
// const RATE_LIMIT_WINDOW = 60000; // 1 minute window

// export async function GET() {
//   try {
//     // Rate limiting
//     const headersList = await headers();
//     const ip = (headersList.get('x-forwarded-for') || 'unknown-ip').split(',')[0].trim();

//     // Check if this IP has hit the rate limit
//     const now = Date.now();
//     if (ipRequests[ip]) {
//       // Reset counter if window has passed
//       if (now - ipRequests[ip].timestamp > RATE_LIMIT_WINDOW) {
//         ipRequests[ip] = { count: 1, timestamp: now };
//       } else if (ipRequests[ip].count >= RATE_LIMIT_MAX) {
//         // Rate limit exceeded
//         return NextResponse.json(
//           { error: 'Rate limit exceeded. Please try again later.' },
//           { status: 429 }
//         );
//       } else {
//         // Increment counter
//         ipRequests[ip].count++;
//       }
//     } else {
//       // First request from this IP
//       ipRequests[ip] = { count: 1, timestamp: now };
//     }

//     // Use cached data if available and not expired
//     if (cachedData && now - cacheTime < CACHE_TTL) {
//       return NextResponse.json(cachedData);
//     }

//     // Fetch data from database
//     const leaderboardEntries = await prismadb.leaderboard.findMany({
//       orderBy: {
//         totalComments: 'desc',
//       },
//       include: {
//         user: {
//           select: {
//             username: true,
//             createdAt: true,
//           },
//         },
//         freeUser: {
//           select: {
//             username: true,
//             createdAt: true,
//           },
//         },
//       },
//     });

//     // Get the total comments and calculate comments per day
//     let totalComments = 0;
//     let totalCommentsPerDay = 0;
//     let inflatedTotalComments = 0;
//     let inflatedTotalCommentsPerDay = 0;
//     let userCount = 0;

//     leaderboardEntries.forEach((entry) => {
//       // Calculate days since creation for this user
//       const createdAt = entry.user?.createdAt || entry.freeUser?.createdAt || new Date();
//       const daysSinceCreation = Math.max(1, Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)));

//       // Calculate comments per day
//       const commentsPerDay = entry.totalComments / daysSinceCreation;

//       // Add to totals
//       totalComments += entry.totalComments;
//       totalCommentsPerDay += commentsPerDay;
//       userCount++;

//       // Apply inflation only to users with less than 10 comments per day
//       if (commentsPerDay < 10) {
//         inflatedTotalComments += entry.totalComments * 2;
//         inflatedTotalCommentsPerDay += commentsPerDay * 2;
//       } else {
//         inflatedTotalComments += entry.totalComments;
//         inflatedTotalCommentsPerDay += commentsPerDay;
//       }
//     });

//     // Calculate averages
//     const avgCommentsPerDay = totalCommentsPerDay / Math.max(1, userCount);
//     const inflatedAvgCommentsPerDay = inflatedTotalCommentsPerDay / Math.max(1, userCount);

//     // Calculate top ten average with inflation
//     const topTenAvg = leaderboardEntries.slice(0, 10).reduce((sum, entry) => {
//       const createdAt = entry.user?.createdAt || entry.freeUser?.createdAt || new Date();
//       const days = Math.max(1, Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)));
//       const commentsPerDay = entry.totalComments / days;

//       // Apply inflation only to users with less than 10 comments per day
//       if (commentsPerDay < 10) {
//         return sum + (commentsPerDay * 2);
//       }
//       return sum + commentsPerDay;
//     }, 0) / 10;

//     // Prepare result
//     const result = {
//       averageCommentsPerDay: Math.round(inflatedAvgCommentsPerDay * 10) / 10,
//       topTenAverage: Math.round(topTenAvg * 10) / 10,
//       totalUsers: leaderboardEntries.length,
//       totalComments: inflatedTotalComments,
//       visibilityMultiplier: 3.5, // Average of 3-4x
//       averageProfileViews: Math.round(inflatedAvgCommentsPerDay * 3.5 * 10) / 10, // Inflated comments * visibility
//     };

//     // Update cache
//     cachedData = result;
//     cacheTime = now;

//     return NextResponse.json(result);
//   } catch (error) {
//     console.error('Error calculating leaderboard stats:', error);
//     return NextResponse.json(
//       { error: 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }

