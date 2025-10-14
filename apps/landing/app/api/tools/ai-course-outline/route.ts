// File: app/api/tools/ai-course-outline/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { topic, audience, courseType, duration, additionalInfo } = await request.json();

    if (!topic || topic.trim() === '') {
      return NextResponse.json(
        { error: 'Course topic is required' },
        { status: 400 }
      );
    }

    // Create a detailed prompt for the course outline with explicit Markdown instructions
    const prompt = `
Generate a comprehensive course outline for a course on "${topic}" using Markdown formatting.
${audience ? `Target audience: ${audience}` : ''}
${courseType ? `Course type: ${courseType}` : ''}
${duration ? `Duration: ${duration} weeks` : ''}
${additionalInfo ? `Additional requirements: ${additionalInfo}` : ''}

The course outline should include:
1. Course title (as a level 1 heading with #)
2. Duration information
3. Target audience information
4. Course description
5. Learning objectives (4-5 key objectives)
6. Weekly schedule breakdown with:
   - Weekly topics/module titles (as level 2 headings with ##)
   - 2-3 lecture topics per week (bulleted lists with -)
   - 2-3 practical activities per week (bulleted lists with -)
   - Recommended resources (bulleted lists with -)
   - Assessment methods (bulleted lists with -)
7. Overall grading structure
8. Prerequisites based on the target audience

Please use proper Markdown formatting:
- Use # for main section headings
- Use ## for sub-headings
- Use bullet points (- or *) for lists
- Use **bold** for emphasis where appropriate

Format the outline clearly with proper Markdown syntax.
`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert curriculum designer specialized in creating well-structured, comprehensive course outlines using Markdown formatting. Your outlines include clear learning objectives, weekly breakdowns, and assessment methods."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });
    
    // Get the outline content from OpenAI
    const outlineContent = completion.choices[0].message.content || '';
    
    return NextResponse.json({ 
      success: true,
      outline: outlineContent
    });
  } catch (error) {
    console.error('Error generating course outline:', error);
    return NextResponse.json(
      { error: 'Failed to generate course outline' },
      { status: 500 }
    );
  }
}