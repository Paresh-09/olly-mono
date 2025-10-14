// app/api/images/gallery/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prismadb";

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Validate user authentication
    const { user } = await validateRequest();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const id = params.id;

    // Check if image exists and belongs to user
    const image = await prisma.imageGeneration.findUnique({
      where: {
        id,
        userId: user.id
      }
    });

    if (!image) {
      return new NextResponse(JSON.stringify({ error: "Image not found or you don't have permission to delete it" }), { status: 404 });
    }

    // Delete the image
    await prisma.imageGeneration.delete({
      where: {
        id
      }
    });

    return new NextResponse(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    console.error('Error deleting image:', error);
    return new NextResponse(JSON.stringify({ error: "Failed to delete image" }), { status: 500 });
  }
}