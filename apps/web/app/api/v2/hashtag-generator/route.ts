import { NextResponse } from "next/server";
import OpenAI from "openai";
import { TransactionType } from '@prisma/client';
import { createCreditTransaction } from "@/lib/credit-transaction";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const CREDITS_PER_GENERATION = 1;

export async function POST(request: Request) {
    const formData = await request.formData();
    const description = formData.get('description') as string;
    const platform = formData.get('platform') as string;
    const numberOfHashtags = parseInt(formData.get('numberOfHashtags') as string);
    const userId = formData.get('userId') as string;

    try {
        // Check and deduct credits
        const { transaction, newBalance } = await createCreditTransaction({
            userId,
            amount: CREDITS_PER_GENERATION,
            type: TransactionType.SPENT,
            description: 'Generated hashtags'
        });

        if (newBalance < 0) {
            return new NextResponse(JSON.stringify({ error: "Insufficient credits" }), { status: 402 });
        }

        const prompt = `Generate ${numberOfHashtags} relevant hashtags for ${platform} based on the following description:

${description}

Provide the hashtags as a comma-separated list.`;

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

        const hashtags = completion.choices[0].message.content?.split(',').map(tag => tag.trim()) || [];

        return new NextResponse(JSON.stringify({ hashtags, creditsRemaining: newBalance }), { status: 200 });
    } catch (error: any) {
        console.error(`Error generating hashtags: ${error.message}`);
        return new NextResponse(JSON.stringify({ error: "Error generating hashtags" }), { status: 500 });
    }
}