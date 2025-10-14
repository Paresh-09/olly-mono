import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DISCORD_NOTIFICATION_ENABLED = process.env.ENABLE_DISCORD_NOTIFICATIONS === 'true';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(origin => origin.length > 0)
  .map(origin => origin.replace(/\/$/, '')); // Remove trailing slash

// Helper function to validate request origin with better debugging
function isValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')?.replace(/\/$/, ''); // Remove trailing slash from incoming origin
  
  // If no allowed origins are configured, deny all requests
  if (!ALLOWED_ORIGINS.length) {
    console.error('No allowed origins configured in environment');
    return false;
  }

  // If no origin is provided, deny the request
  if (!origin) {
    console.error('No origin provided in request');
    return false;
  }

  // Check if the request origin matches any allowed origin
  const isAllowed = ALLOWED_ORIGINS.includes(origin);
  
  if (!isAllowed) {
    console.error(`Invalid origin: ${origin}`);
    return false;
  }

  return true;
}

async function sendDiscordNotification(content: string) {
  if (!DISCORD_NOTIFICATION_ENABLED) return;
  
  const webhookUrl = process.env.CHAT_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('Discord webhook URL not configured');
    return;
  }

  try {
    await axios.post(webhookUrl, { content });
  } catch (error) {
    console.error('Error sending Discord notification:', error);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check origin before processing the request
    if (!isValidOrigin(req)) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const { message, threadId } = await req.json();
    const assistantId = process.env.CHAT_ASSISTANT_ID;

    if (!message) {
      return new NextResponse('Message is required', { status: 400 });
    }

    if (!assistantId) {
      return new NextResponse('Assistant ID is required', { status: 400 });
    }

    // Create a new thread if none exists
    let currentThreadId = threadId;
    if (!currentThreadId) {
      const thread = await openai.beta.threads.create();
      currentThreadId = thread.id;
    }

    // Add the user's message to the thread
    await openai.beta.threads.messages.create(currentThreadId, {
      role: "user",
      content: message,
    });

    // Create and start a run
    const run = await openai.beta.threads.runs.create(currentThreadId, {
      assistant_id: assistantId,
    });

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // To store the complete assistant response
    let completeResponse = '';

    // Process the run with polling
    (async () => {
      try {
        let lastMessageId: string | null = null;

        while (true) {
          const runStatus = await openai.beta.threads.runs.retrieve(
            currentThreadId,
            run.id
          );

          // Get new messages
          const messages = await openai.beta.threads.messages.list(currentThreadId);
          const latestMessage = messages.data[0];

          // Check if we have a new message
          if (latestMessage && latestMessage.id !== lastMessageId && latestMessage.content?.length > 0) {
            lastMessageId = latestMessage.id;
            const content = latestMessage.content[0];
            
            if (content && content.type === 'text' && content.text?.value) {
                let responseText = content.text.value;
                
                // Remove question repetition if it exists at the start
                if (responseText.startsWith(message + '?')) {
                  responseText = responseText.substring(message.length + 1).trim();
                }
                
                // Also check for repetition without question mark
                if (responseText.startsWith(message)) {
                  responseText = responseText.substring(message.length).trim();
                }
                
                completeResponse = responseText; // Store the complete response
                await writer.write(encoder.encode(responseText));
            }
          }

          if (runStatus.status === 'completed') {
            // Send the threadId as the last message
            await writer.write(encoder.encode(`\nthreadId: ${currentThreadId}`));
            await writer.close();

            // Send Discord notification with the complete response
            await sendDiscordNotification(`
New Chat Message:
User: ${message}
Response: ${completeResponse}
ThreadId: ${currentThreadId}
            `);
            break;
          } else if (runStatus.status === 'failed') {
            throw new Error('Assistant run failed');
          }

          // Poll every 500ms
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error('Streaming error:', error);
        await writer.abort(error);
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('Error processing chat:', error);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}