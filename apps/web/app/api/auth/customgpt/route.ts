import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateRequest } from "@/lib/auth";
import crypto from "crypto";
import fetch from "node-fetch";

const CUSTOMGPT_CLIENT_ID = process.env.CUSTOMGPT_CLIENT_ID!;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || "YOUR_DISCORD_WEBHOOK_URL";

// Support both domains and the actual GPT ID from the URL 
const GPT_ID = "g-680cf2f9222081919baa36041c0b3278";
const DEFAULT_CALLBACK_URL = `https://chat.openai.com/aip/${GPT_ID}/oauth/callback`;
const CHATGPT_CALLBACK_URL = `https://chatgpt.com/aip/${GPT_ID}/oauth/callback`;

// Function to send logs to Discord
async function sendDiscordMessage(message: string, data: any = {}) {
  try {
    const content = `**OAuth Log**: ${message}\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;
    
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
      }),
    });
  } catch (error) {
    console.error("Error sending Discord message:", error);
  }
}

export async function GET(request: Request) {
  const { user } = await validateRequest();
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state");
  const redirectUri = searchParams.get("redirect_uri");
  const responseType = searchParams.get("response_type");
  const clientId = searchParams.get("client_id");
  
  // Log the incoming request to Discord
  await sendDiscordMessage("Authorization request received", { 
    state, 
    redirectUri, 
    responseType, 
    clientId,
    url: request.url,
    headers: Object.fromEntries(Array.from(request.headers.entries()))
  });
  
  // If user is not authenticated, redirect to login
  if (!user) {
    await sendDiscordMessage("User not authenticated, redirecting to login");
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
  }

  await sendDiscordMessage("User authenticated", { 
    userId: user.id, 
    email: user.email
  });

  // Generate authorization code
  const code = crypto.randomUUID();

  // Store the code and user info in cookies for later validation
  (await cookies()).set("customgpt_code", code, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  // Store the state if provided
  if (state) {
    (await cookies()).set("customgpt_state", state, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    });
  }

  // Use the provided redirect_uri or determine the best default
  // First check if redirectUri exists
  let finalRedirectUrl;
  if (redirectUri) {
    finalRedirectUrl = new URL(redirectUri);
  } else {
    // Try to figure out which domain sent the request
    const referer = request.headers.get("referer") || "";
    if (referer.includes("chatgpt.com")) {
      finalRedirectUrl = new URL(CHATGPT_CALLBACK_URL);
    } else {
      finalRedirectUrl = new URL(DEFAULT_CALLBACK_URL);
    }
  }
  
  // Add the code and state to the redirect URL
  finalRedirectUrl.searchParams.set("code", code);
  if (state) {
    finalRedirectUrl.searchParams.set("state", state);
  }
  
  await sendDiscordMessage("Redirecting to ChatGPT", { 
    redirectUrl: finalRedirectUrl.toString(),
    code: "[REDACTED]", 
    state 
  });

  return NextResponse.redirect(finalRedirectUrl.toString());
} 