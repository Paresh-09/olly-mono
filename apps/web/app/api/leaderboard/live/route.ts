import prismadb from '@/lib/prismadb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get data from the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // First get the leaderboard entries
    const leaderboardEntries = await prismadb.leaderboard.findMany({
      take: 5,
      orderBy: {
        totalComments: 'desc',
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
        freeUser: {
          select: {
            username: true,
          },
        },
      },
    });

    // Then get recent activity
    const recentActivity = await prismadb.usageTracking.groupBy({
      by: ['userId'],
      where: {
        createdAt: {
          gte: oneHourAgo
        },
        action: 'comment'
      },
      _count: {
        id: true
      },
    });

    // Combine the data
    const formattedTopUsers = leaderboardEntries.map((entry) => {
      const recentCount = recentActivity.find(
        activity => activity.userId === entry.userId || activity.userId === entry.freeUserId
      )?._count.id || 0;

      return {
        username: entry.user?.username || entry.freeUser?.username || 'Anonymous',
        totalComments: entry.totalComments,
        level: entry.level,
        recentScore: recentCount * 100, // Gamification score based on recent activity
      };
    })
    .filter(entry => entry.username !== 'Anonymous')
    .sort((a, b) => b.recentScore - a.recentScore) // Sort by recent activity
    .slice(0, 5); // Take top 5

    // If no recent activity, return overall leaderboard
    if (formattedTopUsers.length === 0) {
      return NextResponse.json(
        leaderboardEntries.map(entry => ({
          username: entry.user?.username || entry.freeUser?.username || 'Anonymous',
          totalComments: entry.totalComments,
          level: entry.level,
          recentScore: entry.totalComments * 10, // Fallback score
        }))
        .filter(entry => entry.username !== 'Anonymous')
        .slice(0, 5)
      );
    }

    return NextResponse.json(formattedTopUsers);
  } catch (error) {
    console.error('Error fetching live leaderboard:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 