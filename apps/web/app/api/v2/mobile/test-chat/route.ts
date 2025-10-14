import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import prismadb from "@/lib/prismadb";
import { sendDiscordNotification } from "@/service/discord-notify";
import { lucia } from "@/lib/auth";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ActionType = "comment" | "translate" | "reply" | "summarize" | "question";

const ACTION_PROMPTS: Record<ActionType, string> = {
  comment: `You are a smart social media commenter and influencer. You sound human like by avoiding repetitions, jargons, boring texts and so on. Please generate a comment for the text shared by the user. Needs to sound as human-like as possible. Comment should be short, maximum of 200 characters.`,
  translate: `You are a professional translator. Please translate the following text to English if it's in another language. Keep the translation natural and contextually accurate. If the text is already in the target language, improve its clarity and fluency.`,
  reply: `You are expert at crafting thoughtful responses. Generate a polite and engaging reply to the given message. The reply should be contextual, empathetic, and maintain a friendly tone. Keep it concise, maximum 200 characters.`,
  summarize: `You are a summarization expert. Create a clear, concise summary of the given text, capturing the main points while maintaining context. The summary should be easily digestible and no more than 200 characters.`,
  question: `You are a curious and insightful questioner. Generate a thought-provoking, relevant question based on the given text. The question should encourage meaningful discussion or reflection. Keep it clear and concise.`,
};

interface ChatFormData {
  message: string;
  platform?: string;
  action?: ActionType;
  userId: string;
  image?: File; // Now it's a File object
}

function isValidAuthToken(token: string): boolean {
  return token === process.env.MOBILE_AUTH_TOKEN;
}

function isValidAction(action: string): action is ActionType {
  return action in ACTION_PROMPTS;
}

// Helper function to convert File to base64 data URL
async function fileToBase64DataUrl(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString("base64");
  return `data:${file.type};base64,${base64}`;
}

// Helper function to validate image file
function isValidImageFile(file: File): boolean {
  const validTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const maxSize = 10 * 1024 * 1024; // 10MB

  return validTypes.includes(file.type) && file.size <= maxSize;
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");

  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS,POST",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const userAgent = request.headers.get("User-Agent") || "Unknown";

  if (!authHeader) {
    return new NextResponse("No authorization header", { status: 401 });
  }

  // Extract the session token
  const sessionToken = authHeader.replace("Bearer ", "");

  // Validate session
  const { session, user } = await lucia.validateSession(sessionToken);

  if (!session) {
    return new NextResponse("Invalid session", { status: 401 });
  }

  if (request.method === "OPTIONS") {
    return OPTIONS(request);
  }

  try {
    // Parse multipart form data
    const formData = await request.formData();

    const message = formData.get("message") as string;
    const platform = formData.get("platform") as string | null;
    const action = (formData.get("action") as ActionType) || "comment";
    const imageFile = formData.get("image") as File | null;
    const userId = user.id;

    if (!message) {
      return new NextResponse("Message is required", { status: 400 });
    }

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    if (!isValidAction(action)) {
      return new NextResponse("Invalid action type", { status: 400 });
    }

    // Validate image file if present
    if (imageFile && imageFile.size > 0) {
      if (!isValidImageFile(imageFile)) {
        return new NextResponse(
          "Invalid image file. Please upload a valid image (JPEG, PNG, GIF, WebP) under 10MB.",
          { status: 400 },
        );
      }
    }

    // Check user's credit balance
    const userCredit = await prismadb.userCredit.findUnique({
      where: { userId },
    });

    if (!userCredit || userCredit.balance < 1) {
      return new NextResponse("Insufficient credits", { status: 402 });
    }

    const systemPrompt = ACTION_PROMPTS[action];
  

    // Prepare messages array based on whether image is present
    let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: systemPrompt,
      },
    ];

    if (imageFile && imageFile.size > 0) {
      // Convert File to base64 data URL for OpenAI API
      const imageDataUrl = await fileToBase64DataUrl(imageFile);

      messages.push({
        role: "user",
        content: [
          { type: "text", text: message },
          { type: "image_url", image_url: { url: imageDataUrl } },
        ],
      });
    } else {
      messages.push({
        role: "user",
        content: message,
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = completion.choices[0].message.content;

    // Use a transaction to ensure atomic operations
    await prismadb.$transaction(async (tx) => {
      // Create the chat request record
      await tx.mobileChatRequest.create({
        data: {
          content: message,
          response: aiResponse || "",
          platform: platform || null,
          deviceInfo: userAgent,
          authToken: sessionToken,
          action: action,
        },
      });

      // Track usage in UsageTracking table
      await tx.usageTracking.create({
        data: {
          userId: user.id,
          action: action,
          event: "mobile",
          platform: platform || "",
        },
      });

      // Update user's credit balance
      const updatedCredit = await tx.userCredit.update({
        where: { userId: user.id },
        data: {
          balance: { decrement: 1 },
          updatedAt: new Date(),
        },
      });

      // Create credit transaction record
      await tx.creditTransaction.create({
        data: {
          userCreditId: userCredit.id,
          amount: -1,
          type: "SPENT",
          description: `Credit spent on ${action} action`,
        },
      });
    });


    return new NextResponse(
      JSON.stringify({
        success: true,
        data: {
          response: aiResponse,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,OPTIONS,POST",
          "Access-Control-Allow-Headers": "*",
        },
      },
    );
  } catch (error: any) {
    console.error(`Error processing chat request: ${error.message}`);

    return new NextResponse(
      JSON.stringify({
        success: false,
        error: error.message || "An unexpected error occurred",
      }),
      {
        status: error.status || 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,OPTIONS,POST",
          "Access-Control-Allow-Headers": "*",
        },
      },
    );
  }
}
