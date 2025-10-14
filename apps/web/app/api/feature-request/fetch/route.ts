// app/api/feature-request/fetch/route.ts
import { NextResponse } from 'next/server';
import prismadb from "@/lib/prismadb";

export async function GET() {
  try {
    const roadmapItems = await prismadb.roadmapItem.findMany({
      select: {
        feature: true,
        votes: true,
      }
    });

    const upvoteCounts = roadmapItems.reduce((acc, item) => {
      acc[item.feature] = item.votes;
      return acc;
    }, {} as { [key: string]: number });

    return NextResponse.json(upvoteCounts);
  } catch (error) {
    console.error('Error fetching upvote counts:', error);
    return NextResponse.json({ message: 'Error fetching upvote counts' }, { status: 500 });
  }
}