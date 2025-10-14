import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client
const openAI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { videoTitle, videoDescription, category, includeTrending, competitionLevel } = await request.json();
    
    if (!videoTitle) {
      return NextResponse.json(
        { error: 'Video title is required' },
        { status: 400 }
      );
    }

    // Build the system prompt
    let systemPrompt = `You are a YouTube SEO expert specialized in creating optimized tags for videos. 
Your job is to generate a list of relevant, high-performing tags that will help YouTube videos rank better in search results.
Follow these guidelines:
- Create tags that are a mix of specific and broad keywords
- Include a variety of tag lengths (1-5 words each)
- Avoid duplicate or very similar tags
- Generate between 15-20 tags for each video
- Make sure total character count of all tags combined stays under 500 characters
- Consider search volume, competition, and relevance when creating tags
- Include variation of keywords (singular/plural, synonyms, related terms)
- Focus on terms people actually search for on YouTube
`;

    // Adjust based on competition level
    if (competitionLevel === 'low') {
      systemPrompt += `
Since the user selected "Low Competition", focus more on long-tail, specific keywords with lower search volume but higher chance of ranking. Include niche variations and more specific descriptors.`;
    } else if (competitionLevel === 'high') {
      systemPrompt += `
Since the user selected "High Competition", include more variation of the main competitive keywords and phrases. Balance between high-traffic terms and more specific variations that might be easier to rank for.`;
    } else {
      // Medium competition (default)
      systemPrompt += `
Create a balanced mix of both broader keywords with decent search volume and more specific long-tail variations.`;
    }

    // Build the user prompt
    let userPrompt = `Generate a list of SEO-optimized YouTube tags for a video with the following details:

Title: ${videoTitle}`;

    if (videoDescription) {
      userPrompt += `
Description: ${videoDescription}`;
    }

    if (category && category !== 'general') {
      userPrompt += `
Category: ${category}`;
    }

    if (includeTrending) {
      userPrompt += `
Please include some relevant trending/popular tags that might help with discovery.`;
    }

    userPrompt += `

Return just a simple array of tag strings in JSON format, like this example:
{
  "tags": ["tag1", "tag2", "longer tag phrase", "etc"]
}

Make sure the combined character count of all tags doesn't exceed 500 characters (including commas when joined).`;

    // Call OpenAI API
    const completion = await openAI.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });
      
    // Get the tags from OpenAI
    const responseContent = completion.choices[0].message.content || '';
    let generatedTags;
    
    try {
      const parsedResponse = JSON.parse(responseContent);
      generatedTags = parsedResponse.tags || [];
      
      // Fallback if response doesn't match expected format
      if (!Array.isArray(generatedTags) || generatedTags.length === 0) {
        // Try to extract tags from a different format if possible
        if (typeof parsedResponse === 'object' && parsedResponse !== null) {
          // Look for any array property
          const possibleArrays = Object.values(parsedResponse).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            // Use the first array found
            generatedTags = possibleArrays[0];
          }
        }
        
        // If we still don't have valid tags, throw error
        if (!Array.isArray(generatedTags) || generatedTags.length === 0) {
          throw new Error('Invalid response format');
        }
      }
      
      // Ensure we don't exceed YouTube's limit (approximately 500 chars)
      let totalLength = 0;
      const finalTags = [];
      
      for (const tag of generatedTags) {
        // Account for the tag plus a comma and space for joining
        const tagLength = tag.length + 2;
        if (totalLength + tagLength <= 500) {
          finalTags.push(tag);
          totalLength += tagLength;
        } else {
          break;
        }
      }
      
      generatedTags = finalTags;
      
    } catch (error) {
      console.error('Error parsing JSON response:', error, responseContent);
      return NextResponse.json(
        { error: 'Failed to parse tags from the AI response' },
        { status: 500 }
      );
    }
      
    return NextResponse.json({
      success: true,
      tags: generatedTags
    });
  } catch (error) {
    console.error('Error generating YouTube tags:', error);
    return NextResponse.json(
      { error: 'Failed to generate YouTube tags' },
      { status: 500 }
    );
  }
}