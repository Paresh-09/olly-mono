// app/api/tools/youtube/transcript/extractor/route.ts
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { YouTubeVideo } from "@/lib/youtube";

// Define our own types since we can't access the package types
interface RawTranscript {
  text: string;
  duration: number;
  start: number; // Changed from 'offset' to 'start' to match API response
  timestamp: string;
  length?: number;
}

interface FormattedTranscriptSegment {
  timestamp: string;
  text: string;
  offset: number;
}

export interface TranscriptResponse {
  transcript: FormattedTranscriptSegment[];
  metadata: {
    videoId: string;
    language: string;
    thumbnailUrl: string;
    title?: string;
    duration?: number;
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");
    const shouldRefresh = searchParams.get("refresh") === "true";

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 },
      );
    }

    // Fetch video metadata to get duration and title
    let videoDetails;
    try {
      videoDetails = await YouTubeVideo.getVideoDetails(videoId);
    } catch (detailsError) {
      // Continue without video details if we can't get them
    }

    // Check if transcript already exists in database and we're not forcing a refresh
    if (!shouldRefresh) {
      const existingTranscript = await prismadb.youTubeTranscript.findUnique({
        where: { videoId },
      });

      if (existingTranscript) {
        // Return cached transcript data
        let transcriptData;
        try {
          // Handle different possible data formats
          if (typeof existingTranscript.transcript === 'string') {
            transcriptData = JSON.parse(existingTranscript.transcript);
          } else if (Array.isArray(existingTranscript.transcript)) {
            transcriptData = existingTranscript.transcript;
          } else {
            // If it's stored as an object with numeric keys, convert to array
            const data = existingTranscript.transcript as any;
            if (data && typeof data === 'object') {
              transcriptData = Object.values(data);
            } else {
              transcriptData = [];
            }
          }
          
          // Validate each transcript segment has the required fields
          transcriptData = transcriptData.map((segment: any) => ({
            timestamp: segment.timestamp || "00:00:00",
            text: segment.text || "",
            offset: typeof segment.offset === 'number' ? segment.offset : 
                   typeof segment.start === 'number' ? segment.start : 0
          }));
          
        } catch (e) {
          transcriptData = [];
        }
        
        // Ensure we have an array of transcript segments
        if (!Array.isArray(transcriptData)) {
          transcriptData = [];
        }
        
        // Only return cached data if it's valid
        if (transcriptData.length > 0) {
          const response = {
            transcript: transcriptData,
            metadata: {
              videoId,
              language: existingTranscript.language || "en",
              thumbnailUrl: existingTranscript.thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
              title: existingTranscript.title,
              duration: existingTranscript.duration,
              // Include additional metadata if available
              channelName: videoDetails?.channel,
              publishDate: videoDetails?.publishedAt,
              description: videoDetails?.description,
            },
          };
          
          return NextResponse.json(response);
        }
      }
    } else if (shouldRefresh) {
      // If we're forcing a refresh, delete the existing transcript first
      try {
        await prismadb.youTubeTranscript.deleteMany({
          where: { videoId },
        });
      } catch (deleteError) {
        // Continue even if deletion fails
      }
    }

    // Fetch new transcript
    const response = await fetch(
      `https://ollytranscriptworker-production.up.railway.app/api/transcript/${videoId}`,
      {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.TRANSCRIPT_APP_API_KEY!,
        },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch transcript: ${response.status}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    
    // Handle API errors
    if (data.error) {
      return NextResponse.json(
        { error: data.error },
        { status: 404 },
      );
    }
    
    const transcripts = data.transcript;
    if (!transcripts || !Array.isArray(transcripts) || transcripts.length === 0) {
      return NextResponse.json(
        { error: "No transcript segments found for this video" },
        { status: 404 },
      );
    }

    // Format transcript with timestamps and decode HTML entities
    const formattedTranscripts: FormattedTranscriptSegment[] = transcripts.map(
      (segment: RawTranscript) => ({
        timestamp: formatTimestamp(segment.start),
        text: decodeHTMLEntities(segment.text),
        offset: segment.start,
      }),
    );

    // Calculate total duration from the last segment if available
    const calculatedDuration = transcripts.length > 0 
      ? transcripts[transcripts.length - 1].start + transcripts[transcripts.length - 1].duration
      : null;

    // Store transcript in database - ensure we're storing a valid format
    try {
      // Convert to JSON string first to ensure it's JSON serializable
      const serializedTranscripts = JSON.stringify(formattedTranscripts);
      const parsedTranscripts = JSON.parse(serializedTranscripts);
      
      await prismadb.youTubeTranscript.create({
        data: {
          videoId,
          transcript: parsedTranscripts, 
          title: videoDetails?.title,
          thumbnailUrl: videoDetails?.thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          duration: videoDetails?.duration || calculatedDuration,
          language: "en", // Default to English
        },
      });
    } catch (dbError) {
      // We'll continue even if storage fails - just log the error
    }

    // Return the response
    return NextResponse.json({
      transcript: formattedTranscripts,
      metadata: {
        videoId,
        language: "en",
        thumbnailUrl: videoDetails?.thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        title: videoDetails?.title,
        duration: videoDetails?.duration || calculatedDuration,
        // Include additional metadata if available
        channelName: videoDetails?.channel,
        publishDate: videoDetails?.publishedAt,
        description: videoDetails?.description,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Failed to fetch transcript. Make sure the video has captions available.",
      },
      { status: 500 },
    );
  }
}

function formatTimestamp(offset: number): string {
  if (isNaN(offset)) {
    return "00:00:00"; // Fallback for invalid values
  }

  const hours = Math.floor(offset / 3600);
  const minutes = Math.floor((offset % 3600) / 60);
  const seconds = Math.floor(offset % 60);

  return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
}

function padZero(num: number): string {
  return num.toString().padStart(2, "0");
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\[Music\]/gi, "")
    .replace(/\[Applause\]/gi, "")
    .replace(/\[Laughter\]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}
