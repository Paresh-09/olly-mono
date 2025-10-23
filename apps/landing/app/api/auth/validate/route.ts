import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";

export async function GET() {
    try {
        const { user, session } = await validateRequest();

        if (!user || !session) {
            return NextResponse.json({
                isAuthenticated: false
            }, { status: 200 });
        }

        return NextResponse.json({
            isAuthenticated: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                thumbnailCredits: user.thumbnailCredits,
                isAdmin: user.isAdmin,
                isSuperAdmin: user.isSuperAdmin,
                organizations: user.organizations
            }
        });
    } catch (error) {
        console.error('Auth validation error:', error);
        return NextResponse.json({
            isAuthenticated: false
        }, { status: 200 });
    }
}