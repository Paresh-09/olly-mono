import { NextResponse } from "next/server"; 
import prismadb from "@/lib/prismadb";
import { Prisma } from "@repo/db";

const SHERLOCK_URL = process.env.SHERLOCK_API_URL;
const SHERLOCK_AUTH_TOKEN = process.env.SHERLOCK_AUTH_TOKEN;

interface SearchResult {
    platform: string;
    url: string;
}
   
export async function GET(request: Request, props: { params: Promise<{ taskId: string }> }) {
    const params = await props.params;
    
    if (!params.taskId || params.taskId === 'undefined') {
        return new NextResponse(JSON.stringify({ 
            status: "completed",
            message: "Job already completed (cached results)",
            task_id: params.taskId
        }), { status: 200 });
    }
    
    if (!SHERLOCK_URL || !SHERLOCK_AUTH_TOKEN) {
        return new NextResponse(JSON.stringify({ 
            error: "API configuration missing" 
        }), { status: 500 });
    }

    try {
        // First check our database for the job status
        const existingJob = await prismadb.sherlockJob.findUnique({
            where: { taskId: params.taskId }
        });

        // If job exists and is in a final state, return that status
        if (existingJob && (existingJob.status === "COMPLETED" || existingJob.status === "FAILED")) {
            return new NextResponse(JSON.stringify({
                task_id: params.taskId,
                status: existingJob.status.toLowerCase(), // Frontend expects lowercase
                result: existingJob.results,
                error: existingJob.errorMessage,
                total_found: existingJob.totalFound,
                valid_found: existingJob.validFound
            }), {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, max-age=0',
                    'Pragma': 'no-cache'
                }
            });
        }

        // For cached jobs, don't call external API
        if (params.taskId.startsWith('cached_')) {
            return new NextResponse(JSON.stringify({
                task_id: params.taskId,
                status: "completed",
                result: existingJob?.results || [],
                message: "Cached results"
            }), {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, max-age=0',
                    'Pragma': 'no-cache'
                }
            });
        }

        // If job doesn't exist or is still pending/processing, check with Sherlock API
        const response = await fetch(
            `${SHERLOCK_URL}/sherlock-status/${params.taskId}?t=${Date.now()}`,
            {
                headers: {
                    'authorization-key': `${SHERLOCK_AUTH_TOKEN}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                },
                cache: 'no-store'
            }
        );
          
        if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
        }
   
        const data = await response.json();
   
        let transformedResults: SearchResult[] = [];
        if (data.result?.accounts_found && Array.isArray(data.result.accounts_found)) {
            transformedResults = data.result.accounts_found
                .filter((url: string) => !url.includes("Total Websites"))
                .map((url: string) => {
                    const platform = url.split('/')[2]?.replace('www.', '');
                    return {
                        platform,
                        url
                    };
                })
                .filter((result: SearchResult) => result.platform && result.url);
        }
   
        // Only update if job exists and taskId is not cached
        if (existingJob && !params.taskId.startsWith('cached_')) {
            await prismadb.sherlockJob.update({
                where: { taskId: params.taskId },
                data: {
                    status: data.status.toLowerCase() === "completed" ? "COMPLETED" :
                            data.status.toLowerCase() === "failed" ? "FAILED" :
                            data.status.toLowerCase() === "processing" ? "PROCESSING" : "PENDING",
                    results: transformedResults.length ? 
                        JSON.parse(JSON.stringify(transformedResults)) as Prisma.JsonArray : 
                        undefined,
                    errorMessage: data.error_message || data.error,
                    // Add these fields to match webhook
                    totalFound: data.result?.total_found,
                    validFound: data.result?.valid_found
                },
            });
        }
   
        return new NextResponse(JSON.stringify({
            task_id: params.taskId,
            status: data.status,
            result: transformedResults,
            error: data.error,
            error_message: data.error_message,
            info: data.info,
            // Add these fields to match webhook response
            total_found: data.result?.total_found,
            valid_found: data.result?.valid_found
        }), { 
            status: 200,
            headers: {
                'Cache-Control': 'no-store, max-age=0',
                'Pragma': 'no-cache'
            }
        });
    } catch (error: any) {
        return new NextResponse(JSON.stringify({ 
            error: error.message || "Failed to check status" 
        }), { status: 500 });
    }
}