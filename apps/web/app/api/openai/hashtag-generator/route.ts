import { NextResponse } from "next/server";
import OpenAI from "openai";
import { kv } from '@vercel/kv';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const MAX_GENERATIONS_PER_DAY = 5;

export async function POST(request: Request) {
    const { topic, platform, numHashtags, popularity, userId } = await request.json();

    // Check user's generation count
    const today = new Date().toISOString().split('T')[0];
    const userKey = `user:${userId}:${today}`;
    let generationCount = await kv.get(userKey) as number | null;

    if (generationCount === null) {
        generationCount = 0;
    }

    if (generationCount >= MAX_GENERATIONS_PER_DAY) {
        return new NextResponse(JSON.stringify({ error: "Daily generation limit reached" }), { status: 429 });
    }

    try {
        const prompt = `Generate ${numHashtags} ${popularity} hashtags for ${platform} based on the following topic:

${topic}

Ensure the hashtags are relevant, trendy, and appropriate for ${platform}.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            max_tokens: 100,
        });

        const hashtags = completion.choices[0].message.content?.split(' ').filter(word => word.startsWith('#')) || [];

        // Increment user's generation count
        await kv.incr(userKey);
        // Set expiration for the key (24 hours)
        await kv.expire(userKey, 86400);

        return new NextResponse(JSON.stringify({ hashtags }), { status: 200 });
    } catch (error: any) {
        console.error(`Error generating hashtags: ${error.message}`);
        return new NextResponse(JSON.stringify({ error: "Error generating hashtags" }), { status: 500 });
    }
}