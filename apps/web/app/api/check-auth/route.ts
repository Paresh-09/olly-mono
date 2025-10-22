import { NextRequest, NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";
import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function GET(request: NextRequest) {
    try {
        const { user, session } = await validateRequest();

        if (!user || !session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get user's credit balance from UserCredit table
        const userCredit = await prismadb.userCredit.findUnique({
            where: { userId: user.id }
        });

        // Create JWT payload with user data
        const payload = {
            userId: user.id,
            username: user.username,
            email: user.email,
            credits: userCredit?.balance || 0,
            thumbnailCredits: user.thumbnailCredits || 0,
            isAdmin: user.isAdmin,
            isSuperAdmin: user.isSuperAdmin,
            isBetaTester: user.isBetaTester,
            isSupport: user.isSupport,
            isSales: user.isSales,
            onboardingComplete: user.onboardingComplete,
            isEmailVerified: user.isEmailVerified,
            organizations: user.organizations,
            // Add any other necessary user properties
            sessionId: session.id,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
        };

        // Sign the JWT
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET!,
            { algorithm: "HS256" }
        );

        // Return only the token in the response body
        return NextResponse.json({ token });

    } catch (error) {
        console.error("Auth check error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}