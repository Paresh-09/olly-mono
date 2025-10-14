import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { Platform } from "@repo/db";

export async function GET(request: Request, props: { params: Promise<{ platform: string }> }) {
  const params = await props.params;
  try {
    const { platform } = params;
    const session = await validateRequest();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "You must be logged in to view audit history" }, 
        { status: 401 }
      );
    }

    const audits = await prismadb.auditProfileData.findMany({
      where: {
        userId: userId,
        platform: platform.toUpperCase() as Platform,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return NextResponse.json({ 
      success: true, 
      audits 
    });
  } catch (error) {
    console.error('Error fetching audit history:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}