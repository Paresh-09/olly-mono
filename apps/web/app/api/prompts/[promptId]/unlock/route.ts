// app/api/prompts/[promptId]/unlock/route.ts
import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function POST(request: Request, props: { params: Promise<{ promptId: string }> }) {
  const params = await props.params;
  try {
    const { promptId } = params;
    const { user } = await validateRequest();

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the prompt and check if it's premium
    const prompt = await prismadb.prompt.findUnique({
      where: { id: promptId },
      include: {
        unlockedBy: {
          where: { userId: user.id }
        }
      }
    });

    if (!prompt) {
      return new NextResponse("Prompt not found", { status: 404 });
    }

    if (!prompt.isPremium) {
      return new NextResponse("This is not a premium prompt", { status: 400 });
    }

    if (prompt.unlockedBy.length > 0) {
      return new NextResponse("Prompt already unlocked", { status: 400 });
    }

    // Get user's credit balance
    const userCredit = await prismadb.userCredit.findUnique({
      where: { userId: user.id }
    });

    if (!userCredit || userCredit.balance < prompt.creditCost) {
      return new NextResponse("Insufficient credits", { status: 400 });
    }

    // Perform the unlock transaction
    const result = await prismadb.$transaction([
      // Deduct credits
      prismadb.userCredit.update({
        where: { userId: user.id },
        data: { balance: { decrement: prompt.creditCost } }
      }),

      // Create credit transaction record
      prismadb.creditTransaction.create({
        data: {
          userCreditId: userCredit.id,
          amount: -prompt.creditCost,
          type: "SPENT",
          description: `Unlocked premium prompt:${prompt.id} ${prompt.title || 'Untitled'}`
        }
      }),

      // Create unlock record
      prismadb.unlockedPrompt.create({
        data: {
          userId: user.id,
          promptId: prompt.id
        }
      })
    ]);

    return new NextResponse(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error unlocking prompt:", error);
    return new NextResponse("Error unlocking prompt", { status: 500 });
  }
}