// app/api/auth/reddit/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID!;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/reddit/callback`;

export async function GET() {
  // Generate random state for security
  const state = Math.random().toString(36).substring(7);

  // Store state in cookies for validation
  (await cookies()).set("reddit_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
  });

  // Construct Reddit authorization URL
  const authUrl =
    `https://www.reddit.com/api/v1/authorize?` +
    new URLSearchParams({
      client_id: REDDIT_CLIENT_ID,
      response_type: "code",
      state,
      redirect_uri: REDIRECT_URI,
      duration: "permanent", // Request refresh token for permanent access
      scope: "identity edit submit read", // Adjust scopes based on your needs
    }).toString();

  return NextResponse.redirect(authUrl);
}
