// pages/api/openai/youtube.ts

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { validateRequest } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json(
        { error: 'You need to be logged in to perform this action.' },
        { status: 401 }
      );
    }

    if (user.thumbnailCredits <= 0) {
      return NextResponse.json(
        { error: "You don't have enough credits. Please purchase more credits to continue." },
        { status: 403 }
      );
    }

    const { title, description, style, mood, type } = await request.json();

    if (!type) {
      return NextResponse.json(
        { error: 'Missing required parameter: type' },
        { status: 400 }
      );
    }

    let result;
    switch (type) {
      case 'title':
        result = await generateText(
          `Generate an engaging YouTube video title based on this description: "${description}"`
        );
        break;
      case 'description':
        result = await generateText(
          `Generate an SEO-friendly YouTube video description based on this summary: "${description}"`
        );
        break;
      case 'tags':
        result = await generateText(
          `Generate relevant YouTube tags (comma-separated) based on this description: "${description}"`
        );
        break;
      case 'all':
        result = await generateText(
          `Generate a YouTube video title, description, and tags (comma-separated) based on this summary: "${description}"`
        );
        break;
      case 'thumbnail':
        if (!title || !description || !style || !mood) {
          return NextResponse.json(
            { error: 'Missing required parameters for thumbnail generation' },
            { status: 400 }
          );
        }
        const prompt = await generateThumbnailPrompt(title, description, style, mood);
        result = await generateImage(prompt);

        // Decrement user's thumbnailCredits after generating the thumbnail
        await prismadb.user.update({
          where: { id: user.id },
          data: { thumbnailCredits: { decrement: 1 } },
        });

        break;
      default:
        return NextResponse.json({ error: 'Invalid type specified' }, { status: 400 });
    }

    if (type === 'all') {
      const [titleResult, descriptionResult, tags] = (result as string).split('\n\n');
      return NextResponse.json({
        title: titleResult || '',
        description: descriptionResult || '',
        tags: (tags || '').split(', ').filter(Boolean),
      });
    } else if (type === 'tags') {
      return NextResponse.json({ tags: (result as string).split(', ').filter(Boolean) });
    } else if (type === 'thumbnail') {
      return NextResponse.json({ thumbnail: result });
    } else {
      return NextResponse.json({ [type]: result });
    }
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function generateText(prompt: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 150,
  });

  return completion.choices[0]?.message?.content || '';
}

async function generateThumbnailPrompt(
  title: string,
  description: string,
  style: string,
  mood: string
): Promise<string> {
  const prompt = `Create a detailed prompt for generating a YouTube thumbnail image based on the following information:
Title: ${title}
Description: ${description}
Style: ${style}
Mood: ${mood}

The prompt should describe a visually appealing and engaging thumbnail that accurately represents the video content and is likely to attract viewers. Include specific details about composition, colors, and any text or icons that should be included.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 200,
  });

  return completion.choices[0]?.message?.content || '';
}

async function generateImage(prompt: string): Promise<string> {
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: prompt,
    n: 1,
    size: '1792x1024',
  });

  if (!response?.data?.[0]?.url) {
    throw new Error('Failed to generate image: No URL returned from OpenAI');
  }

  return response.data[0].url;
}
