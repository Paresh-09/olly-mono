// app/api/auth/linkedin/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`;

export async function GET() {
  const state = Math.random().toString(36).substring(7);

  (await cookies()).set("linkedin_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
  });

  const authUrl =
    `https://www.linkedin.com/oauth/v2/authorization?` +
    new URLSearchParams({
      response_type: "code",
      client_id: LINKEDIN_CLIENT_ID!,
      redirect_uri: REDIRECT_URI,
      state,
      scope: "openid profile email w_member_social", // Updated scopes based on your access
    }).toString();

  return NextResponse.redirect(authUrl);
}
