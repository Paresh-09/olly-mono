import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { headers } from "next/headers";

// Simple in-memory cache to avoid excessive database queries
let cachedData: Record<string, any> = {};
let cacheTime: Record<string, number> = {};
const CACHE_TTL = 3600000; // 1 hour in milliseconds

// In-memory rate limiting (basic implementation)
const ipRequests: Record<string, { count: number; timestamp: number }> = {};
const RATE_LIMIT_MAX = 30; // Maximum requests per window
const RATE_LIMIT_WINDOW = 60000; // 1 minute window

export async function GET(request: Request) {
  try {
    // Check if admin using the server session
    const { user } = await validateRequest();
    const isAdmin = user?.isAdmin || user?.isSuperAdmin;

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
    if (
      cachedData[cacheKey] &&
      now - (cacheTime[cacheKey] || 0) < CACHE_TTL &&
      !isAdmin
    ) {
      return NextResponse.json(cachedData[cacheKey]);
    }

    let whereClause = {};
    let isMonthlyData = false;

    // If month parameter is provided, filter by that month
    if (monthParam && monthParam !== "all") {
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

      isMonthlyData = true;

      // For monthly data, we need to aggregate usage tracking data
      const monthlyUsage = await prismadb.usageTracking.groupBy({
        by: ["userId", "externalUserId"],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          action: "comment", // Only count comments
        },
        _count: {
          action: true,
        },
      });

      // Get user details for the monthly usage
      const userIds = monthlyUsage
        .filter((usage) => usage.userId)
        .map((usage) => usage.userId)
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
          externalUserId: true,
          createdAt: true,
        },
      });

      // Also get free users
      const externalUserIds = monthlyUsage
        .filter((usage) => usage.externalUserId && !usage.userId)
        .map((usage) => usage.externalUserId)
        .filter(Boolean) as string[];

      const freeUsers = await prismadb.freeUser.findMany({
        where: {
          externalUserId: {
            in: externalUserIds,
          },
        },
        select: {
          id: true,
          username: true,
          externalUserId: true,
          createdAt: true,
        },
      });

      // Create monthly leaderboard data
      const monthlyLeaderboard = monthlyUsage
        .map((usage) => {
          const user = users.find((u) => u.id === usage.userId);
          const freeUser = freeUsers.find(
            (fu) => fu.externalUserId === usage.externalUserId,
          );

          const userInfo = user || freeUser;
          if (!userInfo) return null;

          const daysInMonth = endDate.getDate();
          const commentsPerDay = usage._count.action / daysInMonth;

          return {
            id: userInfo.id,
            userId: user?.id,
            freeUserId: freeUser?.id,
            totalComments: usage._count.action,
            level: Math.floor(usage._count.action / 10) + 1, // Simple level calculation
            user: user
              ? {
                  username: user.username,
                  externalUserId: user.externalUserId,
                  createdAt: user.createdAt,
                }
              : null,
            freeUser: freeUser
              ? {
                  username: freeUser.username,
                  externalUserId: freeUser.externalUserId,
                  createdAt: freeUser.createdAt,
                }
              : null,
            commentsPerDay,
          };
        })
        .filter(Boolean)
        .sort((a, b) => b!.totalComments - a!.totalComments);

      const formattedMonthlyUsers = monthlyLeaderboard
        .slice(0, 50)
        .map((entry) => {
          if (!entry) return null;

          const rawUsername =
            entry.user?.username || entry.freeUser?.username || "Unknown";
          const createdAt =
            entry.user?.createdAt || entry.freeUser?.createdAt || new Date();

          // Mask username for privacy unless admin
          let username = rawUsername;
          if (!isAdmin && rawUsername !== "Unknown") {
            if (rawUsername.length > 4) {
              username =
                rawUsername.slice(0, 2) +
                "*".repeat(rawUsername.length - 3) +
                rawUsername.slice(-1);
            } else if (rawUsername.length > 2) {
              username =
                rawUsername.slice(0, 1) + "*".repeat(rawUsername.length - 1);
            }
          }

          return {
            id: entry.id,
            username: username,
            totalComments: entry.totalComments,
            level: entry.level,
            commentsPerDay: parseFloat(entry.commentsPerDay.toFixed(1)),
            memberSince: createdAt.toISOString().split("T")[0],
          };
        })
        .filter(Boolean);

      // Update cache
      cachedData[cacheKey] = formattedMonthlyUsers;
      cacheTime[cacheKey] = now;

      return NextResponse.json(formattedMonthlyUsers);
    }

    // Default behavior for all-time data (existing code)
    const topUsers = await prismadb.leaderboard.findMany({
      take: 50,
      orderBy: {
        totalComments: "desc",
      },
      include: {
        user: {
          select: {
            username: true,
            externalUserId: true,
            createdAt: true,
          },
        },
        freeUser: {
          select: {
            username: true,
            externalUserId: true,
            createdAt: true,
          },
        },
      },
    });

    const formattedTopUsers = topUsers.map((entry) => {
      const rawUsername =
        entry.user?.username || entry.freeUser?.username || "Unknown";

      // Get account creation date for calculating comments per day
      const createdAt =
        entry.user?.createdAt || entry.freeUser?.createdAt || new Date();

      // Calculate days since account creation
      const daysSinceCreation = Math.max(
        1,
        Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)),
      );

      // Calculate comments per day (at least 1 day to avoid division by zero)
      const commentsPerDay = (entry.totalComments / daysSinceCreation).toFixed(
        1,
      );

      // Mask username for privacy unless admin
      let username = rawUsername;
      if (!isAdmin && rawUsername !== "Unknown") {
        // Keep first 2 chars and last char, mask the rest
        if (rawUsername.length > 4) {
          username =
            rawUsername.slice(0, 2) +
            "*".repeat(rawUsername.length - 3) +
            rawUsername.slice(-1);
        } else if (rawUsername.length > 2) {
          username =
            rawUsername.slice(0, 1) + "*".repeat(rawUsername.length - 1);
        }
        // If very short, don't mask
      }

      return {
        id: entry.id,
        username: username,
        totalComments: entry.totalComments,
        level: entry.level,
        commentsPerDay: parseFloat(commentsPerDay),
        memberSince: createdAt.toISOString().split("T")[0],
      };
    });

    // Update cache
    cachedData[cacheKey] = formattedTopUsers;
    cacheTime[cacheKey] = now;

    return NextResponse.json(formattedTopUsers);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
// import prismadb from '@/lib/prismadb';
// import { NextResponse } from 'next/server';
// import { validateRequest } from '@/lib/auth';
// import { headers } from 'next/headers';

// // Simple in-memory cache to avoid excessive database queries
// let cachedData: any = null;
// let cacheTime: number = 0;
// const CACHE_TTL = 3600000; // 1 hour in milliseconds

// // In-memory rate limiting (basic implementation)
// const ipRequests: Record<string, { count: number, timestamp: number }> = {};
// const RATE_LIMIT_MAX = 30; // Maximum requests per window
// const RATE_LIMIT_WINDOW = 60000; // 1 minute window

// export async function GET() {
//   try {
//     // Check if admin using the server session
//     const { user } = await validateRequest();
//     const isAdmin = user?.isAdmin || user?.isSuperAdmin;

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
//     if (cachedData && now - cacheTime < CACHE_TTL && !isAdmin) {
//       return NextResponse.json(cachedData);
//     }

//     // Fetch data from database
//     const topUsers = await prismadb.leaderboard.findMany({
//       take: 50, // Increased to top 50 users
//       orderBy: {
//         totalComments: 'desc',
//       },
//       include: {
//         user: {
//           select: {
//             username: true,
//             externalUserId: true,
//             createdAt: true, // Added to calculate comments per day
//           },
//         },
//         freeUser: {
//           select: {
//             username: true,
//             externalUserId: true,
//             createdAt: true, // Added to calculate comments per day
//           },
//         },
//       },
//     });

//     const formattedTopUsers = topUsers.map((entry) => {
//       const rawUsername = entry.user?.username || entry.freeUser?.username || 'Unknown';

//       // Get account creation date for calculating comments per day
//       const createdAt = entry.user?.createdAt || entry.freeUser?.createdAt || new Date();

//       // Calculate days since account creation
//       const daysSinceCreation = Math.max(1, Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)));

//       // Calculate comments per day (at least 1 day to avoid division by zero)
//       const commentsPerDay = (entry.totalComments / daysSinceCreation).toFixed(1);

//       // Mask username for privacy unless admin
//       let username = rawUsername;
//       if (!isAdmin && rawUsername !== 'Unknown') {
//         // Keep first 2 chars and last char, mask the rest
//         if (rawUsername.length > 4) {
//           username = rawUsername.slice(0, 2) + '*'.repeat(rawUsername.length - 3) + rawUsername.slice(-1);
//         } else if (rawUsername.length > 2) {
//           username = rawUsername.slice(0, 1) + '*'.repeat(rawUsername.length - 1);
//         }
//         // If very short, don't mask
//       }

//       return {
//         id: entry.id,
//         username: username,
//         totalComments: entry.totalComments,
//         level: entry.level,
//         commentsPerDay: parseFloat(commentsPerDay),
//         memberSince: createdAt.toISOString().split('T')[0], // Just show the date, not time
//       };
//     });

//     // Update cache
//     cachedData = formattedTopUsers;
//     cacheTime = now;

//     return NextResponse.json(formattedTopUsers);
//   } catch (error) {
//     console.error('Error fetching leaderboard:', error);
//     return NextResponse.json(
//       { error: 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }

