import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { validateRequest } from "@/lib/auth";

export const POST = async (req: NextRequest) => {
  const { code } = await req.json();
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    // Use upsert instead of create to handle the unique constraint
    const createUserMilestone = await prisma.userJourneyMilestone.upsert({
      where: {
        userId_milestone: {
          userId: user.id,
          milestone: "EXTENSION_INSTALLED",
        },
      },
      update: {
        // Optionally update the achievedAt timestamp if you want to track the most recent installation
        achievedAt: new Date(),
      },
      create: {
        userId: user.id,
        milestone: "EXTENSION_INSTALLED",
      },
    });

    // Send a notification to the user
    const notificationMessage = `
      Your Olly extension is now configured with your account settings.
      You can close this tab and return to the Olly extension.
    `;

    return NextResponse.json({
      success: true,
      userId: user.id
    });
  } catch (error) {
    console.error("Error in extension callback:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    const errorResponse = {
      success: false,
      message: "Error processing extension callback",
      error: errorMessage,
      details:
        error instanceof Error
          ? {
              name: error.name,
              stack:
                process.env.NODE_ENV === "development"
                  ? error.stack
                  : undefined,
            }
          : undefined,
    };
    return NextResponse.json(errorResponse, {
      status: 500,
    });
  }
};
