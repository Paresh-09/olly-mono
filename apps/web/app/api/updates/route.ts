// app/api/updates/route.ts
import { sendDiscordNotification } from "@/service/discord-notify";
import { NextResponse } from "next/server";

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');

  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin || '*',
      "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

export async function POST(request: Request) {
  const extensionId = request.headers.get('X-Extension-ID');

  if (extensionId !== process.env.EXTENSION_ID) {
    return new NextResponse('Unauthorized', { status: 403 });
  }

  if (request.method === 'OPTIONS') {
    return OPTIONS(request);
  }

  try {
    const { userId, extensionVersion, action } = await request.json();

    await sendDiscordNotification(
      `Extension ${action} by user ${userId} (Extension Version: ${extensionVersion})`
    );

    const response = new NextResponse(
      JSON.stringify({
        success: true,
      }),
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          "Access-Control-Allow-Headers": "*",
        },
      }
    );

    return response;
  } catch (error: any) {
    console.error(`Error notifying extension ${error.message}`);
    const errorResponse = new NextResponse(
      JSON.stringify({
        success: false,
        error: `Failed to notify extension`,
      }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          "Access-Control-Allow-Headers": "*",
        },
      }
    );
    return errorResponse;
  }
}