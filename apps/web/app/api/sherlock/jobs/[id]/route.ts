import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const job = await prismadb.sherlockJob.findUnique({
      where: { id: params.id }
    });

    return NextResponse.json({ job });
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
