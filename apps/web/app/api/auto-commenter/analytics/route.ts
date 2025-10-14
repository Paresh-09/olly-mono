
import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { CommentPlatform, CommentStatus, ActionType } from "@repo/db";

export async function GET() {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user's LinkedIn config if it exists
    const linkedinConfig = await prismadb.autoCommenterConfig.findFirst({
      where: {
        userId: user.id,
        platform: CommentPlatform.LINKEDIN,
      },
    });

    // Get user's Reddit config if it exists
    const redditConfig = await prismadb.autoCommenterConfig.findFirst({
      where: {
        userId: user.id,
        platform: CommentPlatform.REDDIT,
      },
    });

    // Get the comment history for this user
    const commentHistory = await prismadb.autoCommenterHistory.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50,
    });

    // Calculate analytics
    const analytics = {
      totalComments: commentHistory.length,
      pendingComments: commentHistory.filter(c => c.status === CommentStatus.PENDING).length,
      postedComments: commentHistory.filter(c => c.status === CommentStatus.POSTED).length,
      failedComments: commentHistory.filter(c => c.status === CommentStatus.FAILED).length,
      skippedComments: commentHistory.filter(c => c.status === CommentStatus.SKIPPED).length,
      linkedinComments: commentHistory.filter(c => c.platform === CommentPlatform.LINKEDIN).length,
      redditComments: commentHistory.filter(c => c.platform === CommentPlatform.REDDIT).length,
      commentSuccess: commentHistory.length > 0 
        ? Math.round((commentHistory.filter(c => c.status === CommentStatus.POSTED).length / commentHistory.length) * 100) 
        : 0,
      lastActivity: commentHistory.length > 0 ? commentHistory[0].createdAt : undefined,
      dailyStats: [] as Array<{date: string; count: number}>,
      actionBreakdown: [] as Array<{action: string; count: number}>,
      platformBreakdown: [
        { platform: 'LinkedIn', count: commentHistory.filter(c => c.platform === CommentPlatform.LINKEDIN).length },
        { platform: 'Reddit', count: commentHistory.filter(c => c.platform === CommentPlatform.REDDIT).length }
      ],
      statusBreakdown: [
        { status: 'Posted', count: commentHistory.filter(c => c.status === CommentStatus.POSTED).length },
        { status: 'Failed', count: commentHistory.filter(c => c.status === CommentStatus.FAILED).length },
        { status: 'Pending', count: commentHistory.filter(c => c.status === CommentStatus.PENDING).length },
        { status: 'Skipped', count: commentHistory.filter(c => c.status === CommentStatus.SKIPPED).length }
      ],
      topHashtags: [] as Array<{hashtag: string; count: number}>,
      recentActivity: commentHistory.slice(0, 10).map(comment => ({
        id: comment.id,
        platform: comment.platform,
        action: comment.action,
        status: comment.status,
        postUrl: comment.postUrl || '#',
        postedAt: comment.createdAt,
        authorName: comment.authorName || undefined
      })),
      configurations: {
        linkedin: !!linkedinConfig,
        reddit: !!redditConfig
      }
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('[AUTO_COMMENTER_ANALYTICS]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 