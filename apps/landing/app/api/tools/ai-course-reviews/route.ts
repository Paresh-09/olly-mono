// File: app/api/tools/ai-course-reviews/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface CourseReviewRequest {
  courseName: string;
  courseSubject?: string;
  instructorName?: string;
  courseLevel?: string;
  additionalInfo?: string;
  reviewTone: 'conversational' | 'professional' | 'personal' | 'critical' | 'enthusiastic';
  reviewLength: 'short' | 'medium' | 'long';
  rating: number;
  includePros?: boolean;
  includeCons?: boolean;
  includeComparison?: boolean;
  personalExperience?: string;
}

export async function POST(request: Request) {
  try {
    
    const {
      courseName,
      courseSubject,
      instructorName,
      courseLevel,
      additionalInfo,
      reviewTone = 'conversational',
      reviewLength = 'medium',
      rating,
      includePros = true,
      includeCons = true,
      includeComparison = false,
      personalExperience
    } = await request.json() as CourseReviewRequest;

    
    if (!courseName || courseName.trim() === '') {
      return NextResponse.json(
        { error: 'Course name is required. Come on, what course are we talking about?' },
        { status: 400 }
      );
    }


    const wordCountMap = {
      'short': { min: 250, max: 450 },
      'medium': { min: 500, max: 750 },
      'long': { min: 800, max: 1200 }
    };
    const { min: minWords, max: maxWords } = wordCountMap[reviewLength];

    // Craft a more dynamic and conversational prompt
    const prompt = `
Write a ${reviewTone} course review for "${courseName}" that feels genuine and helpful.

Context:
${courseSubject ? `• Course Subject: ${courseSubject}` : ''}
${instructorName ? `• Instructor: ${instructorName}` : ''}
${courseLevel ? `• Course Level: ${courseLevel}` : ''}
• Overall Rating: ${rating}/5 stars
${additionalInfo ? `• Additional Details: ${additionalInfo}` : ''}
${personalExperience ? `• Personal Context: ${personalExperience}` : ''}

Review Guidelines:
1. Aim for ${minWords}-${maxWords} words
2. Sound like a real person sharing their honest experience
3. Balance between informative and engaging

Review Structure:
- Start with a hook that captures the course's essence
- Share your genuine first impressions
${includePros ? '- Highlight what genuinely impressed you' : ''}
${includeCons ? '- Be constructive about areas that could improve' : ''}
${includeComparison ? '- How does this compare to similar courses you know?' : ''}
- Close with a clear recommendation for potential students

Tone Guidance:
${reviewTone === 'conversational' ? '- Write like you\'re chatting with a friend over coffee' : ''}
${reviewTone === 'personal' ? '- Share personal anecdotes and real learning moments' : ''}
${reviewTone === 'professional' ? '- Maintain a credible, expert-level analysis' : ''}
${reviewTone === 'critical' ? '- Provide a balanced, no-nonsense evaluation' : ''}
${reviewTone === 'enthusiastic' ? '- Let your excitement and passion shine through' : ''}

Key Focus: Make this review sound human, not like an AI-generated text. 
Avoid marketing speak. Be real, be honest.
`;

   
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a knowledgeable, authentic course reviewer who provides honest, nuanced insights. Your reviews feel personal, like advice from a trusted friend who genuinely wants to help others make informed learning decisions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8, 
      max_tokens: 2500, 
      top_p: 0.9, 
      frequency_penalty: 0.5, 
      presence_penalty: 0.5
    });
    
   
    const reviewContent = completion.choices[0].message.content?.trim() || '';
    
    return NextResponse.json({ 
      success: true,
      review: reviewContent,
      metadata: {
        wordCount: reviewContent.split(/\s+/).length,
        tone: reviewTone,
        rating: rating
      }
    });
  } catch (error) {
    console.error('Oops! Something went wrong generating the course review:', error);
    return NextResponse.json(
      { 
        error: 'Looks like our review generator hit a small bump. Mind trying again?',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}