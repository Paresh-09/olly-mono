import { validateRequest } from "@/lib/auth";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET() {
  const { user } = await validateRequest();
  
  if (!user) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const jobs = await prismadb.sherlockJob.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  return NextResponse.json({ jobs });
}