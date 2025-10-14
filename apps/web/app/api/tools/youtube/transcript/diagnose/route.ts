import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { YouTubeVideo } from "@/lib/youtube";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId") || "dQw4w9WgXcQ"; // Default to Rick Roll if no video ID
    
    const results = {
      timestamp: new Date().toISOString(),
      components: {} as Record<string, any>,
      issues: [] as string[],
      suggestions: [] as string[],
      overall: "pending"
    };
    
    // 1. Check database connectivity
    try {
      const startTime = Date.now();
      await prismadb.$queryRaw`SELECT 1`;
      results.components.database = {
        status: "ok",
        responseTime: Date.now() - startTime
      };
    } catch (dbError) {
      results.components.database = {
        status: "error",
        error: String(dbError)
      };
      results.issues.push("Database connection failed");
      results.suggestions.push("Check your database connection string and ensure the database is running");
    }
    
    // 2. Test YouTube API connectivity
    try {
      const startTime = Date.now();
      const videoDetails = await YouTubeVideo.getVideoDetails(videoId);
      results.components.youtubeApi = {
        status: videoDetails ? "ok" : "error",
        responseTime: Date.now() - startTime,
        data: videoDetails ? {
          title: videoDetails.title,
          channel: videoDetails.channel,
          duration: videoDetails.duration
        } : null
      };
      
      if (!videoDetails) {
        results.issues.push("YouTube API returned no video details");
        results.suggestions.push("Check your YouTube API key and quota limits");
      }
    } catch (ytError) {
      results.components.youtubeApi = {
        status: "error",
        error: String(ytError)
      };
      results.issues.push("YouTube API connection failed");
      results.suggestions.push("Verify your YouTube API configuration");
    }
    
    // 3. Test transcript API connectivity
    try {
      const startTime = Date.now();
      const transcriptApiKey = process.env.TRANSCRIPT_APP_API_KEY;
      
      if (!transcriptApiKey) {
        results.components.transcriptApi = {
          status: "error",
          error: "API key not configured"
        };
        results.issues.push("Transcript API key is missing");
        results.suggestions.push("Set the TRANSCRIPT_APP_API_KEY environment variable");
      } else {
        const response = await fetch(
          `https://function-bun-production-8799.up.railway.app/api/transcript/${videoId}`,
          {
            method: "get",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": transcriptApiKey,
            },
          }
        );
        
        results.components.transcriptApi = {
          status: response.ok ? "ok" : "error",
          responseTime: Date.now() - startTime,
          statusCode: response.status
        };
        
        if (!response.ok) {
          results.issues.push(`Transcript API returned status ${response.status}`);
          results.suggestions.push("Check the API endpoint and your API key");
        } else {
          try {
            const data = await response.json();
            results.components.transcriptApi.hasTranscript = 
              data && data.transcript && Array.isArray(data.transcript) && data.transcript.length > 0;
              
            if (!results.components.transcriptApi.hasTranscript) {
              results.issues.push("Transcript API returned no transcript data");
              results.suggestions.push("The video may not have captions available");
            }
          } catch (parseError) {
            results.components.transcriptApi.jsonError = String(parseError);
            results.issues.push("Failed to parse transcript API response");
            results.suggestions.push("The API response format may have changed");
          }
        }
      }
    } catch (apiError) {
      results.components.transcriptApi = {
        status: "error",
        error: String(apiError)
      };
      results.issues.push("Transcript API connection failed");
      results.suggestions.push("Check network connectivity to the transcript API");
    }
    
    // 4. Check for existing transcript in database
    try {
      const existingTranscript = await prismadb.youTubeTranscript.findUnique({
        where: { videoId },
      });
      
      results.components.cachedTranscript = {
        exists: !!existingTranscript,
        created: existingTranscript?.fetchedAt || null
      };
      
      if (existingTranscript) {
        try {
          const transcriptData = typeof existingTranscript.transcript === 'string' 
            ? JSON.parse(existingTranscript.transcript as string)
            : existingTranscript.transcript;
            
          results.components.cachedTranscript.valid = 
            Array.isArray(transcriptData) && transcriptData.length > 0;
            
          if (!results.components.cachedTranscript.valid) {
            results.issues.push("Cached transcript exists but data is invalid");
            results.suggestions.push("Delete the cached transcript and fetch it again");
          }
        } catch (parseError) {
          results.components.cachedTranscript.valid = false;
          results.components.cachedTranscript.parseError = String(parseError);
          results.issues.push("Cached transcript exists but JSON is invalid");
          results.suggestions.push("Delete the cached transcript and fetch it again");
        }
      }
    } catch (dbError) {
      results.components.cachedTranscript = {
        error: String(dbError)
      };
      results.issues.push("Failed to check for cached transcript");
    }
    
    // Determine overall status
    if (results.issues.length === 0) {
      results.overall = "ok";
    } else if (
      results.components.database?.status === "error" ||
      results.components.transcriptApi?.status === "error"
    ) {
      results.overall = "critical";
    } else {
      results.overall = "warning";
    }
    
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      overall: "error",
      error: String(error)
    }, { status: 500 });
  }
} 