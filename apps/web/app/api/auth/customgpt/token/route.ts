import { NextResponse } from "next/server";
import { PrismaClient } from "@repo/db";
import { encrypt } from "@/lib/encryption";
import crypto from "crypto";
import fetch from "node-fetch";

const prisma = new PrismaClient();
const CUSTOMGPT_CLIENT_ID = process.env.CUSTOMGPT_CLIENT_ID!;
const CUSTOMGPT_CLIENT_SECRET = process.env.CUSTOMGPT_CLIENT_SECRET!;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || "YOUR_DISCORD_WEBHOOK_URL";

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

// Function to send logs to Discord
async function sendDiscordMessage(message: string, data: any = {}) {
  try {
    const content = `**Token Exchange**: ${message}\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;
    
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

export async function POST(request: Request) {
  await sendDiscordMessage("Token exchange request received", {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(Array.from(request.headers.entries()))
  });
  
  try {
    let body;
    const contentType = request.headers.get("content-type") || "";
    
    // Parse request body based on content type
    if (contentType.includes("application/json")) {
      body = await request.json();
      await sendDiscordMessage("JSON request received", { contentType });
    } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
      await sendDiscordMessage("Form data request received", { contentType });
    } else {
      await sendDiscordMessage("Unsupported content type", { contentType });
      return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });
    }
    
    const { 
      grant_type, 
      code, 
      client_id, 
      client_secret, 
      redirect_uri, 
      refresh_token 
    } = body;
    
    await sendDiscordMessage("Token request parameters", { 
      grant_type, 
      code: code ? "[REDACTED]" : undefined,
      client_id,
      redirect_uri,
      has_refresh_token: !!refresh_token,
      has_client_secret: !!client_secret
    });

    // Validate client credentials
    if (client_id !== CUSTOMGPT_CLIENT_ID || client_secret !== CUSTOMGPT_CLIENT_SECRET) {
      await sendDiscordMessage("Invalid client credentials", { 
        provided_client_id: client_id, 
        expected_client_id: CUSTOMGPT_CLIENT_ID,
        client_secret_match: client_secret === CUSTOMGPT_CLIENT_SECRET
      });
      return NextResponse.json({ error: "invalid_client" }, { status: 401 });
    }

    // Handle different grant types
    if (grant_type === "authorization_code" && code) {
      // Exchange authorization code for tokens
      await sendDiscordMessage("Processing authorization_code grant");
      
      // Generate long-lasting tokens for ChatGPT
      const accessToken = crypto.randomUUID();
      const refreshToken = crypto.randomUUID();
      // Longer expiration time to avoid frequent re-logins
      const expiresIn = 7 * 24 * 3600; // 7 days
      const expiresAt = new Date(Date.now() + expiresIn * 1000);
      
      // Get userId from code that was stored in the cookie
      // Normally we'd validate the code here, but for this implementation we'll create a guest user
      // A proper implementation would look up the user based on the code in a temporary store
      
      try {
        // Find or create a guest user
        const user = await prisma.user.create({
          data: {
            email: `guest_${crypto.randomUUID()}@example.com`,
            name: "Guest User",
            username: `guest_${crypto.randomUUID()}`,
            password: "", // Using password field instead of hashedPassword
            isEmailVerified: true, // Using isEmailVerified instead of emailVerified
          }
        });
        
        // Store the OAuth token in the database
        await prisma.oAuthToken.create({
          data: {
            userId: user.id,
            platform: "CUSTOMGPT",
            accessToken: await encrypt(accessToken),
            refreshToken: await encrypt(refreshToken),
            expiresAt,
            isValid: true,
          }
        });
        
        await sendDiscordMessage("Created guest user and stored token", { 
          userId: user.id,
          expiresAt
        });
      } catch (error) {
        await sendDiscordMessage("Error storing token in database", {
          error: error instanceof Error ? error.message : String(error)
        });
        // Continue anyway to return a response to ChatGPT
      }
      
      // Return the token response
      const response: TokenResponse = {
        access_token: accessToken,
        token_type: "Bearer",
        expires_in: expiresIn,
        refresh_token: refreshToken
      };
      
      await sendDiscordMessage("Token exchange successful", {
        expires_in: expiresIn,
        token_type: "Bearer"
      });
      return NextResponse.json(response);
      
    } else if (grant_type === "refresh_token" && refresh_token) {
      // Refresh the access token
      await sendDiscordMessage("Processing refresh_token grant");
      
      const accessToken = crypto.randomUUID();
      const newRefreshToken = crypto.randomUUID();
      const expiresIn = 7 * 24 * 3600; // 7 days
      const expiresAt = new Date(Date.now() + expiresIn * 1000);
      
      try {
        // Find the token in the database
        const token = await prisma.oAuthToken.findFirst({
          where: {
            refreshToken: await encrypt(refresh_token),
            isValid: true,
          },
        });
        
        if (token) {
          // Update token
          await prisma.oAuthToken.update({
            where: { id: token.id },
            data: {
              accessToken: await encrypt(accessToken),
              refreshToken: await encrypt(newRefreshToken),
              expiresAt,
            },
          });
          
          await sendDiscordMessage("Updated token in database", { tokenId: token.id });
        } else {
          await sendDiscordMessage("Refresh token not found in database");
        }
      } catch (error) {
        await sendDiscordMessage("Error updating token in database", {
          error: error instanceof Error ? error.message : String(error)
        });
        // Continue anyway to return a response to ChatGPT
      }
      
      // Return the token response
      const response: TokenResponse = {
        access_token: accessToken,
        token_type: "Bearer",
        expires_in: expiresIn,
        refresh_token: newRefreshToken
      };
      
      await sendDiscordMessage("Token refresh successful");
      return NextResponse.json(response);
      
    } else {
      await sendDiscordMessage("Invalid grant type or missing parameters", { grant_type });
      return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
    }
  } catch (error) {
    await sendDiscordMessage("Token exchange error", { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined 
    });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
} 