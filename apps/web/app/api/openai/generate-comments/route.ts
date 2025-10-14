import { NextResponse } from "next/server";
import OpenAI from "openai";
import { kv } from '@vercel/kv';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const MAX_GENERATIONS_PER_DAY = 5;

export async function POST(request: Request) {
    const { postContent, commentingStyle, writingStyle, commentLength, platform, userId } = await request.json();

    // Check user's generation count
    const today = new Date().toISOString().split('T')[0];
    const userKey = `user:${userId}:comment:${today}`;
    let generationCount = await kv.get(userKey) as number | null;

    if (generationCount === null) {
        generationCount = 0;
    }

    if (generationCount >= MAX_GENERATIONS_PER_DAY) {
        return new NextResponse(JSON.stringify({ error: "Daily comment generation limit reached" }), { status: 429 });
    }

    try {
        const prompt = `Generate a ${commentLength} comment on the below post in ${commentingStyle} style & ${writingStyle} tone for the following post content and platform: ${platform}:

${postContent}`;

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

        const comment = completion.choices[0].message.content;

        // Increment user's generation count
        await kv.incr(userKey);
        // Set expiration for the key (24 hours)
        await kv.expire(userKey, 86400);

        return new NextResponse(JSON.stringify({ comment }), { status: 200 });
    } catch (error: any) {
        console.error(`Error generating comment: ${error.message}`);
        return new NextResponse(JSON.stringify({ error: "Error generating comment" }), { status: 500 });
    }
}