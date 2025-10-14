import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { theme, topic, targetAudience, format, additionalInfo } =
      await request.json();

    if (!theme && !topic) {
      return NextResponse.json(
        { error: "Please provide at least a theme or topic for your podcast" },
        { status: 400 }
      );
    }

    // Build the system prompt with specific format guidance
    let systemPrompt = `You are an expert podcast name generator that creates catchy, memorable, and appropriate titles for podcasts. 
Your names should be:
- Memorable and easy to say out loud
- Reflective of the podcast's theme, topic, and target audience
- Unique enough to stand out in podcast directories
- Not too generic or already in use by major podcasts
- A good fit for the specified podcast format

For each name, provide a brief description explaining why it works well for the podcast and what makes it unique.`;

    // Build the user prompt with all the details
    let userPrompt = `Generate 10 unique and catchy podcast name ideas`;

    if (theme) userPrompt += ` for a podcast in the ${theme} niche`;
    if (topic) userPrompt += ` about ${topic}`;
    if (targetAudience) userPrompt += ` targeting ${targetAudience}`;
    if (format) userPrompt += `. The podcast format will be ${format} style`;
    if (additionalInfo) userPrompt += `. Additional details: ${additionalInfo}`;

    userPrompt += `.

The response should be a valid JSON object with a "names" array. Each item in the array should have:
- "name": The podcast name
- "description": A brief explanation of why this name works well
- "targetAudience" (optional): Who this name would particularly appeal to

For example:
{
  "names": [
    {
      "name": "Example Podcast Name",
      "description": "This name works well because...",
      "targetAudience": "People who enjoy..."
    },
    // more names...
  ]
}`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 1500,
    });

    // Get the names content from OpenAI
    const responseContent = completion.choices[0].message.content || "";
    let generatedNames;

    try {
      const parsedResponse = JSON.parse(responseContent);

      // Check for different possible response formats
      generatedNames =
        parsedResponse.names || parsedResponse.podcastNames || [];

      // Handle case where response might be the array directly
      if (!Array.isArray(generatedNames) && Array.isArray(parsedResponse)) {
        generatedNames = parsedResponse;
      }

      // Fallback if response doesn't match expected format
      if (!Array.isArray(generatedNames) || generatedNames.length === 0) {
        // If we can see the parsed response contains podcast names but in a different structure,
        // attempt to extract them
        if (typeof parsedResponse === "object" && parsedResponse !== null) {
          // Try to extract any array we find
          const possibleArrays = Object.values(parsedResponse).filter((val) =>
            Array.isArray(val)
          );
          if (possibleArrays.length > 0) {
            // Use the first array found
            generatedNames = possibleArrays[0];
          }
        }

        // If we still don't have valid names, throw error
        if (!Array.isArray(generatedNames) || generatedNames.length === 0) {
          console.error(
            "Failed to extract podcast names from response:",
            parsedResponse
          );
          throw new Error("Invalid response format");
        }
      }
    } catch (error) {
      console.error("Error parsing JSON response:", error, responseContent);
      return NextResponse.json(
        { error: "Failed to parse podcast names from the AI response" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      names: generatedNames,
    });
  } catch (error) {
    console.error("Error generating podcast names:", error);
    return NextResponse.json(
      { error: "Failed to generate podcast names" },
      { status: 500 }
    );
  }
}
