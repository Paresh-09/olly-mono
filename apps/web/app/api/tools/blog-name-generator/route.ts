import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { topic, keywords, niche, nameStyle } = await request.json();

    if (!topic && !keywords && !niche) {
      return NextResponse.json(
        { error: 'Please provide at least one of: topic, keywords, or niche' },
        { status: 400 }
      );
    }

    // Build the prompt with all parameters
    let systemPrompt = `You are an expert blog name generator that creates catchy, memorable, and appropriate blog names. You create names that are relevant to the specified topic, industry, or keywords.`;

    // Add specific instructions based on the selected name style
    switch (nameStyle) {
      case 'descriptive':
        systemPrompt += ` You specialize in creating clear, descriptive names that directly communicate what the blog is about. These names are straightforward and make the blog's focus immediately clear to visitors.`;
        break;
      case 'creative':
        systemPrompt += ` You specialize in creating unique, creative names with wordplay, metaphors, and unexpected combinations. These names prioritize being memorable and distinctive, even if they are less obvious about the blog's topic.`;
        break;
      case 'seo-focused':
        systemPrompt += ` You specialize in creating SEO-optimized names that incorporate important keywords and are designed to perform well in search engines. These names are clear, directly related to search terms, and help the blog rank better.`;
        break;
      case 'brandable':
        systemPrompt += ` You specialize in creating short, catchy, memorable names that work well as a brand. These names are often unique, sometimes abstract, and are designed to be distinct and recognizable.`;
        break;
      case 'balanced':
      default:
        systemPrompt += ` You create a balanced mix of names that combine creativity with descriptiveness, while also considering SEO factors.`;
        break;
    }

    // Build the user prompt
    let userPrompt = `Generate 5 unique blog name ideas`;

    if (topic) userPrompt += ` for a blog about ${topic}`;
    if (niche) userPrompt += ` in the ${niche} niche`;
    if (keywords) userPrompt += ` incorporating these keywords: ${keywords}`;

    userPrompt += `. For each name, provide a brief explanation of why it works well.`;

    // Explicitly instruct JSON format, even with the response_format setting
    userPrompt += ` Return your response as a JSON array where each item has these properties: "name" (the blog name), "explanation" (why it works well), and "style" (the style category it best fits: "descriptive", "creative", "seo-focused", "brandable", or "balanced"). Ensure the entire response is a valid JSON object containing an array of names under the key "names".`;


    // Call OpenAI API
    const completion = await openai.chat.completions.create({
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
      temperature: 0.8,
      max_tokens: 1000
    });

    // Get the names content from OpenAI
    const responseContent = completion.choices[0].message.content || '';
    let generatedNames: any[] = []; // Use any[] initially for flexible parsing

    try {
      const parsedResponse = JSON.parse(responseContent);

      // Attempt to extract the names array, checking various potential structures
      if (Array.isArray(parsedResponse)) {
        // Case 1: The AI directly returned an array of names
        generatedNames = parsedResponse;
      } else if (parsedResponse && Array.isArray(parsedResponse.names)) {
        // Case 2: The AI returned an object with a "names" key containing an array
        generatedNames = parsedResponse.names;
      } else if (parsedResponse && Array.isArray(parsedResponse.blogNames)) {
        // Case 3: Based on your error output, the AI might return "blogNames"
        generatedNames = parsedResponse.blogNames;
      } else {
        // If none of the expected structures are found, log and throw
        console.error('Unexpected JSON structure from OpenAI:', responseContent);
        throw new Error('Unexpected response format from AI');
      }

      // Further validate that the items in the array have the expected properties
      const isValidFormat = generatedNames.every(item =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.name === 'string' &&
        typeof item.explanation === 'string' &&
        typeof item.style === 'string'
      );

      if (!isValidFormat) {
        console.error('Invalid item format within the names array:', generatedNames);
        throw new Error('Invalid item format in AI response');
      }

    } catch (error) {
      console.error('Error parsing or validating JSON response from OpenAI:', error, responseContent);
      // Return a more informative error to the client
      return NextResponse.json(
        { error: `Failed to process AI response: ${error instanceof Error ? error.message : 'Unknown format error'}` },
        { status: 500 }
      );
    }

    // If parsing and validation succeed, return the names
    return NextResponse.json({
      success: true,
      names: generatedNames
    });
  } catch (error) {
    console.error('Error in blog name generation API:', error);
    // Return a general error for unexpected issues
    return NextResponse.json(
      { error: 'Failed to generate blog names due to a server error.' },
      { status: 500 }
    );
  }
}
