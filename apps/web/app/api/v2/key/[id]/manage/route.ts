// app/api/api-keys/[id]/route.ts
import { NextResponse } from 'next/server';
import prismadb from "@/lib/prismadb";
import { validateRequest } from "@/lib/auth";
import { generateApiKey } from "@/lib/utils";

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = params.id;

  try {
    const apiKey = await prismadb.apiKey.findUnique({
      where: { id },
      include: { users: true }
    });

    if (!apiKey || !apiKey.users.some(u => u.userId === user.id)) {
      return NextResponse.json({ error: "Unauthorized to modify this API key" }, { status: 403 });
    }

    const newApiKey = generateApiKey();
    const updatedApiKey = await prismadb.apiKey.update({
      where: { id },
      data: { key: newApiKey }
    });

    return NextResponse.json({ apiKey: updatedApiKey });
  } catch (error) {
    console.error("Error regenerating API key:", error);
    return NextResponse.json({ error: "Failed to regenerate API key" }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = params.id;

  try {
    const apiKey = await prismadb.apiKey.findUnique({
      where: { id },
      include: { users: true }
    });

    if (!apiKey || !apiKey.users.some(u => u.userId === user.id)) {
      return NextResponse.json({ error: "Unauthorized to delete this API key" }, { status: 403 });
    }

    // Delete related UserApiKey records
    await prismadb.userApiKey.deleteMany({
      where: { apiKeyId: id }
    });

    // Delete related ApiKeyUsageTracking records
    await prismadb.apiKeyUsageTracking.deleteMany({
      where: { apiKeyId: id }
    });

    // Delete related ApiUsage records
    await prismadb.apiUsage.deleteMany({
      where: { apiKeyId: id }
    });

    // Delete related FreeComment records
    await prismadb.freeComment.deleteMany({
      where: { apiKeyId: id }
    });

    // Delete related Installation records
    await prismadb.installation.deleteMany({
      where: { apiKeyId: id }
    });

    // Finally, delete the ApiKey
    await prismadb.apiKey.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting API key:", error);
    return NextResponse.json({ error: "Failed to delete API key" }, { status: 500 });
  }
}