import prismadb from '@/lib/prismadb';
import { sendDiscordNotification } from '@/service/discord-notify';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const isCronAuthorized = req.headers.get('Authorization') === `Bearer ${process.env.CRON_SECRET}`;

    if (!isCronAuthorized) {
      return new NextResponse("Unauthorized.", { status: 401 });
    }

    const topUsers = await prismadb.leaderboard.findMany({
      take: 10,
      orderBy: {
        totalComments: 'desc',
      },
      include: {
        user: {
          select: {
            username: true,
            externalUserId: true,
          },
        },
        freeUser: {
          select: {
            username: true,
            externalUserId: true,
          },
        },
      },
    });

    const formattedTopUsers = topUsers.map((entry) => ({
      id: entry.id,
      username: entry.user?.username || entry.freeUser?.username || 'Unknown',
      externalUserId: entry.user?.externalUserId || entry.freeUser?.externalUserId || null,
      totalComments: entry.totalComments,
      level: entry.level,
    }));

    const getMedal = (index: number) => {
      switch (index) {
        case 0: return '🥇';
        case 1: return '🥈';
        case 2: return '🥉';
        default: return '';
      }
    };

    // Create the Discord message
    const message = `
**Top 10 Users:**
${formattedTopUsers.map((user, index) => {
  const medal = getMedal(index);
  return `${index + 1}. ${medal} **@${user.username}** \`(${user.externalUserId || 'Unknown'})\`
   Level: ${user.level}, Total Comments: ${user.totalComments}`;
}).join('\n\n')}

*Last updated: ${new Date().toUTCString()}*
    `;

    const webhookUrls = [
      process.env.LEADERBOARD_DISCORD,
    ].filter(Boolean) as string[];

    for (const webhookUrl of webhookUrls) {
      await sendDiscordNotification(message, true);
    }

    return NextResponse.json({ success: true, message: 'Leaderboard sent to Discord' });
  } catch (error) {
    console.error('Error fetching leaderboard and sending to Discord:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}