import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prismadb from "@/lib/prismadb";
import { validateRequest } from "@/lib/auth";
import { encrypt } from "@/lib/encryption";

const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID;
const INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`;

// Interface for Instagram token response
interface InstagramTokenResponse {
  access_token: string;
  user_id: string;
  permissions?: string;
}

export async function GET(request: Request) {
  try {
    // Get the authorization code and state from the URL
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    // Check if the user denied the request
    if (error === "access_denied") {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/automations/instagram?error=access_denied`,
      );
    }

    // Get cookies store (NOW ASYNC in Next.js 15)
    const cookieStore = await cookies();

    // Validate the state parameter to prevent CSRF attacks
    const storedState = cookieStore.get("instagram_state")?.value;
    if (!storedState || state !== storedState) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/automations/instagram?error=invalid_state`,
      );
    }

    // Clear the state cookie
    cookieStore.set("instagram_state", "", { maxAge: 0 });

    // Check if the authorization code is present
    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/automations/instagram?error=missing_code`,
      );
    }

    // Validate the user session
    const session = await validateRequest();
    if (!session?.user?.id) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=session_expired`,
      );
    }

    // Exchange the authorization code for an access token using Instagram API
    const tokenUrl = "https://api.instagram.com/oauth/access_token";

    const formData = new FormData();
    formData.append("client_id", INSTAGRAM_CLIENT_ID!);
    formData.append("client_secret", INSTAGRAM_CLIENT_SECRET!);
    formData.append("grant_type", "authorization_code");
    formData.append("redirect_uri", REDIRECT_URI);
    formData.append("code", code);

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      body: formData,
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Failed to exchange code for token:", errorText);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/automations/instagram?error=token_exchange_failed`,
      );
    }

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token || !tokenData.user_id) {
      console.error("Invalid token response:", tokenData);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/automations/instagram?error=invalid_token_response`,
      );
    }

    const shortLivedToken = tokenData.access_token;
    const userId = tokenData.user_id;

    // Exchange short-lived token for a long-lived token (60 days)
    const longLivedTokenUrl = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${INSTAGRAM_CLIENT_SECRET}&access_token=${shortLivedToken}`;

    const longLivedTokenResponse = await fetch(longLivedTokenUrl);

    if (!longLivedTokenResponse.ok) {
      console.error(
        "Failed to get long-lived token:",
        await longLivedTokenResponse.text(),
      );
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/automations/instagram?error=long_lived_token_failed`,
      );
    }

    const longLivedTokenData = await longLivedTokenResponse.json();
    const accessToken = longLivedTokenData.access_token;
    const expiresIn = longLivedTokenData.expires_in || 5184000; // Default to 60 days in seconds

    // Get Instagram account details
    const accountResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${accessToken}`,
    );

    if (!accountResponse.ok) {
      console.error(
        "Failed to get Instagram account:",
        await accountResponse.text(),
      );
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/automations/instagram?error=account_fetch_failed`,
      );
    }

    const accountData = await accountResponse.json();

    // Store the access token in the database
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);

    await prismadb.oAuthToken.upsert({
      where: {
        userId_platform: {
          userId: session.user.id,
          platform: "INSTAGRAM",
        },
      },
      update: {
        accessToken: encrypt(accessToken),
        refreshToken: null,
        expiresAt,
        isValid: true,
      },
      create: {
        userId: session.user.id,
        platform: "INSTAGRAM",
        accessToken: encrypt(accessToken),
        refreshToken: null,
        expiresAt,
        isValid: true,
      },
    });

    // Set a cookie with the Instagram account info for immediate access
    cookieStore.set(
      "instagram_business_account",
      JSON.stringify({
        id: accountData.id,
        username: accountData.username,
        accountType: accountData.account_type || "BUSINESS",
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
      },
    );

    // Redirect to the Instagram automation page with success message
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/automations/instagram?connected=true`,
    );
  } catch (error) {
    console.error("Error in Instagram callback:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/automations/instagram?error=unknown`,
    );
  }
}
