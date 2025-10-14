// app/api/prompts/route.ts
import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { user } = await validateRequest();
    
    const userId = user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // First fetch user's unlocked prompts
    const userUnlockedPrompts = await prismadb.unlockedPrompt.findMany({
      where: { userId },
      select: { promptId: true }
    });

    const unlockedPromptIds = userUnlockedPrompts.map(p => p.promptId);

    // Then fetch all prompts
    const prompts = await prismadb.prompt.findMany({
      include: {
        userUpvotes: {
          where: { userId }
        }
      },
      orderBy: [
        { upvotes: "desc" },
        { createdAt: "desc" },
      ]
    });

    // Transform the response to include isUnlocked status
    const transformedPrompts = prompts.map(prompt => ({
      ...prompt,
      isUnlocked: prompt.isPremium ? unlockedPromptIds.includes(prompt.id) : true,
      hasUpvoted: prompt.userUpvotes.length > 0,
      userUpvotes: undefined // Remove the upvotes array from response
    }));

    return new NextResponse(JSON.stringify(transformedPrompts), { status: 200 });
  } catch (error) {
    console.error("Error fetching prompts:", error);
    return new NextResponse("Error fetching prompts", { status: 500 });
  }
}

export async function POST(request: Request) {
  const { user } = await validateRequest();

  const userId = user?.id;

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { text, category, promptTitle, isPremium, creditCost } = await request.json();

    const user = await prismadb.user.findUnique({
      where: { id: userId },
      select: { id: true, isSupport: true },
    });

    if (!user || !user.isSupport) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Validate premium prompt data
    if (isPremium && (!creditCost || creditCost < 0)) {
      return new NextResponse("Invalid credit cost for premium prompt", { status: 400 });
    }

    const prompt = await prismadb.prompt.create({
      data: {
        text,
        category,
        title: promptTitle,
        userId: userId,
        isPremium: isPremium || false,
        creditCost: isPremium ? creditCost : 0
      },
    });

    return new NextResponse(JSON.stringify(prompt), { status: 201 });
  } catch (error) {
    console.error("Error adding prompt:", error);
    return new NextResponse("Error adding prompt", { status: 500 });
  }
}