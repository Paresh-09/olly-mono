import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import OpenAI from 'openai';
import prismadb from '@/lib/prismadb';
import { TransactionType } from '@prisma/client';
import { createCreditTransaction } from '@/lib/credit-transaction';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function getDailyVlogPrompt(text: string): string {
  return `
    Daily Vlog Writing Guidelines:
    - Transform the following text input into a well-structured daily vlog entry
    - Maintain the personal tone and perspective of the original writer
    - Organize thoughts into coherent paragraphs
    - Correct any grammatical errors
    - Keep the content authentic to the writer's original message
    - Format with appropriate paragraph breaks for readability
    - Preserve key points, emotions, and personal reflections
    - Add a brief title that captures the essence of the entry
    - Keep it super-short like 100 words, unless the user has a lot to say, in which case go for 200 words.
  `;
}

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { transcription, enhanceWithAI = false } = await req.json();

    if (!transcription) {
      return NextResponse.json(
        { error: 'Text input is required' },
        { status: 400 }
      );
    }

    // If not enhancing with AI, just return the transcription as content
    if (!enhanceWithAI) {
      return NextResponse.json({
        transcription,
        content: transcription,
        enhanced: false
      });
    }

    // Check if user has enough credits
    const userCredit = await prismadb.userCredit.findUnique({
      where: { userId: user.id }
    });

    if (!userCredit || userCredit.balance < 0.5) {
      return NextResponse.json(
        { error: 'Insufficient credits. You need 0.5 credits to enhance with AI.' },
        { status: 402 }  // 402 Payment Required
      );
    }

    // Process with AI
    const vlogPrompt = getDailyVlogPrompt(transcription);

    const contentMessages = [
      {
        role: "system" as const,
        content: `You are an expert at transforming casual notes into well-structured, thoughtful daily journal entries. ${vlogPrompt}`
      },
      {
        role: "user" as const,
        content: `Please transform this text into a well-structured daily vlog entry:

${transcription}

Format it with a title at the top and organize the content into coherent paragraphs. Preserve my personal voice and the essence of what I'm saying, but make it read well as a written journal entry.`
      }
    ];

    const contentCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: contentMessages,
      temperature: 0.7,
      max_tokens: 1500,
    });

    const generatedContent = contentCompletion.choices[0]?.message?.content || '';

    // Deduct credits
    await createCreditTransaction({
      userId: user.id,
      amount: 0.5,
      type: TransactionType.SPENT,
      description: 'AI enhancement for daily vlog entry'
    });

    return NextResponse.json({
      transcription,
      content: generatedContent,
      enhanced: true,
      creditsUsed: 0.5
    });
  } catch (error) {
    console.error('Error processing daily vlog:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 