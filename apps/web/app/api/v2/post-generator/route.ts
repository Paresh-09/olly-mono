import { NextResponse } from "next/server";
import OpenAI from "openai";
import { TransactionType } from '@prisma/client';
import { createCreditTransaction } from "@/lib/credit-transaction";
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const CREDITS_PER_GENERATION = 2;

export async function POST(request: Request) {
    const formData = await request.formData();
    const topic = formData.get('topic') as string;
    const platform = formData.get('platform') as string;
    const writingTone = formData.get('writingTone') as string;
    const length = formData.get('length') as string;
    const includeHashtags = formData.get('includeHashtags') === 'true';
    const userId = formData.get('userId') as string;

    try {
        // Check and deduct credits
        const { transaction, newBalance } = await createCreditTransaction({
            userId,
            amount: CREDITS_PER_GENERATION,
            type: TransactionType.SPENT,
            description: 'Generated post'
        });

        if (newBalance < 0) {
            return new NextResponse(JSON.stringify({ error: "Insufficient credits" }), { status: 402 });
        }

        const prompt = `Generate a ${length} ${platform} post in a ${writingTone} tone about the following topic:

${topic}

${includeHashtags ? 'Include 3-5 relevant hashtags at the end of the post.' : ''}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            max_tokens: 250,
        });

        const post = completion.choices[0].message.content;

        return new NextResponse(JSON.stringify({ post, creditsRemaining: newBalance }), { status: 200 });
    } catch (error: any) {
        console.error(`Error generating post: ${error.message}`);
        return new NextResponse(JSON.stringify({ error: "Error generating post" }), { status: 500 });
    }
}