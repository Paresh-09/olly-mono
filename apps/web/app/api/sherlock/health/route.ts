import { NextResponse } from "next/server";

const SHERLOCK_URL = process.env.SHERLOCK_API_URL;
const SHERLOCK_AUTH_TOKEN = process.env.SHERLOCK_AUTH_TOKEN;

export async function GET() {
    if (!SHERLOCK_URL || !SHERLOCK_AUTH_TOKEN) {
        return new NextResponse(JSON.stringify({ 
            error: "API configuration missing" 
        }), { status: 500 });
    }

    try {
        const response = await fetch(
            `${SHERLOCK_URL}/health`,
            {
                headers: {
                    'Authorization': `Bearer ${SHERLOCK_AUTH_TOKEN}`
                }
            }
        );
        
        if (!response.ok) {
            throw new Error('Sherlock API is not healthy');
        }

        return new NextResponse(JSON.stringify({ status: 'healthy' }), { status: 200 });
    } catch (error: any) {
        console.error(`Health check failed: ${error.message}`);
        return new NextResponse(JSON.stringify({ 
            status: 'unhealthy',
            error: error.message 
        }), { status: 503 });
    }
}