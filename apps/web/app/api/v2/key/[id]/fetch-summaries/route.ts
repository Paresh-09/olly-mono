// app/api/summary-history/[apiKeyId]/route.ts
import { NextResponse } from "next/server";
import prisma from '@/lib/prismadb';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const { id } = params;

        const customKnowledge = await prisma.apiKeyCustomKnowledge.findUnique({
            where: { id },
            include: {
                knowledgeSummaries: {
                    orderBy: { createdAt: 'desc' },
                    select: { id: true, summary: true, createdAt: true }
                }
            }
        });

        if (!customKnowledge) {
            return new NextResponse(JSON.stringify({ error: "Custom knowledge not found" }), { status: 404 });
        }

        return new NextResponse(JSON.stringify(customKnowledge.knowledgeSummaries), { status: 200 });
    } catch (error: any) {
        console.error(`Error fetching summary history: ${error.message}`);
        return new NextResponse(JSON.stringify({ error: "Error fetching summary history" }), { status: 500 });
    }
}