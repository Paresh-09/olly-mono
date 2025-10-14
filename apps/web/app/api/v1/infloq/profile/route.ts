import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 1000; // 1 second

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeOpenAIRequest(messages: ChatCompletionMessageParam[], attempt = 1): Promise<any> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      n: 1,
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    return completion.choices[0].message.content;
  } catch (error: any) {
    console.error(`OpenAI API attempt ${attempt} failed:`, error);

    if (attempt < MAX_RETRIES) {
      const backoff = INITIAL_BACKOFF * Math.pow(2, attempt - 1) * (0.5 + Math.random() * 0.5);
      console.log(`Retrying in ${backoff}ms...`);
      await sleep(backoff);
      return makeOpenAIRequest(messages, attempt + 1);
    }

    throw new Error(`Failed after ${MAX_RETRIES} attempts: ${error.message}`);
  }
}

interface ProfileAnalysis {
  personality_traits: string[];
  content_style: {
    tone: string;
    writing_quality: number;  // 1-10
    professionalism: number;  // 1-10
  };
  engagement_potential: {
    score: number;  // 1-10
    strengths: string[];
    weaknesses: string[];
  };
  target_audience: string[];
  recommendations: string[];
}

interface RequestBody {
  text: string;
  platform?: string;
}

function validateInput(body: any): RequestBody {
  if (!body || typeof body !== 'object') {
    throw new Error('Invalid request body');
  }

  // Check if text exists and is a string
  if (!body.text || typeof body.text !== 'string') {
    throw new Error('text must be a non-empty string');
  }

  // Trim and check if text is empty
  const trimmedText = body.text.trim();
  if (trimmedText === '') {
    throw new Error('text cannot be empty');
  }

  // Validate platform if provided
  if (body.platform !== undefined && typeof body.platform !== 'string') {
    throw new Error('platform must be a string');
  }

  return {
    text: trimmedText,
    platform: body.platform || 'general'
  };
}

async function parseAndValidateResponse(content: string): Promise<ProfileAnalysis> {
  if (!content) {
    throw new Error('Empty response from LLM');
  }

  try {
    const parsedResponse = JSON.parse(content);

    // Validate the response structure
    if (!Array.isArray(parsedResponse.personality_traits) ||
        !parsedResponse.content_style ||
        !parsedResponse.engagement_potential ||
        !Array.isArray(parsedResponse.target_audience) ||
        !Array.isArray(parsedResponse.recommendations)) {
      throw new Error('Invalid response structure');
    }

    // Validate score ranges
    if (parsedResponse.content_style.writing_quality < 1 || 
        parsedResponse.content_style.writing_quality > 10 ||
        parsedResponse.content_style.professionalism < 1 || 
        parsedResponse.content_style.professionalism > 10 ||
        parsedResponse.engagement_potential.score < 1 || 
        parsedResponse.engagement_potential.score > 10) {
      throw new Error('Scores must be between 1 and 10');
    }

    return parsedResponse;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`JSON parsing failed: ${error.message}\nContent: ${content}`);
    }
    throw error;
  }
}

export async function POST(request: NextRequest) {
  let startTime = Date.now();
  
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid JSON in request body' 
      }, { status: 400 });
    }

    // Validate input
    let validatedInput;
    try {
      validatedInput = validateInput(body);
    } catch (error: any) {
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 400 });
    }

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are a social media profile analyzer. Analyze the provided profile text and respond with a JSON object containing:

1. personality_traits: Array of key personality traits evident in the writing
2. content_style: Object containing:
   - tone: Overall tone of the writing
   - writing_quality: Score from 1-10
   - professionalism: Score from 1-10
3. engagement_potential: Object containing:
   - score: Overall engagement potential score (1-10)
   - strengths: Array of engagement strengths
   - weaknesses: Array of areas for improvement
4. target_audience: Array of likely target audience segments
5. recommendations: Array of actionable recommendations for improvement

Return only the raw JSON object matching this structure, without any additional text or formatting.`
      },
      {
        role: "user",
        content: validatedInput.text
      }
    ];

    // Make the request with retry logic
    const generatedContent = await makeOpenAIRequest(messages);
    

    // Parse and validate the response
    const parsedResponse = await parseAndValidateResponse(generatedContent);

    const processingTime = Date.now() - startTime;
    

    return NextResponse.json({
      success: true,
      data: parsedResponse,
      meta: {
        platform: validatedInput.platform,
        processing_time_ms: processingTime
      }
    });

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error(`Error processing request (${processingTime}ms):`, error);

    // Determine appropriate status code
    let statusCode = 500;
    if (error.message.includes('API key')) statusCode = 401;
    else if (error.message.includes('rate limit')) statusCode = 429;
    else if (error.message.includes('invalid input')) statusCode = 400;

    return NextResponse.json({
      success: false,
      error: error.message || "An unexpected error occurred",
      meta: {
        processing_time_ms: processingTime,
        retry_count: error.retryCount,
        error_type: error.name
      }
    }, { status: statusCode });
  }
}