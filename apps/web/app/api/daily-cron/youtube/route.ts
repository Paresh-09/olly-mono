import { NextResponse } from "next/server";
import axios from 'axios';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY as string;
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID as string;
const CRON_SECRET = process.env.CRON_SECRET as string;

interface YouTubeChannelStats {
  title: string;
  subscribers: number;
  views: number;
  videos: number;
}

interface DailyStats {
  date: string;
  subscribers: number;
  views: number;
  minutesWatched: number;
}

async function fetchYouTubeChannelStats(): Promise<YouTubeChannelStats> {
  const response = await axios.get(
    `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${YOUTUBE_CHANNEL_ID}&key=${YOUTUBE_API_KEY}`
  );

  const channelData = response.data.items[0];
  return {
    title: channelData.snippet.title,
    subscribers: parseInt(channelData.statistics.subscriberCount, 10),
    views: parseInt(channelData.statistics.viewCount, 10),
    videos: parseInt(channelData.statistics.videoCount, 10),
  };
}

async function fetch7DayStats(): Promise<any[]> {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const startDate = sevenDaysAgo.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];

  const response = await axios.get(
    `https://www.googleapis.com/youtube/v3/analytics/reports?dimensions=day&endDate=${endDate}&ids=channel==${YOUTUBE_CHANNEL_ID}&metrics=subscribersGained,views,estimatedMinutesWatched&startDate=${startDate}&key=${YOUTUBE_API_KEY}`
  );

  return response.data.rows;
}

function analyzeStats(stats: any[]): {
  dailyStats: DailyStats[];
  totalGrowth: { subscribers: number; views: number; minutesWatched: number };
  yesterday: DailyStats;
  today: DailyStats;
} {
  const dailyStats = stats.map(([date, subscribers, views, minutesWatched]: [string, string, string, string]) => ({
    date,
    subscribers: parseInt(subscribers, 10),
    views: parseInt(views, 10),
    minutesWatched: parseInt(minutesWatched, 10),
  }));

  const totalGrowth = dailyStats.reduce(
    (acc: { subscribers: number; views: number; minutesWatched: number }, day) => ({
      subscribers: acc.subscribers + day.subscribers,
      views: acc.views + day.views,
      minutesWatched: acc.minutesWatched + day.minutesWatched,
    }),
    { subscribers: 0, views: 0, minutesWatched: 0 }
  );

  const yesterday = dailyStats[dailyStats.length - 2];
  const today = dailyStats[dailyStats.length - 1];

  return {
    dailyStats,
    totalGrowth,
    yesterday,
    today,
  };
}

async function sendDiscordNotification(content: string, webhookUrl: string) {
  if (!webhookUrl) {
    console.error('Webhook URL is not defined.');
    throw new Error('Webhook URL is not defined.');
  }

  try {
    const response = await axios.post(webhookUrl, { content });
    return response;
  } catch (error) {
    console.error('Error sending Discord notification:', error);
    throw error;
  }
}

export async function GET(req: Request) {
  try {
    const isCronAuthorized = req.headers.get('Authorization') === `Bearer ${CRON_SECRET}`;

    if (!isCronAuthorized) {
      return new NextResponse("Unauthorized.", { status: 401 });
    }

    const channelStats = await fetchYouTubeChannelStats();
    const weeklyStats = await fetch7DayStats();
    const analyzedStats = analyzeStats(weeklyStats);

    const message = `
**YouTube Channel Stats - ${channelStats.title}**

**Subscribers:** ${channelStats.subscribers}
**Views:** ${channelStats.views}
**Videos:** ${channelStats.videos}

**7-Day Growth:**
- Total Subscribers Gained: ${analyzedStats.totalGrowth.subscribers}
- Total Views: ${analyzedStats.totalGrowth.views}
- Total Watch Time (minutes): ${analyzedStats.totalGrowth.minutesWatched}

**Daily Comparison:**
- Yesterday's Subscribers: ${analyzedStats.yesterday.subscribers}
- Today's Subscribers: ${analyzedStats.today.subscribers}
- Change: ${analyzedStats.today.subscribers - analyzedStats.yesterday.subscribers}

*Last updated: ${new Date().toUTCString()}*
    `;

    const webhookUrls = [
      process.env.YOUTUBE_DISCORD_WEBHOOK,
    ].filter(Boolean) as string[];

    for (const webhookUrl of webhookUrls) {
      await sendDiscordNotification(message, webhookUrl);
    }

    return NextResponse.json({ message: "YouTube stats sent to Discord." });

  } catch (error) {
    console.error("Error sending YouTube stats to Discord:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
