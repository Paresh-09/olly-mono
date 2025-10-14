import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

// Temporary map for backward compatibility with the cron job
// This will be removed once the cron job is updated
const dmAutomationConfigs = new Map<string, any>();

export async function GET() {
  try {
    // Validate user session
    const { user } = await validateRequest();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's DM automation configuration from the database
    const config = await prismadb.instagramDMAutomation.findFirst({
      where: {
        userId: user.id,
      },
    });

    // If found in database, return it
    if (config) {
      // Get processed comments for this configuration
      const processedComments = await prismadb.instagramCommentHistory.findMany(
        {
          where: {
            userId: user.id,
            postId: config.postId,
          },
          select: {
            commentId: true,
          },
        },
      );

      const processedCommentIds = processedComments.map(
        (comment) => comment.commentId,
      );

      // Update in-memory storage with the latest data
      const inMemoryConfig = {
        userId: config.userId,
        postId: config.postId,
        isEnabled: config.isEnabled,
        dmRules: config.dmRules,
        processedComments: processedCommentIds,
        updatedAt: config.updatedAt,
      };
      dmAutomationConfigs.set(user.id, inMemoryConfig);

      return NextResponse.json({
        config: {
          userId: config.userId,
          postId: config.postId,
          isEnabled: config.isEnabled,
          dmRules: config.dmRules,
          updatedAt: config.updatedAt,
        },
      });
    }

    // Fallback to in-memory storage for backward compatibility
    const inMemoryConfig = dmAutomationConfigs.get(user.id);
    return NextResponse.json({ config: inMemoryConfig || null });
  } catch (error) {
    console.error("Error fetching DM automation config:", error);
    return NextResponse.json(
      { error: "Failed to fetch configuration" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    // Validate user session
    const { user } = await validateRequest();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { isEnabled, postId, dmRules } = body;

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 },
      );
    }

    if (!Array.isArray(dmRules) || dmRules.length === 0) {
      return NextResponse.json(
        { error: "At least one DM rule is required" },
        { status: 400 },
      );
    }

    // Validate that the user has a valid Instagram token
    const oauthToken = await prismadb.oAuthToken.findFirst({
      where: {
        userId: user.id,
        platform: "INSTAGRAM",
        isValid: true,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!oauthToken) {
      return NextResponse.json(
        { error: "No valid Instagram token found" },
        { status: 400 },
      );
    }

    // Check if a configuration already exists
    const existingConfig = await prismadb.instagramDMAutomation.findFirst({
      where: {
        userId: user.id,
        postId: postId,
      },
    });

    let config;

    if (existingConfig) {
      // Update existing configuration
      config = await prismadb.instagramDMAutomation.update({
        where: {
          id: existingConfig.id,
        },
        data: {
          isEnabled: !!isEnabled,
          dmRules: dmRules,
        },
      });
    } else {
      // Create new configuration
      config = await prismadb.instagramDMAutomation.create({
        data: {
          userId: user.id,
          postId,
          isEnabled: !!isEnabled,
          dmRules: dmRules,
        },
      });
    }

    // Get processed comments for this configuration
    const processedComments = await prismadb.instagramCommentHistory.findMany({
      where: {
        userId: user.id,
        postId: postId,
      },
      select: {
        commentId: true,
      },
    });

    const processedCommentIds = processedComments.map(
      (comment) => comment.commentId,
    );

    // Also update in-memory storage for backward compatibility with the cron job
    const inMemoryConfig = {
      userId: user.id,
      postId,
      isEnabled: !!isEnabled,
      dmRules,
      processedComments: processedCommentIds,
      updatedAt: new Date(),
    };
    dmAutomationConfigs.set(user.id, inMemoryConfig);

    return NextResponse.json({
      success: true,
      config: {
        userId: config.userId,
        postId: config.postId,
        isEnabled: config.isEnabled,
        dmRules: config.dmRules,
        updatedAt: config.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error saving DM automation config:", error);
    return NextResponse.json(
      { error: "Failed to save configuration" },
      { status: 500 },
    );
  }
}

