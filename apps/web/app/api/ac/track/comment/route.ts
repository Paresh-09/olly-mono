import { NextResponse } from "next/server";
import { CommentPlatform, CommentStatus, ActionType } from "@repo/db";
import prismadb from "@/lib/prismadb";

const EXTENSION_IDS = [
  "pkomeokalhjlopcgnoefibpdhphfcgam",
  "ekmgobjflopmpkfeookodjcfjmaiilcp",
];

// Helper function to handle CORS
function corsResponse(req: Request, response: NextResponse) {
  const origin = req.headers.get("origin");
  if (origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Extension-ID",
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");
  return response;
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(req: Request) {
  return corsResponse(req, new NextResponse(null, { status: 204 }));
}

export async function POST(req: Request) {
  try {
    // Validate extension ID if needed
    const extensionId = req.headers.get("X-Extension-ID") || "";
    if (EXTENSION_IDS.length > 0 && !EXTENSION_IDS.includes(extensionId)) {
      return corsResponse(
        req,
        new NextResponse("Invalid extension ID", { status: 403 }),
      );
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
      action,
      timestamp,
      licenseKey, // New field for license key
    } = body;

    if (!url || !postId || !action || !licenseKey) {
      return corsResponse(
        req,
        new NextResponse("Missing required fields", { status: 400 }),
      );
    }

    // Get user from license key
    const license = await prismadb.licenseKey.findUnique({
      where: {
        key: licenseKey,
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!license) {
      return corsResponse(
        req,
        new NextResponse("Invalid license key", { status: 401 }),
      );
    }

    if (!license.isActive) {
      return corsResponse(
        req,
        new NextResponse("License key is not active", { status: 403 }),
      );
    }

    // Get the first user associated with this license key
    if (license.users.length === 0) {
      return corsResponse(
        req,
        new NextResponse("No users associated with this license key", {
          status: 404,
        }),
      );
    }

    const userId = license.users[0].userId;

    // Get the auto commenter config for LinkedIn
    const config = await prismadb.autoCommenterConfig.findFirst({
      where: {
        userId: userId,
        platform: CommentPlatform.LINKEDIN,
      },
    });

    if (!config) {
      // If no config exists, create a basic one
      const newConfig = await prismadb.autoCommenterConfig.create({
        data: {
          userId: userId,
          licenseKeyId: license.id,
          platform: CommentPlatform.LINKEDIN,
          isEnabled: true,
          action: [ActionType.COMMENT],
        },
      });

      // Use the newly created config
      const commentHistory = await prismadb.autoCommenterHistory.create({
        data: {
          userId: userId,
          configId: newConfig.id,
          postId,
          platform: CommentPlatform.LINKEDIN,
          postUrl: url,
          postContent: postTextPreview,
          commentContent: `💬 ${action}`,
          authorName,
          status: success ? CommentStatus.POSTED : CommentStatus.FAILED,
          postedAt: timestamp ? new Date(timestamp) : new Date(),
          errorMessage: error || null,
          action: ActionType.COMMENT,
        },
      });

      return corsResponse(req, NextResponse.json(commentHistory));
    }

    // Create comment history record with existing config
    const commentHistory = await prismadb.autoCommenterHistory.create({
      data: {
        userId: userId,
        configId: config.id,
        postId,
        platform: CommentPlatform.LINKEDIN,
        postUrl: url,
        postContent: postTextPreview,
        commentContent: `💬 ${action}`,
        authorName,
        status: success ? CommentStatus.POSTED : CommentStatus.FAILED,
        postedAt: timestamp ? new Date(timestamp) : new Date(),
        errorMessage: error || null,
        action: ActionType.COMMENT,
      },
    });

    // Update last comment time in config
    await prismadb.autoCommenterConfig.update({
      where: {
        id: config.id,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return corsResponse(req, NextResponse.json(commentHistory));
  } catch (error) {
    console.error("[AUTO_COMMENTER_TRACK_COMMENT]", error);
    return corsResponse(
      req,
      new NextResponse("Internal Error", { status: 500 }),
    );
  }
}
// import { NextResponse } from "next/server";
// import { CommentPlatform, CommentStatus, ActionType } from "@repo/db";
// import { validateRequest } from "@/lib/auth";
// import prismadb from "@/lib/prismadb";

// const EXTENSION_IDS = ['pkomeokalhjlopcgnoefibpdhphfcgam', 'ekmgobjflopmpkfeookodjcfjmaiilcp'];

// // Helper function to handle CORS
// function corsResponse(req: Request, response: NextResponse) {
//   const origin = req.headers.get('origin');
//   if (origin) {
//     response.headers.set('Access-Control-Allow-Origin', origin);
//   }

//   response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Extension-ID');
//   response.headers.set('Access-Control-Allow-Credentials', 'true');
//   return response;
// }

// // Handle OPTIONS requests for CORS preflight
// export async function OPTIONS(req: Request) {
//   return corsResponse(req, new NextResponse(null, { status: 204 }));
// }

// export async function POST(req: Request) {
//   try {
//     // Validate extension ID
//     // const extensionId = req.headers.get('X-Extension-ID') || '';
//     // if (!EXTENSION_IDS.includes(extensionId)) {
//     //   return corsResponse(req, new NextResponse("Invalid extension ID", { status: 403 }));
//     // }

//     const { user } = await validateRequest();
//     if (!user) {
//       return corsResponse(req, new NextResponse("Unauthorized", { status: 401 }));
//     }

//     const body = await req.json();
//     const {
//       url,
//       postId,
//       authorName,
//       postTextPreview,
//       success,
//       error,
//       attempts,
//       reason,
//       processedPosts,
//       seenPosts,
//       action,
//       timestamp
//     } = body;

//     if (!url || !postId || !action) {
//       return corsResponse(req, new NextResponse("Missing required fields", { status: 400 }));
//     }

//     // Get the auto commenter config for LinkedIn
//     const config = await prismadb.autoCommenterConfig.findFirst({
//       where: {
//         userId: user.id,
//         platform: CommentPlatform.LINKEDIN,
//       },
//     });

//     if (!config) {
//       return corsResponse(req, new NextResponse("Configuration not found", { status: 404 }));
//     }

//     // Create comment history record
//     const commentHistory = await prismadb.autoCommenterHistory.create({
//       data: {
//         userId: user.id,
//         configId: config.id,
//         postId,
//         platform: CommentPlatform.LINKEDIN,
//         postUrl: url,
//         postContent: postTextPreview,
//         commentContent: `💬 ${action}`,
//         authorName,
//         status: success ? CommentStatus.POSTED : CommentStatus.FAILED,
//         postedAt: timestamp ? new Date(timestamp) : new Date(),
//         action: ActionType.COMMENT,
//       },
//     });

//     // Update last comment time in config
//     await prismadb.autoCommenterConfig.update({
//       where: {
//         id: config.id,
//       },
//       data: {
//         updatedAt: new Date(),
//       },
//     });

//     return corsResponse(req, NextResponse.json(commentHistory));
//   } catch (error) {
//     console.error("[AUTO_COMMENTER_TRACK_COMMENT]", error);
//     return corsResponse(req, new NextResponse("Internal Error", { status: 500 }));
//   }
// }

