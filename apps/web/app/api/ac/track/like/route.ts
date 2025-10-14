import { NextResponse } from "next/server";
import { CommentPlatform, CommentStatus, ActionType } from "@repo/db";
import prismadb from "@/lib/prismadb";
import { validateRequest } from "@/lib/auth";

const EXTENSION_IDS = ['pkomeokalhjlopcgnoefibpdhphfcgam', 'ekmgobjflopmpkfeookodjcfjmaiilcp'];

// Helper function to handle CORS
function corsResponse(req: Request, response: NextResponse) {
  const origin = req.headers.get('origin');
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Extension-ID');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(req: Request) {
  return corsResponse(req, new NextResponse(null, { status: 204 }));
}

export async function POST(req: Request) {
  try {
    // Validate extension ID
    const extensionId = req.headers.get('X-Extension-ID') || '';
    if (!EXTENSION_IDS.includes(extensionId)) {
      return corsResponse(req, new NextResponse("Invalid extension ID", { status: 403 }));
    }

    const { user } = await validateRequest();
    if (!user) {
      return corsResponse(req, new NextResponse("Unauthorized", { status: 401 }));
    }

    const body = await req.json();
    const { 
      url,
      postId,
      authorName,
      postTextPreview,
      success,
      error,
      attempts,
      reason,
      processedPosts,
      seenPosts,
      processedLikes,
      timestamp
    } = body;

    if (!url || !postId) {
      return corsResponse(req, new NextResponse("Missing required fields", { status: 400 }));
    }

    // Get the auto commenter config for LinkedIn (since this is a like action)
    const config = await prismadb.autoCommenterConfig.findFirst({
      where: {
        userId: user.id,
        platform: CommentPlatform.LINKEDIN,
      },
    });

    if (!config) {
      return corsResponse(req, new NextResponse("Configuration not found", { status: 404 }));
    }

    // Create like history record
    const likeHistory = await prismadb.autoCommenterHistory.create({
      data: {
        userId: user.id,
        configId: config.id,
        postId,
        platform: CommentPlatform.LINKEDIN,
        postUrl: url,
        postContent: postTextPreview,
        commentContent: "👍 Liked post",
        authorName,
        status: success ? CommentStatus.POSTED : CommentStatus.FAILED,
        postedAt: timestamp ? new Date(timestamp) : new Date(),
        action: ActionType.LIKE,
      },
    });

    // Update last activity time in config
    await prismadb.autoCommenterConfig.update({
      where: {
        id: config.id,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return corsResponse(req, NextResponse.json(likeHistory));
  } catch (error) {
    console.error("[AUTO_COMMENTER_TRACK_LIKE]", error);
    return corsResponse(req, new NextResponse("Internal Error", { status: 500 }));
  }
} 