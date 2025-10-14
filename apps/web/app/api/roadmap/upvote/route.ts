import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemId } = body;

    if (!itemId) {
      return new NextResponse("Missing itemId", { status: 400 });
    }

    const item = await prismadb.roadmapItem.update({
      where: { id: itemId },
      data: {
        votes: { increment: 1 }
      }
    });

    return NextResponse.json(item);
  } catch (error) {
    console.log('[ROADMAP_UPVOTE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 