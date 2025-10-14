import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { JobStatus, Prisma } from "@repo/db";
import { createSherlockNotification } from "@/lib/notifications/create";
import { sendSherlockEmail } from "@/lib/emails/sherlock";


interface SearchResult {
    platform: string;
    url: string;
}

interface SherlockResult {
    success: boolean;
    output_file: string;
    error: string | null;
    username: string;
    accounts_found: any[];
    total_found: number;
    valid_found: number;
    task_id: string;
}

interface SherlockEmailParams {
    email: string;
    username: string;
    totalFound: number;
    validFound: number;
    resultUrl: string;
}

// Move helper functions before the main export



export async function POST(request: Request) {
    const startTime = Date.now();
   

    try {
        const data: SherlockResult = await request.json();
        console.log("Raw webhook data:", JSON.stringify(data, null, 2));

        // Validate required fields
        if (!data.username || data.success === undefined || !data.task_id) {
          
            return new NextResponse(JSON.stringify({
                error: "Invalid webhook data: missing required fields",
                received: {
                    username: !!data.username,
                    success: data.success !== undefined,
                    task_id: !!data.task_id
                }
            }), { status: 400 });
        }

        console.log(" Validation passed");

        // Find the job by task_id
        console.log(` Looking for job with task_id: ${data.task_id}`);
        const job = await prismadb.sherlockJob.findUnique({
            where: { taskId: data.task_id }
        });

        if (!job) {
    

            // Check if there are ANY jobs in the database
            const totalJobs = await prismadb.sherlockJob.count();
            const recentJobs = await prismadb.sherlockJob.findMany({
                select: { id: true, taskId: true, username: true, status: true, createdAt: true },
                orderBy: { createdAt: 'desc' },
                take: 5
            });

      
            return new NextResponse(JSON.stringify({
                error: `No matching job found for task_id: ${data.task_id}`,
                username: data.username,
                debug: {
                    totalJobs,
                    recentJobs
                }
            }), { status: 400 });
        }

   

        // Check if job is already completed/failed
        if (job.status === "COMPLETED" || job.status === "FAILED") {
         
            return new NextResponse(JSON.stringify({
                status: "already_processed",
                task_id: data.task_id,
                current_status: job.status,
                message: `Job already ${job.status.toLowerCase()}`
            }), { status: 200 });
        }

        // Transform results
        let transformedResults: SearchResult[] = [];
        if (data.accounts_found && Array.isArray(data.accounts_found)) {
            console.log(`Transforming ${data.accounts_found.length} account results...`);
            transformedResults = data.accounts_found
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

        const STATUS = {
            COMPLETED: "COMPLETED",
            FAILED: "FAILED"
        } as const;
        
        // Simply use the success field to determine status
        const newStatus = data.success ? STATUS.COMPLETED : STATUS.FAILED;
        console.log(` Status determination:`, {
            success: data.success,
            newStatus
        });

        // Prepare update data
        const updateData = {
            status: newStatus as JobStatus,
            outputFile: data.output_file,
            errorMessage: data.error || undefined,
            results: JSON.parse(JSON.stringify(transformedResults)) as Prisma.JsonArray,
            totalFound: data.total_found,
            validFound: data.valid_found
        };

 

        // Perform the update with transaction

        const updatedJob = await prismadb.$transaction(async (tx) => {
            // First check if job still exists and is in the right state
            const currentJob = await tx.sherlockJob.findUnique({
                where: { taskId: data.task_id }
            });

            if (!currentJob) {
                throw new Error(`Job disappeared during update: ${data.task_id}`);
            }

            if (currentJob.status === "COMPLETED" || currentJob.status === "FAILED") {
                console.log(`  Job status changed during processing: ${currentJob.status}`);
                return currentJob; // Return existing job if already processed
            }

           

            // Perform the update
            const updated = await tx.sherlockJob.update({
                where: { taskId: data.task_id },
                data: updateData
            });


            return updated;
        });

        // Verify the update worked
        const verifyJob = await prismadb.sherlockJob.findUnique({
            where: { taskId: data.task_id },
            select: { id: true, status: true, totalFound: true, validFound: true, updatedAt: true }
        });

       

        // Handle notifications and emails only for successful jobs
        if (data.success && job.userId) {
            console.log(" Processing notifications...");

            try {
                await createSherlockNotification({
                    userId: job.userId,
                    username: data.username,
                    totalFound: data.total_found,
                    validFound: data.valid_found,
                    isSuccess: data.success,
                    errorMessage: data.error || undefined,
                    jobId: job.id,
                    taskId: data.task_id
                });
                console.log(" Notification created");
            } catch (notifError) {
                console.error(" Notification failed:", notifError);
            }

            try {
                const user = await prismadb.user.findUnique({
                    where: { id: job.userId },
                    select: { email: true }
                });

                if (user?.email) {
                    await sendSherlockEmail(
                        user.email,
                        data.username,
                        data.total_found,
                        data.valid_found,
                        `${process.env.NEXT_PUBLIC_APP_URL}/tools/sherlock/${job.id}`
                    );
                    console.log("Email sent");
                } else {
                    console.log(" User email not found");
                }
            } catch (emailError) {
                console.error(" Email failed:", emailError);
            }
        }

        // Handle failed jobs - send failure email
        if (!data.success && job.userId) {
            try {
                const user = await prismadb.user.findUnique({
                    where: { id: job.userId },
                    select: { email: true }
                });

                if (user?.email) {
                    await sendSherlockEmail(
                        user.email,
                        data.username,
                        data.total_found,
                        data.valid_found,
                        `${process.env.NEXT_PUBLIC_APP_URL}/tools/sherlock/${job.id}`
                    );
                    console.log(" Failure email sent");
                }
            } catch (emailError) {
                console.error(" Failure email failed:", emailError);
            }
        }

        const processingTime = Date.now() - startTime;
     

        return new NextResponse(JSON.stringify({
            status: "success",
            task_id: data.task_id,
            previous_status: job.status,
            new_status: updatedJob.status,
            verified_status: verifyJob?.status,
            processing_time_ms: processingTime,
            debug: {
                job_found: true,
                update_successful: updatedJob.status === newStatus,
                verification_passed: verifyJob?.status === newStatus
            }
        }), {
            status: 200,
            headers: {
                'Cache-Control': 'no-store, max-age=0',
                'Pragma': 'no-cache'
            }
        });

    } catch (error: any) {
        const processingTime = Date.now() - startTime;
        console.error(` WEBHOOK ERROR [${processingTime}ms]:`, {
            message: error.message,
            stack: error.stack,
            code: error.code,
            meta: error.meta
        });

        return new NextResponse(JSON.stringify({
            error: error.message || "Failed to process webhook",
            code: error.code || "UNKNOWN_ERROR",
            processing_time_ms: processingTime,
            timestamp: new Date().toISOString()
        }), { status: 500 });
    }
}