import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function POST(req: Request, props: { params: Promise<{ taskId: string }> }) {
  const params = await props.params;
  try {
    const { user } = await validateRequest();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { content } = await req.json();
    if (!content) {
      return new NextResponse("Content is required", { status: 400 });
    }

    const task = await prismadb.task.findUnique({
      where: { id: params.taskId },
      include: {
        socialPosts: {
          where: { platform: "LINKEDIN" }
        }
      }
    });

    if (!task) {
      return new NextResponse("Task not found", { status: 404 });
    }

    // Check if user has permission to modify this task
    if (task.organizationId && task.organizationId !== user.organizations[0]?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Also check if the user owns the task
    if (task.userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if a LinkedIn post already exists for this task
    const existingPost = task.socialPosts[0];
    
    // TODO: Implement actual LinkedIn API integration
    // For now, create or update the social post
    const socialPost = await prismadb.socialPost.upsert({
      where: {
        id: existingPost?.id || '',
      },
      create: {
        taskId: task.id,
        platform: "LINKEDIN",
        content: content,
        status: "POSTED", // In real implementation, this would be PENDING until confirmed
        postedAt: new Date(),
        metadata: {
          // Store any LinkedIn-specific metadata here
          lastAttempt: new Date().toISOString(),
        }
      },
      update: {
        content: content,
        status: "POSTED",
        postedAt: new Date(),
        metadata: {
          // Store any LinkedIn-specific metadata here
          lastAttempt: new Date().toISOString(),
        }
      }
    });

    // In a real implementation, you would:
    // 1. Get LinkedIn access token from user's organization settings
    // 2. Use LinkedIn API to create the post
    // 3. Update the socialPost with the actual post ID and URL
    
    return NextResponse.json({ 
      success: true, 
      data: socialPost,
      message: "Post scheduled for LinkedIn (dummy implementation)" 
    });
  } catch (error) {
    console.error("[TASK_POST_LINKEDIN]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 