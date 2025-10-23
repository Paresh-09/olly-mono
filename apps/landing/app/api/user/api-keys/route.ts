import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { randomBytes } from "crypto";
import { validateRequest } from "@/lib/auth";

// GET /api/user/api-keys
export async function GET(request: NextRequest) {
  try {
    const {user} = await validateRequest();
    
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = user.id;
    
    // Fetch the user's API keys
    const userApiKeys = await prismadb.userApiKey.findMany({
      where: {
        userId,
      },    
      include: {
        apiKey: true,
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });
    
    // Format the response to mask the actual keys
    const apiKeys = userApiKeys.map((userApiKey: any) => {
      const { apiKey } = userApiKey;
      const key = apiKey.key;
      // Show only first 8 characters, mask the rest
      const maskedKey = `${key.substring(0, 8)}${'•'.repeat(16)}`;
      
      return {
        id: apiKey.id,
        key: key, // Full key is needed for copy to clipboard
        maskedKey,
        isActive: apiKey.isActive,
        createdAt: userApiKey.assignedAt,
      };
    });
    
    return NextResponse.json({ apiKeys });
    
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json({ error: "Failed to fetch API keys" }, { status: 500 });
  }
}
