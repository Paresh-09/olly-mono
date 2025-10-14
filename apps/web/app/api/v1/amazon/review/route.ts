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
      model: 'gpt-4o-mini',
      messages,
      n: 1,
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    return completion.choices[0].message.content;
  } catch (error: any) {
    console.error(`OpenAI API attempt ${attempt} failed:`, error);

    // Check if we should retry
    if (attempt < MAX_RETRIES) {
      // Calculate exponential backoff with jitter
      const backoff = INITIAL_BACKOFF * Math.pow(2, attempt - 1) * (0.5 + Math.random() * 0.5);
      console.log(`Retrying in ${backoff}ms...`);
      await sleep(backoff);
      return makeOpenAIRequest(messages, attempt + 1);
    }

    // If we're out of retries, throw the error
    throw new Error(`Failed after ${MAX_RETRIES} attempts: ${error.message}`);
  }
}

async function parseAndValidateResponse(content: string) {
  if (!content) {
    throw new Error('Empty response from LLM');
  }

  try {
    // Try to parse the JSON response
    const parsedResponse = JSON.parse(content);

    // Validate the response structure
    if (!Array.isArray(parsedResponse.keywords) || parsedResponse.keywords.length === 0) {
      throw new Error('Missing or invalid keywords array');
    }
    if (typeof parsedResponse.rating !== 'number' || parsedResponse.rating < 1 || parsedResponse.rating > 10) {
      throw new Error('Invalid rating value');
    }
    if (typeof parsedResponse.feedback !== 'string' || parsedResponse.feedback.trim().length === 0) {
      throw new Error('Missing or invalid feedback');
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
    const body = await request.json();
    const { text } = body;

    if (!text || text.trim() === '') {
      return NextResponse.json({ 
        success: false, 
        error: 'Text content is required' 
      }, { status: 400 });
    }

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are a text analysis expert. Analyze the provided text and respond with a JSON object (not a code block, just the raw JSON) containing:

1. An array of 5-10 most relevant keywords or key phrases
2. A numerical rating from 1-10 (1 being poor, 10 being excellent)
3. Brief, constructive feedback about the text

Your response should be a raw JSON object matching exactly this structure:
{"keywords":["keyword1","keyword2"],"rating":8,"feedback":"your feedback here"}

Do not include any markdown formatting, code blocks, or additional text. Return only the JSON object.`
      },
      {
        role: "user",
        content: text
      }
    ];

    // Make the request with retry logic
    const generatedContent = await makeOpenAIRequest(messages);


    // Parse and validate the response
    const parsedResponse = await parseAndValidateResponse(generatedContent);

    const processingTime = Date.now() - startTime;
    console.log(`Request processed in ${processingTime}ms`);

    return NextResponse.json({
      success: true,
      data: {
        keywords: parsedResponse.keywords,
        rating: parsedResponse.rating,
        feedback: parsedResponse.feedback
      },
      meta: {
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