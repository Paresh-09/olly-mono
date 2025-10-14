// app/api/auth/linkedin/callback/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CommentPlatform, PrismaClient } from "@repo/db";
import { encrypt, decrypt } from "@/lib/encryption";
import { validateRequest } from "@/lib/auth";

const prisma = new PrismaClient();
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID!;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET!;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`;

interface TokenResponse {
  access_token: string;
  id_token?: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
}

interface UserProfile {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}

async function encryptToken(token: string): Promise<string> {
  try {
    return encrypt(token);
  } catch (error) {
    console.error("Token encryption failed:", error);
    throw new Error("Failed to secure token data");
  }
}

async function decryptToken(encryptedToken: string): Promise<string> {
  try {
    return decrypt(encryptedToken);
  } catch (error) {
    console.error("Token decryption failed:", error);
    throw new Error("Failed to retrieve token data");
  }
}

export async function GET(request: Request) {
  const { user } = await validateRequest();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const state = searchParams.get("state");

  if (!user) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
  }

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/error?message=${encodeURIComponent(errorDescription || error)}`,
    );
  }

  // Verify state if you stored it during authorization
  const storedState = (await cookies()).get("linkedin_state")?.value;
  if (state && storedState && state !== storedState) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/error?message=Invalid state parameter`,
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/error?message=No authorization code received`,
    );
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch(
      "https://www.linkedin.com/oauth/v2/accessToken",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          client_id: LINKEDIN_CLIENT_ID,
          client_secret: LINKEDIN_CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
        }),
      },
    );

    const tokens: TokenResponse = await tokenResponse.json();

    if (!tokens.access_token) {
      throw new Error("No access token received");
    }

    let userProfile: UserProfile | null = null;

    // If we received an id_token, decode and verify it
    if (tokens.id_token) {
      // Fetch user profile using the id_token
      const userProfileResponse = await fetch(
        "https://api.linkedin.com/v2/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        },
      );

      userProfile = await userProfileResponse.json();

      // Store user profile information
      (await cookies()).set(
        "user_profile",
        JSON.stringify({
          id: userProfile?.sub,
          email: userProfile?.email,
          name: userProfile?.name,
          picture: userProfile?.picture,
        }),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24, // 24 hours
        },
      );
    }

    // Calculate token expiration
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // Encrypt tokens before storing
    const encryptedAccessToken = await encryptToken(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token
      ? await encryptToken(tokens.refresh_token)
      : null;

    // Update or create OAuth token in database
    await prisma.oAuthToken.upsert({
      where: {
        userId_platform: {
          userId: user?.id,
          platform: CommentPlatform.LINKEDIN,
        },
      },
      update: {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt: expiresAt,
        isValid: true,
      },
      create: {
        userId: user?.id,
        platform: CommentPlatform.LINKEDIN,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt: expiresAt,
        isValid: true,
      },
    });

    // Store encrypted access token in cookies (optional, consider removing in production)
    (await cookies()).set("linkedin_token", encryptedAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokens.expires_in,
    });

    // Clean up state cookie
    (await cookies()).delete("linkedin_state");

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/auto-commenter/linkedin/config`,
    );
  } catch (error) {
    console.error("LinkedIn authentication error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/error?message=Authentication failed`,
    );
  }
}
