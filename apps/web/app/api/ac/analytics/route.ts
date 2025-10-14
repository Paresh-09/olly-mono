import { NextResponse } from "next/server";
import { ActionType, CommentPlatform, CommentStatus } from "@repo/db";
import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function GET() {
  try {
    // Validate user
    const { user } = await validateRequest();
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Get configs
    const linkedinConfig = await prismadb.autoCommenterConfig.findFirst({
      where: {
        userId: user.id,
        platform: CommentPlatform.LINKEDIN,
      },
    });
    
    const redditConfig = await prismadb.autoCommenterConfig.findFirst({
      where: {
        userId: user.id,
        platform: CommentPlatform.REDDIT,
      },
    });
    
    // Get comment history
    const commentHistory = await prismadb.autoCommenterHistory.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });
    
    // Calculate daily stats
    const dailyMap = new Map<string, number>();
    commentHistory.forEach(comment => {
      const date = comment.createdAt.toISOString().split('T')[0];
      dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
    });
    
    // Get the last 7 days, filling in zeros for days with no activity
    const today = new Date();
    const dailyStats = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      dailyStats.push({
        date: dateString,
        count: dailyMap.get(dateString) || 0,
      });
    }
    
    // Construct analytics object
    const analytics = {
      configurations: {
        linkedin: !!linkedinConfig,
        reddit: !!redditConfig,
      },
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
      dailyStats,
      actionBreakdown: [
        { action: 'Comment', count: commentHistory.filter(c => c.action === ActionType.COMMENT).length },
        { action: 'Like', count: commentHistory.filter(c => c.action === ActionType.LIKE).length },
        { action: 'Share', count: commentHistory.filter(c => c.action === ActionType.SHARE).length },
      ],
      platformBreakdown: [
        { platform: 'LinkedIn', count: commentHistory.filter(c => c.platform === CommentPlatform.LINKEDIN).length },
        { platform: 'Reddit', count: commentHistory.filter(c => c.platform === CommentPlatform.REDDIT).length },
      ],
      statusBreakdown: [
        { status: 'Posted', count: commentHistory.filter(c => c.status === CommentStatus.POSTED).length },
        { status: 'Failed', count: commentHistory.filter(c => c.status === CommentStatus.FAILED).length },
        { status: 'Pending', count: commentHistory.filter(c => c.status === CommentStatus.PENDING).length },
        { status: 'Skipped', count: commentHistory.filter(c => c.status === CommentStatus.SKIPPED).length },
      ],
      topHashtags: [], // Would require additional logic to extract hashtags from comment content
      recentActivity: commentHistory.slice(0, 10).map(comment => ({
        id: comment.id,
        platform: comment.platform,
        action: comment.action,
        status: comment.status,
        postUrl: comment.postUrl || '#',
        postedAt: comment.createdAt,
        authorName: comment.authorName || undefined,
      })),
    };
    
    return NextResponse.json({ 
      success: true, 
      analytics,
      commentHistory
    });
    
  } catch (error) {
    console.error("API Error (analytics):", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 