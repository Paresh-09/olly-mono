import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const {
      phrase,
      acronymType,
      acronymStyle,
      includeTagline,
      preferredLetters,
      targetAudience,
      additionalContext,
    } = await request.json();

    if (!phrase) {
      return NextResponse.json(
        { error: "Phrase is required" },
        { status: 400 }
      );
    }

    // Parse preferred letters if provided
    let preferredLettersList: string[] = [];
    if (preferredLetters && preferredLetters.trim()) {
      preferredLettersList = preferredLetters
        .split(",")
        .map((letter: string) => letter.trim())
        .filter((letter: string) => letter.length > 0);
    }

    // Build the system prompt
    let systemPrompt = `You are an expert at creating creative, memorable, and meaningful acronyms.
Given a phrase, you will generate multiple high-quality acronym suggestions that:
- Are memorable and easy to pronounce
- Have meaningful word expansions that relate to the original phrase
- Are appropriate for the specified context and audience
- Follow the specified style (${acronymType})
`;

    // Adjust based on acronym type
    if (acronymType === "professional") {
      systemPrompt += `
For 'professional' acronyms, create sophisticated, business-appropriate acronyms with clear, straightforward word expansions that convey professionalism and expertise.`;
    } else if (acronymType === "creative") {
      systemPrompt += `
For 'creative' acronyms, prioritize uniqueness and memorability with clever, engaging word expansions that spark interest.`;
    } else if (acronymType === "simple") {
      systemPrompt += `
For 'simple' acronyms, focus on clarity and ease of understanding with straightforward, accessible word expansions.`;
    } else if (acronymType === "technical") {
      systemPrompt += `
For 'technical' acronyms, use industry-specific terminology and precise word expansions that demonstrate expertise in the field.`;
    } else if (acronymType === "fun") {
      systemPrompt += `
For 'fun' acronyms, create playful, lighthearted acronyms with amusing or entertaining word expansions.`;
    }

    // Build the user prompt
    let userPrompt = `Create 5 unique and creative acronym suggestions for the phrase: "${phrase}"`;

    if (preferredLettersList.length > 0) {
      userPrompt += `\nIf possible, try to incorporate these preferred letters: ${preferredLettersList.join(
        ", "
      )}`;
    }

    if (targetAudience) {
      userPrompt += `\nThe target audience is: ${targetAudience}`;
    }

    if (additionalContext) {
      userPrompt += `\nAdditional context: ${additionalContext}`;
    }

    if (includeTagline) {
      userPrompt += `\nPlease include a short, catchy tagline for each acronym that could be used alongside it in branding.`;
    }

    userPrompt += `
Each acronym should:
1. Form a pronounceable word or recognizable abbreviation
2. Have a well-thought-out word expansion, where each letter stands for a word
3. Relate meaningfully to the original phrase
4. Be appropriate for a ${acronymType} context

Return your response as a JSON array with exactly 5 items, where each item has:
- "acronym": The acronym itself
- "meaning": The full word expansion showing what each letter stands for
- "tagline": (optional) A catchy tagline for branding purposes (only if requested)

Example format:
{
  "acronyms": [
    {
      "acronym": "STAR",
      "meaning": "Strategic Training And Resources",
      "tagline": "Shine brighter with knowledge"
    },
    // more acronyms...
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
      max_tokens: 1000,
    });

    // Get the acronyms from OpenAI
    const responseContent = completion.choices[0].message.content || "";
    let generatedAcronyms;

    try {
      const parsedResponse = JSON.parse(responseContent);
      generatedAcronyms = parsedResponse.acronyms || [];

      // Fallback if response doesn't match expected format
      if (!Array.isArray(generatedAcronyms) || generatedAcronyms.length === 0) {
        // Try to extract acronyms from a different format if possible
        if (typeof parsedResponse === "object" && parsedResponse !== null) {
          // Look for any array property
          const possibleArrays = Object.values(parsedResponse).filter((val) =>
            Array.isArray(val)
          );
          if (possibleArrays.length > 0) {
            // Use the first array found
            generatedAcronyms = possibleArrays[0];
          }
        }

        // If we still don't have valid acronyms, throw error
        if (
          !Array.isArray(generatedAcronyms) ||
          generatedAcronyms.length === 0
        ) {
          throw new Error("Invalid response format");
        }
      }
    } catch (error) {
      console.error("Error parsing JSON response:", error, responseContent);
      return NextResponse.json(
        { error: "Failed to parse acronyms from the AI response" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      acronyms: generatedAcronyms,
    });
  } catch (error) {
    console.error("Error generating acronyms:", error);
    return NextResponse.json(
      { error: "Failed to generate acronyms" },
      { status: 500 }
    );
  }
}
