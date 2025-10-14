// app/api/tools/delete/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: 'Link ID is required' },
        { status: 400 }
      );
    }

    // Check if the link exists
    const link = await prisma.shortLink.findUnique({
      where: {
        id,
      },
    });

    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

    // Delete the link (this will cascade delete click events due to our schema)
    await prisma.shortLink.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Link deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting link:', error);
    
    return NextResponse.json(
      { error: 'Failed to delete link' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}