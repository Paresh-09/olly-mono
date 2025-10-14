// app/api/generate-free-daily/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import prisma from "@/lib/prismadb";
import { startOfDay, endOfDay } from "date-fns";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DAILY_FREE_LIMIT = 20;

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

async function checkDailyUsageAndCredits(userId: string | undefined | null): Promise<{
  canProceed: boolean;
  message?: string;
  shouldUseCredits: boolean;
}> {
  try {
    // If no userId, allow one free generation
    if (!userId) {
      return { canProceed: true, shouldUseCredits: false };
    }

    // Get today's usage count
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    const dailyUsageCount = await prisma.usageTracking.count({
      where: {
        userId: userId,
        action: "comment",
        createdAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    });

    // If within free daily limit
    if (dailyUsageCount < DAILY_FREE_LIMIT) {
      return { canProceed: true, shouldUseCredits: false };
    }

    // If exceeded free limit, check credits
    const userCredit = await prisma.userCredit.findUnique({
      where: { userId },
      select: { balance: true },
    });

    if (!userCredit || userCredit.balance <= 0) {
      return {
        canProceed: false,
        message: `You've reached your daily limit of ${DAILY_FREE_LIMIT} free comments. Please wait until tomorrow or purchase credits at olly.social/credits to continue.`,
        shouldUseCredits: false
      };
    }

    return {
      canProceed: true,
      shouldUseCredits: true
    };
  } catch (error) {
    console.error("Error checking daily usage:", error);
    throw error;
  }
}

async function trackUsageAndMilestones(
  userId: string | undefined | null,
  action: string,
  platform: string,
  useCredits: boolean,
  licenseKey: string | undefined | null
) {
  // Skip tracking for anonymous users
  if (!userId) {
    console.log('Skipping usage tracking for anonymous user');
    return;
  }

  console.log('Starting trackUsageAndMilestones with params:', {
    userId,
    action,
    platform,
    useCredits
  });

  try {
    // First verify if the user exists
    console.log('Checking if user exists');
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!userExists) {
      console.warn(`User not found when tracking usage`);
      return; // Exit early if user doesn't exist
    }
    console.log('User exists, proceeding with usage tracking');

    // Create usage tracking record
    console.log('Creating usage tracking record');


    const usageRecord = await prisma.usageTracking.create({
      data: {
        userId,
        action,
        platform,
        licenseKeyId: licenseKey || null,
      },
    });
    console.log('Created usage tracking record');

    // Get total comment count for milestone tracking
    console.log('Getting total comment count');
    const totalComments = await prisma.usageTracking.count({
      where: {
        userId,
        action: "comment",
      },
    });
    console.log('Total comments:', totalComments);

    // Track milestones based on total comments
    const milestoneChecks = [
      { count: 1, type: "FIRST_COMMENT" },
      { count: 5, type: "FIFTH_COMMENT" },
      { count: 10, type: "TENTH_COMMENT" },
    ];

    console.log('Checking milestones for total comments:', totalComments);
    for (const { count, type } of milestoneChecks) {
      if (totalComments === count) {
        console.log(`Milestone reached: ${type} at count ${count}`);
        await prisma.userJourneyMilestone.upsert({
          where: {
            userId_milestone: {
              userId,
              milestone: type as any,
            },
          },
          update: {},
          create: {
            userId,
            milestone: type as any,
            metadata: {
              platform,
              count,
            },
          },
        });
        console.log(`Milestone ${type} recorded successfully`);
      }
    }

    // If using credits, deduct one credit
    if (useCredits) {
      console.log('Deducting credit for user:', userId);
      const beforeCredit = await prisma.userCredit.findUnique({
        where: { userId },
        select: { balance: true }
      });
      console.log('Current credit balance:', beforeCredit?.balance);

      await prisma.userCredit.update({
        where: { userId },
        data: {
          balance: {
            decrement: 1
          }
        }
      });
      console.log('Credit deducted successfully');
    }

    console.log('trackUsageAndMilestones completed successfully');
  } catch (error) {
    // Type assertion for Prisma error
    const prismaError = error as {
      message: string;
      code?: string;
      meta?: Record<string, unknown>;
      stack?: string;
    };

    console.error('Error in trackUsageAndMilestones:', {
      error: prismaError,
      errorMessage: prismaError.message,
      errorCode: prismaError.code,
      errorMeta: prismaError.meta,
      stack: prismaError.stack
    });
    // Don't throw the error - we don't want to break the main flow
    // if usage tracking fails
  }
}

export async function POST(request: Request) {
  const extensionId = request.headers.get("X-Extension-ID");

  if (extensionId !== process.env.EXTENSION_ID) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  if (request.method === "OPTIONS") {
    return OPTIONS(request);
  }

  const formData = await request.formData();
  const prompt = formData.get("prompt")?.toString() || "";
  const user_id = formData.get("db_user_id")?.toString();
  const action_type = formData.get("action_type")?.toString() || "comment";
  const platform = formData.get("platform")?.toString() || "";
  const licenseKey = formData.get("licenseKey")?.toString();

  // Check if user is authenticated
  if (!user_id || user_id === 'undefined') {
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: "Please connect your Olly.social account to use the extension. Head into extension settings and connect your account.",
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }

  try {
    // Check if user can proceed with generation
    const { canProceed, message, shouldUseCredits } = await checkDailyUsageAndCredits(user_id);

    if (!canProceed) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: message,
        }),
        { status: 429 }
      );
    }

    // Generate the comment
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      n: 1,
      stop: null,
      temperature: 0.8,
    });

    const comment = completion.choices[0].message.content;

    // Track usage and update credits if needed
    await trackUsageAndMilestones(user_id, action_type, platform, shouldUseCredits, licenseKey);

    // Get updated credit balance only if we have a user
    let creditBalance = 0;
    if (user_id && user_id !== 'undefined') {
      const updatedCredit = await prisma.userCredit.findUnique({
        where: { userId: user_id },
        select: { balance: true },
      });
      creditBalance = updatedCredit?.balance ?? 0;
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: {
          generatedText: comment,
          creditBalance,
          usedCredits: shouldUseCredits,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error: any) {
    console.error(`Error generating comments: ${error.message}`);
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: "Failed to generate comments",
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

