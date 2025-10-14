import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@repo/db";
import { encrypt } from "@/lib/encryption";
import { validateRequest } from "@/lib/auth";
import crypto from "crypto";

const prisma = new PrismaClient();
const CUSTOMGPT_CLIENT_ID = process.env.CUSTOMGPT_CLIENT_ID!;
const CUSTOMGPT_CLIENT_SECRET = process.env.CUSTOMGPT_CLIENT_SECRET!;

export async function GET(request: Request) {
  const { user } = await validateRequest();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");
  
  console.log("Callback received:");

  if (!user) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
  }

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/error?message=${encodeURIComponent(error)}`,
    );
  }

  // Verify state parameter for CSRF protection
  const storedState = (await cookies()).get("customgpt_state")?.value;
  if (state && storedState && state !== storedState) {
    console.error("State validation failed:", { received: state, expected: storedState });
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/error?message=${encodeURIComponent("Invalid state parameter")}`,
    );
  }

  try {
    // Generate tokens
    const accessToken = await encrypt(crypto.randomUUID());
    const refreshToken = await encrypt(crypto.randomUUID());
    const expiresIn = 3600; // 1 hour
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // Store the tokens in the database
    await prisma.oAuthToken.upsert({
      where: {
        userId_platform: {
          userId: user.id,
          platform: "CUSTOMGPT",
        },
      },
      update: {
        accessToken,
        refreshToken,
        expiresAt,
        isValid: true,
      },
      create: {
        userId: user.id,
        platform: "CUSTOMGPT",
        accessToken,
        refreshToken,
        expiresAt,
        isValid: true,
      },
    });

    // Clean up cookies
    (await cookies()).delete("customgpt_state");
    (await cookies()).delete("customgpt_code");

    console.log("Authentication successful, redirecting to dashboard");
    
    // Redirect user to dashboard with success message
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?connected=true`,
    );
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/error?message=${encodeURIComponent("Authentication failed")}`,
    );
  }
} 