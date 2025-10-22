import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const dashboardBase = process.env.DASHBOARD_URL;
        if (!dashboardBase) {
            return NextResponse.json({ error: "DASHBOARD_URL not configured" }, { status: 500 });
        }

        const target = new URL('/api/check-auth', dashboardBase).toString();

        // Forward cookies and Authorization header from incoming request
        const headers: Record<string, string> = {};
        const cookie = request.headers.get('cookie');
        if (cookie) headers['cookie'] = cookie;
        const auth = request.headers.get('authorization');
        if (auth) headers['authorization'] = auth;

        const resp = await fetch(target, {
            method: 'GET',
            headers,
        });

        const body = await resp.text();

        // Try to parse JSON, otherwise return text
        try {
            const json = JSON.parse(body);
            return NextResponse.json(json, { status: resp.status });
        } catch {
            return new NextResponse(body, { status: resp.status });
        }
    } catch (err) {
        console.error('Landing -> dashboard auth proxy error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

}
