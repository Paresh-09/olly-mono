// app/api/tools/youtube/transcript/ai/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import prismadb from "@/lib/prismadb";

interface AIRequest {
  videoId: string;
  action: 'summarize' | 'chapters' | 'key_points' | 'questions';
  forceRegenerate?: boolean; // Optional flag to force regeneration
}

// Map action to AIContentType enum value
const actionToContentType: Record<string, string> = {
  'summarize': 'SUMMARY',
  'chapters': 'CHAPTERS',
  'key_points': 'KEY_POINTS',
  'questions': 'QUESTIONS'
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();

    
    const { videoId, action, forceRegenerate = false }: AIRequest = requestBody;

    if (!videoId || !action) {
      console.error('Missing required parameters:', { videoId, action });
      return NextResponse.json(
        { error: "Video ID and action are required" },
        { status: 400 }
      );
    }
    
    // Validate that action is one of the allowed values
    const validActions = ['summarize', 'chapters', 'key_points', 'questions'];
    if (!validActions.includes(action)) {
      console.error('Invalid action:', action);
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }

    // Find transcript in database
    const transcript = await prismadb.youTubeTranscript.findUnique({
      where: { videoId },
      include: {
        aiContents: {
          where: {
            type: actionToContentType[action] as any
          }
        }
      }
    });

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript not found. Please load the transcript first." },
        { status: 404 }
      );
    }

    // Return existing AI content if available and not forcing regeneration
    if (!forceRegenerate && transcript.aiContents.length > 0) {
     
      return NextResponse.json({ 
        [action === 'summarize' ? 'summary' : action]: transcript.aiContents[0].content,
        cached: true
      });
    }

    // Prepare transcript text for AI processing
    const formattedTranscript = transcript.transcript as any;
    const transcriptText = formattedTranscript
      .map((segment: any) => `[${segment.timestamp}] ${segment.text}`)
      .join('\n');

    // Generate content based on action
    let content = '';
    const contentTypeForDB = actionToContentType[action];
    
    switch (action) {
      case 'summarize':
        content = await generateSummary(transcriptText, transcript.title || undefined);
        break;
      
      case 'chapters':
        content = await generateChapters(
          transcriptText, 
          transcript.duration ? transcript.duration : undefined, 
          transcript.title || undefined
        );
        break;
      
      case 'key_points':
        content = await generateKeyPoints(transcriptText, transcript.title || undefined);
        break;
        
      case 'questions':
        content = await generateQuestions(transcriptText, transcript.title || undefined);
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    // Store AI content in database using upsert
    await prismadb.youTubeTranscriptAIContent.upsert({
      where: {
        transcriptId_type: {
          transcriptId: transcript.id,
          type: contentTypeForDB as any
        }
      },
      update: { 
        content 
      },
      create: {
        transcriptId: transcript.id,
        type: contentTypeForDB as any,
        content
      }
    });

    // Return the generated content
    return NextResponse.json({ 
      [action === 'summarize' ? 'summary' : action]: content,
      cached: false
    });

  } catch (error) {
    console.error('AI processing error:', error);
    return NextResponse.json(
      { error: "Failed to process transcript" },
      { status: 500 }
    );
  }
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${hours}h ${minutes}m ${remainingSeconds}s`;
}

async function generateSummary(text: string, title?: string): Promise<string> {
  const systemPrompt = title 
    ? `Create a concise but comprehensive summary of this YouTube video "${title}", focusing on the main points and key takeaways. The summary should be 3-5 paragraphs.`
    : `Create a concise but comprehensive summary of this YouTube video transcript, focusing on the main points and key takeaways. The summary should be 3-5 paragraphs.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: text
      }
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  return completion.choices[0].message.content || '';
}

async function generateChapters(text: string, duration?: number, title?: string): Promise<string> {
  let systemPrompt = "Create 5-10 chapters from this YouTube video transcript. Extract the most relevant timestamps and create meaningful chapter titles. Format: 00:00:00 Chapter Title";
  
  if (title) {
    systemPrompt = `Create 5-10 chapters for the YouTube video "${title}". Extract the most relevant timestamps and create meaningful chapter titles. Format: 00:00:00 Chapter Title`;
  }
  
  if (duration) {
    systemPrompt += `\nThe video is ${formatDuration(duration)} long. Make sure the timestamps reflect important points throughout the entire video.`;
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: text
      }
    ],
    max_tokens: 500,
    temperature: 0.3,
  });

  return completion.choices[0].message.content || '';
}

async function generateKeyPoints(text: string, title?: string): Promise<string> {
  const systemPrompt = title
    ? `Extract 5-10 key points from this YouTube video "${title}" with their timestamps. Format each point as '00:00:00 - Key point description'`
    : `Extract 5-10 key points from this YouTube video transcript with their timestamps. Format each point as '00:00:00 - Key point description'`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: text
      }
    ],
    max_tokens: 800,
    temperature: 0.5,
  });

  return completion.choices[0].message.content || '';
}

async function generateQuestions(text: string, title?: string): Promise<string> {
  const systemPrompt = title
    ? `Generate 5 practice questions based on this YouTube video "${title}". Include both questions and answers with relevant timestamps. Format: 'Q1 (00:00:00): Question\nA: Answer'`
    : `Generate 5 practice questions based on this YouTube video transcript. Include both questions and answers with relevant timestamps. Format: 'Q1 (00:00:00): Question\nA: Answer'`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: text
      }
    ],
    max_tokens: 1000,
    temperature: 0.6,
  });

  return completion.choices[0].message.content || '';
}