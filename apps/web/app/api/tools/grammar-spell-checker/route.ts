// app/api/grammar-check/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { 
  GrammarCheckRequest, 
  GrammarCheckResponse,
  GrammarCheckResult,
  CheckMode,
  isValidGrammarCheckResponse
} from '@/types/tools/grammar-spell';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Validate input request
function validateRequest(request: GrammarCheckRequest): string | null {
  if (!request.text || request.text.trim() === '') {
    return 'Text content is required for grammar and spell checking';
  }
  
  const validModes: CheckMode[] = ['comprehensive', 'light', 'academic', 'professional'];
  if (request.mode && !validModes.includes(request.mode)) {
    return 'Invalid check mode selected';
  }

  return null;
}

export async function POST(request: Request) {
  try {
    // Parse the incoming request
    const requestData: GrammarCheckRequest = await request.json();

    // Validate the request
    const validationError = validateRequest(requestData);
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    const { 
      text, 
      language = 'en', 
      mode = 'comprehensive' 
    } = requestData;

    // Construct the prompt for OpenAI
    const prompt = `
Perform a comprehensive grammar, spelling, and style check on the following text:

Original Text:
"""
${text}
"""

Mode of Analysis: ${mode}
Language: ${language}

REQUIREMENTS:
1. Identify and correct grammar, spelling, and style errors
2. Preserve the original meaning and tone
3. Provide specific, constructive suggestions
4. Format response as strict JSON

Return JSON with these fields:
{
  "originalText": "Original input text",
  "correctedText": "Fully corrected text",
  "errors": [
    {
      "type": "grammar|spelling|style|punctuation",
      "original": "Original problematic word/phrase",
      "suggestion": "Corrected word/phrase",
      "explanation": "Brief, specific error explanation",
      "severity": "low|medium|high"
    }
  ],
  "readabilityScore": 0-100 numeric score
}

IMPORTANT NOTES:
- Be precise and educational in corrections
- Do not change the text's core meaning
- Provide actionable, clear feedback
`;

    // Call OpenAI API

    console.log("Calling OpenAI API with para");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a precise linguistic analyzer providing structured JSON output for grammar and spell checking."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
      response_format: { type: "json_object" }
    });
    
    // Parse the OpenAI response
    const rawResult = JSON.parse(completion.choices[0].message.content || '{}');
    
    // Validate the response structure
    const grammarCheckResult: GrammarCheckResult = {
      originalText: rawResult.originalText || text,
      correctedText: rawResult.correctedText || text,
      errors: Array.isArray(rawResult.errors) ? rawResult.errors : [],
      readabilityScore: typeof rawResult.readabilityScore === 'number' 
        ? rawResult.readabilityScore 
        : undefined
    };

    const response: GrammarCheckResponse = { 
      result: grammarCheckResult 
    };

    // Final validation of the response
    if (!isValidGrammarCheckResponse(response)) {
      throw new Error('Invalid grammar check response format');
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error performing grammar and spell check:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to perform grammar and spell check',
        result: null 
      },
      { status: 500 }
    );
  }
}

// Optional: GET route for API documentation
export async function GET() {
  return NextResponse.json({
    service: 'Grammar and Spell Checker',
    version: '1.0.0',
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it'],
    modes: ['comprehensive', 'light', 'academic', 'professional'],
    instructions: 'Send a POST request with text to check grammar and spelling'
  });
}