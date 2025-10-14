// app/api/auth/reddit/callback/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CommentPlatform, PrismaClient } from "@repo/db";
import { encrypt, decrypt } from "@/lib/encryption";
import { validateRequest } from "@/lib/auth";

const prisma = new PrismaClient();
const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID!;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET!;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/reddit/callback`;

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
}

interface RedditUserProfile {
  id: string;
  name: string;
  icon_img?: string;
}

async function encryptToken(token: string): Promise<string> {
  try {
    return encrypt(token);
  } catch (error) {
    console.error("Token encryption failed:", error);
    throw new Error("Failed to secure token data");
  }
}

export async function GET(request: Request) {
  const { user } = await validateRequest();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");

  if (!user) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
  }

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/error?message=${encodeURIComponent(error)}`,
    );
  }

  // Verify state parameter
  const storedState = (await cookies()).get("reddit_state")?.value;
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
    // Exchange code for tokens using Basic Auth
    const tokenResponse = await fetch(
      "https://www.reddit.com/api/v1/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`,
          ).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: REDIRECT_URI,
        }),
      },
    );

    const tokens: TokenResponse = await tokenResponse.json();

    if (!tokens.access_token) {
      throw new Error("No access token received");
    }

    // Fetch Reddit user profile
    const userProfileResponse = await fetch(
      "https://oauth.reddit.com/api/v1/me",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      },
    );

    const userProfile: RedditUserProfile = await userProfileResponse.json();

    // Store user profile information
    (await cookies()).set(
      "reddit_user_profile",
      JSON.stringify({
        id: userProfile.id,
        name: userProfile.name,
        picture: userProfile.icon_img,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
      },
    );

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
          platform: CommentPlatform.REDDIT,
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
        platform: CommentPlatform.REDDIT,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt: expiresAt,
        isValid: true,
      },
    });

    // Store encrypted access token in cookies
    (await cookies()).set("reddit_token", encryptedAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokens.expires_in,
    });

    // Clean up state cookie
    (await cookies()).delete("reddit_state");

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/auto-commenter/reddit/config`,
    );
  } catch (error) {
    console.error("Reddit authentication error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/error?message=Authentication failed`,
    );
  }
}
