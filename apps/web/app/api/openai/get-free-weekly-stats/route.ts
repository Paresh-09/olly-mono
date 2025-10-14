// app/api/get-free-weekly-stats/route.ts
import { NextResponse } from "next/server";
import { google, sheets_v4 } from "googleapis";

function getDecodedCredentials() {
  const encodedKey = process.env.GOOGLE_SERVICE_KEY;
  if (!encodedKey) {
    throw new Error(
      "GOOGLE_SERVICE_KEY is not set in the environment variables",
    );
  }
  const decodedKey = Buffer.from(encodedKey, "base64").toString();
  return JSON.parse(decodedKey);
}

async function getAuthenticatedClient() {
  const credentials = getDecodedCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file",
    ],
  });
  return auth.getClient();
}

async function getUserWeeklyGenerationData(userId: string) {
  try {
    const auth = await getAuthenticatedClient();
    const sheets: sheets_v4.Sheets = google.sheets({
      version: "v4",
      auth: auth as any,
    });

    // Get all data from the spreadsheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A:E",
    });

    const rows = response.data.values || [];

    // Calculate date range for the last 7 days
    const today = new Date();

    //@ts-ignore
    const dates = [];

    // Generate array of dates for the last 7 days in YYYY-MM-DD format
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const formattedDate = date.toISOString().split("T")[0]; // YYYY-MM-DD format
      dates.push(formattedDate);
    }

    // Find rows that match the user ID and are within the last 7 days
    const userRows = rows.filter(
      //@ts-ignore
      (row) => row[0] === userId && dates.includes(row[1]),
    );

    // Create a map to store daily counts and details
    const dailyData = {};

    // Initialize with zero counts for all 7 days
    dates.forEach((date) => {
      //@ts-ignore
      dailyData[date] = {
        count: 0,
        action_types: [],
        platforms: [],
      };
    });

    // Fill in actual data where available
    userRows.forEach((row) => {
      const date = row[1];
      const count = parseInt(row[2], 10);
      const actionTypes = row[3] ? row[3].split(",") : [];
      const platforms = row[4] ? row[4].split(",") : [];

      //@ts-ignore
      dailyData[date] = {
        count,
        action_types: actionTypes,
        platforms,
      };
    });

    // Calculate total count across all days
    const totalCount = Object.values(dailyData).reduce(
      (sum: number, day: any) => sum + day.count,
      0,
    );

    return {
      userId,
      totalCount,
      dailyData,
    };
  } catch (error) {
    console.error(
      "Error reading user weekly generation data from Google Sheets:",
      error,
    );
    throw error;
  }
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");

  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

export async function GET(request: Request) {
  const extensionId = request.headers.get("X-Extension-ID");

  if (request.method === "OPTIONS") {
    return OPTIONS(request);
  }

  const url = new URL(request.url);
  const userId = url.searchParams.get("user_id");

  if (!userId) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: "Missing user_id parameter",
      }),
      {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          "Access-Control-Allow-Headers": "*",
          "Content-Type": "application/json",
        },
      },
    );
  }

  try {
    const weeklyData = await getUserWeeklyGenerationData(userId);

    const response = new NextResponse(
      JSON.stringify({
        success: true,
        data: weeklyData,
      }),
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          "Access-Control-Allow-Headers": "*",
          "Content-Type": "application/json",
        },
      },
    );

    return response;
  } catch (error: any) {
    console.error(`Error getting weekly stats: ${error.message}`);

    const errorResponse = new NextResponse(
      JSON.stringify({
        success: false,
        error: "Failed to retrieve weekly generation stats",
      }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          "Access-Control-Allow-Headers": "*",
          "Content-Type": "application/json",
        },
      },
    );

    return errorResponse;
  }
}
