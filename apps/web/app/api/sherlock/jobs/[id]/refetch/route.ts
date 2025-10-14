import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const job = await prismadb.sherlockJob.findUnique({
      where: { id: params.id }
    });

    if (!job) {
      return new NextResponse(JSON.stringify({ error: "Job not found" }), { status: 404 });
    }

    // Re-fetch from Sherlock API using existing taskId
    const response = await fetch(
      `${process.env.SHERLOCK_API_URL}/sherlock-status/${job.taskId}`,
      {
        headers: {
          'authorization-key': process.env.SHERLOCK_AUTH_TOKEN || ''
        }
      }
    );

    const data = await response.json();
    
    // Update job with new results
    const updatedJob = await prismadb.sherlockJob.update({
      where: { id: params.id },
      data: {
        status: data.status.toLowerCase() === "completed" ? "COMPLETED" :
                data.status.toLowerCase() === "failed" ? "FAILED" :
                data.status.toLowerCase() === "processing" ? "PROCESSING" : "PENDING",
        results: data.result?.accounts_found?.length ? data.result.accounts_found : undefined,
      }
    });

    return NextResponse.json({ job: updatedJob });
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
}