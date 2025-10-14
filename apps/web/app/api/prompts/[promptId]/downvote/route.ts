// app/api/prompts/[promptId]/downvote/route.ts
import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function POST(request: Request, props: { params: Promise<{ promptId: string }> }) {
  const params = await props.params;
  const { promptId } = params;
  const { user } = await validateRequest();

  const userId = user?.id;

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // First check if this is a premium prompt and if the user has unlocked it
    const prompt = await prismadb.prompt.findUnique({
      where: { id: promptId },
      include: {
        unlockedBy: {
          where: { userId }
        }
      }
    });

    if (!prompt) {
      return new NextResponse("Prompt not found", { status: 404 });
    }

    // If it's a premium prompt and user hasn't unlocked it, prevent downvoting
    if (prompt.isPremium && prompt.unlockedBy.length === 0) {
      return new NextResponse("Please unlock this premium prompt first", { status: 403 });
    }

    // Check for existing upvote
    const existingUpvote = await prismadb.userUpvote.findUnique({
      where: {
        userId_promptId: {
          userId,
          promptId
        }
      },
    });

    if (!existingUpvote) {
      return new NextResponse("No upvote to remove", { status: 400 });
    }

    // Remove upvote and decrement count in a transaction
    const [, updatedPrompt] = await prismadb.$transaction([
      // Delete the upvote record
      prismadb.userUpvote.delete({
        where: {
          userId_promptId: {
            userId,
            promptId
          }
        },
      }),
      // Decrement the upvotes counter
      prismadb.prompt.update({
        where: { id: promptId },
        data: { upvotes: { decrement: 1 } },
        include: {
          unlockedBy: {
            where: { userId }
          }
        }
      }),
    ]);

    // Transform the response
    const transformedPrompt = {
      ...updatedPrompt,
      isUnlocked: updatedPrompt.unlockedBy.length > 0,
      unlockedBy: undefined
    };

    return new NextResponse(JSON.stringify(transformedPrompt), { status: 200 });
  } catch (error) {
    console.error("Error removing upvote from prompt:", error);
    return new NextResponse("Error removing upvote from prompt", { status: 500 });
  }
}