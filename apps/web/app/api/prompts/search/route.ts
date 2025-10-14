// app/api/prompts/search/route.ts
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

    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("search") || "";

    // First fetch user's unlocked prompts
    const userUnlockedPrompts = await prismadb.unlockedPrompt.findMany({
      where: { userId },
      select: { promptId: true }
    });

    const unlockedPromptIds = userUnlockedPrompts.map(p => p.promptId);

    // Then fetch prompts with the search criteria
    const prompts = await prismadb.prompt.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: "insensitive" } },
          { text: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      include: {
        userUpvotes: {
          where: { userId }
        }
      },
      orderBy: [
        { upvotes: "desc" },
        { createdAt: "desc" },
      ],
    });

    // Transform the prompts to include unlock status
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