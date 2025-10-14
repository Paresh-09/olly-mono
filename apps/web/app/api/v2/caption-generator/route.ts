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
    const writingTone = formData.get('writingTone') as string;
    const length = formData.get('length') as string;
    const addHashtags = formData.get('addHashtags') === 'true';
    const addEmoji = formData.get('addEmoji') === 'true';
    const userId = formData.get('userId') as string;
    const image = formData.get('image') as File | null;

    try {
        // Check and deduct credits
        const { transaction, newBalance } = await createCreditTransaction({
            userId,
            amount: CREDITS_PER_GENERATION,
            type: TransactionType.SPENT,
            description: 'Generated caption'
        });

        if (newBalance < 0) {
            return new NextResponse(JSON.stringify({ error: "Insufficient credits" }), { status: 402 });
        }

        let imageDescription = "";
        if (image) {
            // Process the image with OpenAI's vision API
            const base64Image = Buffer.from(await image.arrayBuffer()).toString('base64');
            const visionResponse = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Describe this image concisely." },
                            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
                        ],
                    },
                ],
            });
            imageDescription = visionResponse.choices[0].message.content || "";
        }

        const prompt = `Generate a ${length} caption in ${writingTone} tone for ${platform} based on the following description:

${description}

${imageDescription ? `Image description: ${imageDescription}` : ''}

${addHashtags ? 'Include relevant hashtags.' : ''}
${addEmoji ? 'Include appropriate emojis.' : ''}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            max_tokens: 150,
        });

        const caption = completion.choices[0].message.content;

        return new NextResponse(JSON.stringify({ caption, creditsRemaining: newBalance }), { status: 200 });
    } catch (error: any) {
        console.error(`Error generating caption: ${error.message}`);
        return new NextResponse(JSON.stringify({ error: "Error generating caption" }), { status: 500 });
    }
}