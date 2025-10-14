import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prismadb from "@/lib/prismadb";
import { validateRequest } from "@/lib/auth";
import { subMonths } from "date-fns";
import { Prisma } from "@repo/db";

const SHERLOCK_URL = process.env.SHERLOCK_API_URL;
const SHERLOCK_AUTH_TOKEN = process.env.SHERLOCK_AUTH_TOKEN;
const WEBHOOK_URL =`${process.env.NEXT_PUBLIC_APP_URL}/api/sherlock/webhook`;
const SCAN_CREDIT_COST = 3;

export async function POST(request: Request) {
    const { username } = await request.json();
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';

    if (!SHERLOCK_URL || !SHERLOCK_AUTH_TOKEN) {
        return new NextResponse(JSON.stringify({ error: "API configuration missing" }), { status: 500 });
    }

    try {
        // Check for recent completed job
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

        const { user } = await validateRequest();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Handle credit deduction and rate limiting
        if (user) {
            const userCredit = await prismadb.userCredit.findUnique({
                where: { userId: user.id }
            });

            if (!userCredit || userCredit.balance < SCAN_CREDIT_COST) {
                return new NextResponse(JSON.stringify({ error: "Insufficient credits" }), { status: 402 });
            }

            // Deduct credits only if no recent job exists
            if (!existingJob) {
                await prismadb.$transaction([
                    prismadb.userCredit.update({
                        where: { userId: user.id },
                        data: { balance: userCredit.balance - SCAN_CREDIT_COST }
                    }),
                    prismadb.creditTransaction.create({
                        data: {
                            userCreditId: userCredit.id,
                            amount: -SCAN_CREDIT_COST,
                            type: "SPENT",
                            description: "Sherlock scan"
                        }
                    })
                ]);
            }
        } else {
            const usage = await prismadb.userUsage.findFirst({
                where: { ipAddress: ip, date: today }
            });

            if (usage && usage.count >= 1) {
                return new NextResponse(JSON.stringify({
                    error: "Daily free limit reached. Please sign in to continue."
                }), { status: 429 });
            }
        }

        if (existingJob) {
            // Track usage for non-authenticated users
            if (!user) {
                await prismadb.userUsage.upsert({
                    where: {
                        ipAddress_date: { ipAddress: ip, date: today }
                    },
                    update: { count: { increment: 1 } },
                    create: {
                        ipAddress: ip,
                        date: today,
                        count: 1
                    }
                });
            }

            return new NextResponse(JSON.stringify({
                status: "COMPLETED",
                task_id: existingJob.taskId,
                jobId: existingJob.id,
                cached: true,
                results: existingJob.results
            }), { status: 200 });
        }

        // Regular API call if no cache exists
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
        const job = await prismadb.sherlockJob.create({
            data: {
                taskId: data.task_id,
                requestId: data.request_id,
                username: username,
                status: "PENDING",
                outputFile: data.output_file,
                errorMessage: data.error_message,
                userId: user?.id || null
            }
        });

        if (!user) {
            await prismadb.userUsage.upsert({
                where: {
                    ipAddress_date: { ipAddress: ip, date: today }
                },
                update: { count: { increment: 1 } },
                create: {
                    ipAddress: ip,
                    date: today,
                    count: 1
                }
            });
        }

        return new NextResponse(JSON.stringify({
            status: data.status,
            task_id: data.task_id,
            request_id: data.request_id,
            error_message: data.error_message,
            output_file: data.output_file,
            jobId: job.id
        }), { status: 200 });
    } catch (error: any) {
        console.error(`Error initiating Sherlock scan:`, error);
        return new NextResponse(JSON.stringify({
            error: error.message || "Failed to initiate scan"
        }), { status: 500 });
    }
}