// File: app/api/tools/ai-course-promotion/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const {
      courseName,
      courseSubject,
      targetAudience,
      uniqueSellingPoints,
      promotionType,
      tone,
      promotionLength,
      includeCallToAction,
      includeEmojis,
      includePricing
    } = await request.json();

    if (!courseName || courseName.trim() === '') {
      return NextResponse.json(
        { error: 'Course name is required' },
        { status: 400 }
      );
    }

    // Determine word count based on promotion length
    let wordCountRange = '300-500';
    if (promotionLength === 'short') {
      wordCountRange = '100-200';
    } else if (promotionLength === 'long') {
      wordCountRange = '600-800';
    }

    // Create a detailed prompt for the promotion
    const prompt = `Generate a ${tone} promotional ${promotionType} for "${courseName}"
${courseSubject ? `Course Subject: ${courseSubject}` : ''}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}
${uniqueSellingPoints ? `Unique Selling Points: ${uniqueSellingPoints}` : ''}

Promotion Guidelines:
- Length: ${wordCountRange} words
- Type of Content: ${promotionType}
${includeCallToAction ? '- Must include a compelling call to action' : ''}
${includeEmojis ? '- Use appropriate emojis to enhance engagement' : ''}
${includePricing ? '- Mention or hint at pricing information' : ''}

Tone Guidance:
${tone === 'enthusiastic' ? '- Use energetic and passionate language' : ''}
${tone === 'professional' ? '- Maintain a formal, authoritative tone' : ''}
${tone === 'conversational' ? '- Write as if speaking directly to the target audience' : ''}
${tone === 'inspiring' ? '- Focus on transformative potential and personal growth' : ''}
${tone === 'urgent' ? '- Create a sense of FOMO (Fear of Missing Out)' : ''}

Key Objectives:
1. Clearly communicate the value of the course
2. Address the target audience's pain points or aspirations
3. Highlight what makes this course unique
4. Create excitement and motivation to enroll

Please format the content appropriately for the chosen promotion type, ensuring it feels natural and engaging.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert marketing copywriter specializing in creating compelling promotional content for online courses. Your writing is engaging, persuasive, and tailored to the specific audience and promotion type."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });
    
    // Get the promotion content from OpenAI
    const promotionContent = completion.choices[0].message.content || '';
    
    return NextResponse.json({ 
      success: true,
      promotion: promotionContent
    });
  } catch (error) {
    console.error('Error generating course promotion:', error);
    return NextResponse.json(
      { error: 'Failed to generate course promotion' },
      { status: 500 }
    );
  }
}