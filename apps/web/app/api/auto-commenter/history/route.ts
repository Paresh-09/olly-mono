import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { validateRequest } from "@/lib/auth";
import { ActionType } from "@repo/db";

export async function GET(request: NextRequest) {
  try {
    const session = await validateRequest();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type") || "comments"; // comments or likes
    const skip = (page - 1) * limit;

    // Base query conditions
    const baseWhere = {
      userId: session.user.id,
    };

    // Filter by type - simplified for count query
    let typeWhere;
    let countWhere;
    
    if (type === "comments") {
      typeWhere = {
        ...baseWhere,
        action: ActionType.COMMENT,
        NOT: {
          commentContent: {
            contains: "like_clicked"
          }
        }
      };
      // For count, use simpler query
      countWhere = {
        ...baseWhere,
        action: ActionType.COMMENT,
        NOT: {
          commentContent: {
            contains: "like_clicked"
          }
        }
      };
    } else {
      typeWhere = {
        ...baseWhere,
        OR: [
          { action: ActionType.LIKE },
          { action: ActionType.UPVOTE },
          { commentContent: { contains: "like_clicked" } }
        ]
      };
      countWhere = typeWhere;
    }

    // Get total count
    const totalCount = await prismadb.autoCommenterHistory.count({
      where: countWhere,
    });

    // Get paginated data
    const comments = await prismadb.autoCommenterHistory.findMany({
      where: typeWhere,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
      select: {
        id: true,
        postId: true,
        postUrl: true,
        platform: true,
        authorName: true,
        commentContent: true,
        status: true,
        createdAt: true,
        action: true,
      },
    });

    // Construct postUrl from postId for LinkedIn, X/Twitter, and Instagram
    const commentsWithUrl = comments.map(comment => ({
      ...comment,
      postUrl: (() => {
        if (comment.platform === 'LINKEDIN' && comment.postId) {
          return `https://www.linkedin.com/feed/update/${comment.postId}`;
        } else if (comment.platform === 'TWITTER' && comment.postId) {
          return `https://x.com/i/web/status/${comment.postId}`;
        } else if (comment.platform === 'INSTAGRAM' && comment.postId) {
          // Extract Instagram post ID from URL if postId contains full URL
          const postId = comment.postId.includes('instagram.com/p/') 
            ? comment.postId.split('instagram.com/p/')[1].replace(/\/$/, '')
            : comment.postId;
          return `https://www.instagram.com/p/${postId}`;
        }
        return comment.postUrl || '';
      })()
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      data: commentsWithUrl,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching comment history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}