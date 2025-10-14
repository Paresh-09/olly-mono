// app/api/prompts/[promptId]/upvote/route.ts
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

    // If it's a premium prompt and user hasn't unlocked it, prevent upvoting
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

    if (existingUpvote) {
      return new NextResponse("Already upvoted", { status: 400 });
    }

    // Create upvote and increment count in a transaction
    const [upvote, updatedPrompt] = await prismadb.$transaction([
      // Create the upvote record
      prismadb.userUpvote.create({
        data: { userId, promptId },
      }),
      // Increment the upvotes counter
      prismadb.prompt.update({
        where: { id: promptId },
        data: { upvotes: { increment: 1 } },
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
    console.error("Error upvoting prompt:", error);
    return new NextResponse("Error upvoting prompt", { status: 500 });
  }
}