// app/api/tools/redirect/[shortCode]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, props: { params: Promise<{ shortCode: string }> }) {
  const params = await props.params;
  try {
    const shortCode = params.shortCode;

    if (!shortCode) {
      return NextResponse.json(
        { error: 'Short code is required' },
        { status: 400 }
      );
    }

 

    // Find the link
    const link = await prisma.shortLink.findUnique({
      where: {
        shortCode,
      },
    });

    if (!link) {
  
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

 

    return NextResponse.json({
      originalUrl: link.originalUrl,
    });
  } catch (error) {
    console.error('Error looking up short link:', error);
    
    return NextResponse.json(
      { error: 'Failed to process redirect' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}