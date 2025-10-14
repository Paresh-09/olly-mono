import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { validateRequest } from "@/lib/auth";

// DELETE /api/user/api-keys/[id]
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const {user} = await validateRequest();
    
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = user.id;
    const keyId = params.id;
    
    // Check if the user has access to this API key
    const userApiKey = await prismadb.userApiKey.findFirst({
      where: {
        userId,
        apiKeyId: keyId,
      },
    });
    
    if (!userApiKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }
    
    // Update the API key to inactive
    await prismadb.apiKey.update({
      where: {
        id: keyId,
      },
      data: {
        isActive: false,
      },
    });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error("Error revoking API key:", error);
    return NextResponse.json({ error: "Failed to revoke API key" }, { status: 500 });
  }
} 