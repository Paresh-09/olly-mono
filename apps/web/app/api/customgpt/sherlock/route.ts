import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import prismadb from "@/lib/prismadb";
import { Prisma } from "@repo/db";
import { subMonths } from "date-fns";

const SHERLOCK_URL = process.env.SHERLOCK_API_URL;
const SHERLOCK_AUTH_TOKEN = process.env.SHERLOCK_AUTH_TOKEN;
const WEBHOOK_URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/sherlock/webhook`;

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { input } = body;

    if (!input) {
      return NextResponse.json(
        { success: false, error: "Input is required" },
        { status: 400 }
      );
    }

    // Use input as username
    const username = input;

    // Check for recent completed job for caching
    const oneMonthAgo = subMonths(new Date(), 1);
    const existingJob = await prismadb.sherlockJob.findFirst({
      where: {
        username: username,
        status: "COMPLETED",
        createdAt: { gte: oneMonthAgo },
        results: {
          not: Prisma.JsonNull
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (existingJob) {
      // Generate unique taskId and requestId by including timestamp
      const timestamp = Date.now();
      const newJob = await prismadb.sherlockJob.create({
        data: {
          taskId: `cached_${timestamp}_${existingJob.taskId}`,
          requestId: `cached_${timestamp}_${existingJob.requestId}`,
          username: username,
          status: "COMPLETED",
          results: existingJob.results as Prisma.JsonObject,
          userId: 'f9ab43b6-67ff-4915-828c-83c7b6702c83',
        }
      });

      return NextResponse.json(
        { 
          success: true, 
          data: {
            requestId: newJob.requestId,
            status: newJob.status,
            resultUrl: `https://${process.env.NEXT_PUBLIC_APP_URL}/tools/username-lookup/customgpt/${newJob.requestId}`,
            message: "Job created successfully, results already available"
          }
        },
        { status: 200 }
      );
    }

    // If we need to create a new job via the Sherlock API
    if (!SHERLOCK_URL || !SHERLOCK_AUTH_TOKEN) {
      return NextResponse.json(
        { success: false, error: "API configuration missing" },
        { status: 500 }
      );
    }

    // Call the Sherlock API
    const response = await fetch(`${SHERLOCK_URL}/sherlock-scan/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'authorization-key': SHERLOCK_AUTH_TOKEN
      },
      body: JSON.stringify({
        username,
        output_format: "text",
        print_found: true,
        timeout: 60,
        webhook_url: WEBHOOK_URL
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API responded with status ${response.status}`);
    }

    const data = await response.json();
    
    // Create a job with the API response data
    const job = await prismadb.sherlockJob.create({
      data: {
        taskId: data.task_id,
        requestId: data.request_id,
        username: username,
        status: "PENDING",
        outputFile: data.output_file,
        errorMessage: data.error_message,
        userId: 'f9ab43b6-67ff-4915-828c-83c7b6702c83',
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        data: {
          requestId: job.requestId,
          status: job.status,
          resultUrl: `https://${process.env.NEXT_PUBLIC_APP_URL}/tools/username-lookup/customgpt/${job.requestId}`,
          message: "Job created successfully, find results in resultUrl"
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[SHERLOCK_API_POST]", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to create Sherlock job" 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {

    // Get the request ID from the URL
    const url = new URL(request.url);
    const requestId = url.searchParams.get("requestId");

    if (!requestId) {
      return NextResponse.json(
        { success: false, error: "Request ID is required" },
        { status: 400 }
      );
    }

    // Get the job from the database
    const job = await prismadb.sherlockJob.findFirst({
      where: {
        requestId,
      },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    // Return the job status and results
    return NextResponse.json({
      success: true,
      data: {
        requestId: job.requestId,
        status: job.status,
        results: job.results,
        errorMessage: job.errorMessage,
        totalFound: job.totalFound,
        validFound: job.validFound
      }
    });
  } catch (error) {
    console.error("[SHERLOCK_API_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to get Sherlock job status" },
      { status: 500 }
    );
  }
} 