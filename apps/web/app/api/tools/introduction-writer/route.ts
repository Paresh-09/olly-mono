import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { topic, keywords, tone, length, seoFocus, customInstructions } = await request.json();
    
    if (!topic || topic.trim() === '') {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Determine word count based on length
    let wordCount = 150; // Default to medium
    if (length === 'short') wordCount = 75;
    if (length === 'long') wordCount = 250;

    // Build the prompt with all parameters
    let prompt = `Write an engaging introduction for an article, blog post, or essay about "${topic}".`;
    
    // Add keywords if provided
    if (keywords && keywords.trim() !== '') {
      prompt += ` Incorporate the following keywords naturally: ${keywords}.`;
    }
    
    // Add tone instructions
    prompt += ` The tone should be ${tone}.`;
    
    // Add length specifications
    prompt += ` The introduction should be approximately ${wordCount} words.`;
    
    // Add SEO focus if enabled
    if (seoFocus) {
      prompt += ` Optimize the introduction for SEO, ensuring it's engaging for both readers and search engines. Include the main keyword early in the introduction and maintain good keyword density without keyword stuffing.`;
    }
    
    // Add any custom instructions
    if (customInstructions && customInstructions.trim() !== '') {
      prompt += ` Additional instructions: ${customInstructions}`;
    }
    
    // Final guidelines
    prompt += ` The introduction should grab the reader's attention, provide context, and clearly indicate what the content is about. It should be well-structured, cohesive, and entice the reader to continue reading. Do not use placeholders or generic statements - make it specific to the topic.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert content writer specialized in creating engaging, compelling introductions for articles, blog posts, and essays. You craft introductions that hook the reader's interest, establish the topic's relevance, and set the tone for the rest of the content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });
      
    // Get the introduction content from OpenAI
    const introductionContent = completion.choices[0].message.content || '';
      
    return NextResponse.json({
      success: true,
      introduction: introductionContent
    });
  } catch (error) {
    console.error('Error generating introduction:', error);
    return NextResponse.json(
      { error: 'Failed to generate introduction' },
      { status: 500 }
    );
  }
}