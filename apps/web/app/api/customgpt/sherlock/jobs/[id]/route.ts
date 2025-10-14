import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const id = params.id;
    
    // Try to find by requestId
    const job = await prismadb.sherlockJob.findFirst({
      where: { requestId: id }
    });
    
    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      job: {
        id: job.id,
        requestId: job.requestId,
        username: job.username,
        status: job.status,
        results: job.results,
        createdAt: job.createdAt,
        errorMessage: job.errorMessage,
        totalFound: job.totalFound,
        validFound: job.validFound
      } 
    });
  } catch (error: any) {
    console.error("Error fetching CustomGPT Sherlock job", { error: error.message, id: params.id });
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
} 