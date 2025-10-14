import { NextResponse } from "next/server";
import OpenAI from "openai";
import prismadb from "@/lib/prismadb";
import { YouTubeVideo } from "@/lib/youtube";

interface ViralityRequest {
  videoId: string;
  forceRefresh?: boolean;
}

interface ViralityScore {
  overall: number;
  engagement: number;
  quality: number;
  trend: number;
  metrics: {
    viewToLikeRatio?: number;
    viewsPerDay?: number;
    commentEngagement?: number;
    contentQuality?: number;
    videoLength?: number;
    titleEffectiveness?: number;
    topicTrend?: number;
  };
  insights: string[];
  recommendations: string[];
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { videoId, forceRefresh = false }: ViralityRequest = await request.json();

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    // Check if transcript exists in the database
    const transcript = await prismadb.youTubeTranscript.findUnique({
      where: { videoId },
      include: { viralityAnalysis: true }
    });

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript not found. Please load the transcript first." },
        { status: 404 }
      );
    }

    // If virality analysis exists and no force refresh, return existing analysis
    if (transcript.viralityAnalysis && !forceRefresh) {
      return NextResponse.json({
        viralityScore: {
          overall: transcript.viralityAnalysis.overallScore,
          engagement: transcript.viralityAnalysis.engagementScore,
          quality: transcript.viralityAnalysis.qualityScore,
          trend: transcript.viralityAnalysis.trendScore,
          metrics: {
            viewToLikeRatio: transcript.viralityAnalysis.viewToLikeRatio,
            viewsPerDay: transcript.viralityAnalysis.viewsPerDay,
            commentEngagement: transcript.viralityAnalysis.commentEngagement,
            contentQuality: transcript.viralityAnalysis.contentQuality,
            videoLength: transcript.duration,
            titleEffectiveness: transcript.viralityAnalysis.titleEffectiveness,
            topicTrend: transcript.viralityAnalysis.topicTrend
          },
          insights: transcript.viralityAnalysis.insights as string[],
          recommendations: transcript.viralityAnalysis.recommendations as string[]
        },
        cached: true
      });
    }

    // Get video details from YouTube API
    const videoDetails = await YouTubeVideo.getVideoDetails(videoId);
    if (!videoDetails) {
      return NextResponse.json(
        { error: "Failed to fetch video details" },
        { status: 404 }
      );
    }

    // Calculate basic metrics
    const viewCount = parseInt(videoDetails.viewCount || "0");
    const likeCount = parseInt(videoDetails.likeCount || "0");
    
    // Calculate upload date metrics
    const uploadDate = new Date(videoDetails.publishedAt || Date.now());
    const daysSinceUpload = Math.max(1, Math.floor((Date.now() - uploadDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Calculate metrics
    const viewToLikeRatio = viewCount > 0 ? likeCount / viewCount * 100 : 0;
    const viewsPerDay = viewCount / daysSinceUpload;

    // Prepare data for AI analysis
    const videoData = {
      title: videoDetails.title,
      description: videoDetails.description,
      viewCount,
      likeCount,
      daysSinceUpload,
      duration: videoDetails.duration,
      tags: videoDetails.tags || [],
      channel: videoDetails.channel,
      viewToLikeRatio,
      viewsPerDay
    };

    // Get part of transcript for AI analysis
    const formattedTranscript = transcript.transcript as any;
    // Extract a sample of the transcript for analysis (to keep token usage reasonable)
    const transcriptSample = formattedTranscript
      .slice(0, Math.min(formattedTranscript.length, 20))
      .map((segment: any) => segment.text)
      .join(" ");

    // Perform AI analysis for content quality and virality insights
    const aiAnalysis = await analyzeContent(videoData, transcriptSample);

    // Calculate overall virality score (0-100)
    let engagementScore = calculateEngagementScore(viewToLikeRatio, viewsPerDay);
    let qualityScore = aiAnalysis.contentQualityScore;
    let trendScore = aiAnalysis.topicTrendScore;

    const overallScore = Math.min(
      100,
      Math.round((engagementScore * 0.4) + (qualityScore * 0.4) + (trendScore * 0.2))
    );

    // Prepare the response
    const viralityScore: ViralityScore = {
      overall: overallScore,
      engagement: engagementScore,
      quality: qualityScore,
      trend: trendScore,
      metrics: {
        viewToLikeRatio,
        viewsPerDay,
        commentEngagement: aiAnalysis.commentEngagement,
        contentQuality: aiAnalysis.contentQuality,
        videoLength: videoDetails.duration,
        titleEffectiveness: aiAnalysis.titleEffectiveness,
        topicTrend: aiAnalysis.topicTrend
      },
      insights: aiAnalysis.insights,
      recommendations: aiAnalysis.recommendations
    };

    // Store the virality analysis in the database
    await prismadb.youTubeViralityAnalysis.upsert({
      where: {
        transcriptId: transcript.id
      },
      update: {
        overallScore,
        engagementScore,
        qualityScore,
        trendScore,
        viewToLikeRatio,
        viewsPerDay,
        commentEngagement: aiAnalysis.commentEngagement,
        contentQuality: aiAnalysis.contentQuality,
        titleEffectiveness: aiAnalysis.titleEffectiveness,
        topicTrend: aiAnalysis.topicTrend,
        insights: aiAnalysis.insights,
        recommendations: aiAnalysis.recommendations,
        updatedAt: new Date()
      },
      create: {
        transcriptId: transcript.id,
        overallScore,
        engagementScore,
        qualityScore,
        trendScore,
        viewToLikeRatio,
        viewsPerDay,
        commentEngagement: aiAnalysis.commentEngagement,
        contentQuality: aiAnalysis.contentQuality,
        titleEffectiveness: aiAnalysis.titleEffectiveness,
        topicTrend: aiAnalysis.topicTrend,
        insights: aiAnalysis.insights,
        recommendations: aiAnalysis.recommendations
      }
    });

    return NextResponse.json({ viralityScore, cached: false });

  } catch (error) {
    console.error("Virality analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze video virality" },
      { status: 500 }
    );
  }
}

// Calculate engagement score based on metrics
function calculateEngagementScore(viewToLikeRatio: number, viewsPerDay: number): number {
  // These thresholds can be adjusted based on analysis of viral videos
  const maxLikeRatio = 10; // 10% like/view ratio is excellent
  const likeRatioScore = Math.min(100, (viewToLikeRatio / maxLikeRatio) * 100);
  
  // Adjust these thresholds based on your definition of viral
  const viewsPerDayScore = Math.min(100, Math.log10(viewsPerDay + 1) * 20);
  
  // Weight the scores (can be adjusted)
  return Math.round((likeRatioScore * 0.6) + (viewsPerDayScore * 0.4));
}

// Use AI to analyze content quality and generate insights
async function analyzeContent(videoData: any, transcriptSample: string) {
  const prompt = `
You are a video content analyzer that specializes in determining virality factors.
Analyze this YouTube video data and provide scores and insights.

VIDEO DATA:
Title: "${videoData.title}"
Description: "${videoData.description ? videoData.description.substring(0, 300) + '...' : 'None'}"
View Count: ${videoData.viewCount.toLocaleString()}
Like Count: ${videoData.likeCount.toLocaleString()}
Days Since Upload: ${videoData.daysSinceUpload}
Duration: ${Math.floor(videoData.duration / 60)} minutes ${videoData.duration % 60} seconds
Tags: ${videoData.tags.slice(0, 10).join(", ")}${videoData.tags.length > 10 ? '...' : ''}
Channel: ${videoData.channel || 'Unknown'}

METRICS:
View-to-Like Ratio: ${videoData.viewToLikeRatio.toFixed(2)}%
Views Per Day: ${Math.round(videoData.viewsPerDay).toLocaleString()}

TRANSCRIPT SAMPLE:
${transcriptSample}

Based on this information, please provide the following:

1. Content Quality Score (0-100): Rate the quality of the content based on the title, description, and transcript sample.
2. Topic Trend Score (0-100): Evaluate how trendy or timely the topic is.
3. Title Effectiveness (0-100): How compelling and clickable is the title?
4. Comment Engagement Prediction (0-100): Predict the level of comment engagement based on content type.
5. Content Quality Assessment (0-100): Assess overall production value and content structure from the sample.
6. Topic Trend Assessment (0-100): How relevant is this to current trends?
7. Five specific insights about what's making this video perform well or poorly.
8. Three recommendations to improve performance.

Format your response as JSON with the following structure:
{
  "contentQualityScore": number,
  "topicTrendScore": number,
  "titleEffectiveness": number,
  "commentEngagement": number,
  "contentQuality": number,
  "topicTrend": number,
  "insights": [string, string, string, string, string],
  "recommendations": [string, string, string]
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are a video content analysis expert." },
        { role: "user", content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.4
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return {
      contentQualityScore: result.contentQualityScore || 50,
      topicTrendScore: result.topicTrendScore || 50,
      titleEffectiveness: result.titleEffectiveness || 50,
      commentEngagement: result.commentEngagement || 50,
      contentQuality: result.contentQuality || 50,
      topicTrend: result.topicTrend || 50,
      insights: result.insights || [],
      recommendations: result.recommendations || []
    };
  } catch (error) {
    console.error("AI analysis error:", error);
    // Return default values in case of error
    return {
      contentQualityScore: 50,
      topicTrendScore: 50,
      titleEffectiveness: 50,
      commentEngagement: 50,
      contentQuality: 50,
      topicTrend: 50,
      insights: ["Could not generate insights due to an error"],
      recommendations: ["Could not generate recommendations due to an error"]
    };
  }
}

// Add a health check feature to the route.ts file
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const checkType = searchParams.get("check");
    
    // Perform basic health check
    if (checkType === "health") {
      // Check for API key
      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json({
          status: "warning",
          message: "OpenAI API key is not configured",
        });
      }
      
      // Check if we can access the database
      try {
        const transcriptCount = await prismadb.youTubeTranscript.count();
        
        return NextResponse.json({
          status: "ok",
          message: "Virality API is working correctly",
          transcripts: transcriptCount,
          openai: !!process.env.OPENAI_API_KEY,
        });
      } catch (dbError) {
        return NextResponse.json({
          status: "error",
          message: "Database connection error",
          error: String(dbError),
        }, { status: 500 });
      }
    }
    
    // Add more check types as needed
    
    return NextResponse.json({
      status: "ok",
      message: "Virality API is operational"
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Health check failed",
      error: String(error)
    }, { status: 500 });
  }
}