import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import OpenAI from "openai";
import prismadb from "@/lib/prismadb";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to generate context-specific prompts
function getContextSpecificPrompt(taskType: string, context: string, description: string, platform: string) {
  const prompts: Record<string, string> = {
    POST_SCHEDULE: `You are tasked with ${description} based on the following:
Context: ${context}
`,

    COMMENT_SCHEDULE: `You are tasked with ${description} based on the following:
Context: ${context}
`,

    REMINDER: `You are tasked with ${description} based on the following:
Context: ${context}
`,

    CUSTOM: `You are tasked with ${description} based on the following:
Context: ${context}
`,
  };

  return prompts[taskType] || prompts.CUSTOM;
}

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized"
      }, { status: 401 });
    }

    const body = await req.json();
    const {
      description,
      context,
      platform,
      taskType,
    } = body;

    // Get context-specific prompt
    const prompt = getContextSpecificPrompt(taskType, context, description, platform);

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Please do as the user asks. They will share context and a description, follow the description, try to be concise and follow user instructions if instructed otherwise."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const enhancedDescription = completion.choices[0].message.content;

    // Structure the task output
    const taskOutput = {
      description: enhancedDescription,
      context: {
        originalContext: context,
        originalDescription: description,
        platform,
        taskType,
        generatedAt: new Date().toISOString(),
      },
      metadata: {
        aiGenerated: true,
        promptVersion: "1.0",
        platform: platform,
      }
    };

    return NextResponse.json({
      success: true,
      data: taskOutput
    });

  } catch (error) {
    console.error("[TASKS_AI_POST]", error);
    return NextResponse.json({
      success: false,
      error: "Internal error"
    }, { status: 500 });
  }
} 