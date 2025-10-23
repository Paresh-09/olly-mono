import { NextRequest, NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";

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

        const bodyText = await resp.text();

        // Try to parse JSON, otherwise return text
        let json: any = null;
        try {
            json = JSON.parse(bodyText);
        } catch {
            return new NextResponse(bodyText, { status: resp.status });
        }

        // Build response
        const response = NextResponse.json(json, { status: resp.status });
        const token = json?.token;
        if (token) {
            // Try to verify the JWT and extract sessionId
            try {
                const secret = process.env.JWT_SECRET;
                if (secret) {
                    const decoded = jwt.verify(token, secret) as any;
                    const sessionId = decoded?.sessionId || decoded?.session_id || decoded?.sid;
                    if (sessionId && typeof sessionId === 'string') {
                        response.cookies.set({
                            name: 'auth_session',
                            value: sessionId,
                            httpOnly: true,
                            path: '/',
                            sameSite: 'lax',
                            secure: process.env.NODE_ENV === 'production',
                            maxAge: typeof decoded?.exp === 'number' && typeof decoded?.iat === 'number'
                                ? Math.max(0, decoded.exp - Math.floor(Date.now() / 1000))
                                : 60 * 60 * 24,
                        });
                    } else {
                        // If sessionId not found, store the raw token as fallback
                        response.cookies.set({
                            name: 'auth_session',
                            value: token,
                            httpOnly: true,
                            path: '/',
                            sameSite: 'lax',
                            secure: process.env.NODE_ENV === 'production',
                            maxAge: 60 * 60 * 24,
                        });
                    }
                } else {
                    // No secret configured — fallback to storing token
                    response.cookies.set({
                        name: 'auth_session',
                        value: token,
                        httpOnly: true,
                        path: '/',
                        sameSite: 'lax',
                        secure: process.env.NODE_ENV === 'production',
                        maxAge: 60 * 60 * 24,
                    });
                }
            } catch (err) {
                // verification failed — fallback to storing token
                response.cookies.set({
                    name: 'auth_session',
                    value: token,
                    httpOnly: true,
                    path: '/',
                    sameSite: 'lax',
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60 * 60 * 24,
                });
            }
        }

        return response;
    } catch (err) {
        console.error('Landing -> dashboard auth proxy error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

}
