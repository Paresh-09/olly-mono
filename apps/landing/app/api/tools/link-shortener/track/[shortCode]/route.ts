// app/api/tools/track/[shortCode]/route.ts
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

    // Extract request information
    const headers = new Headers(request.headers);
    const userAgent = headers.get('user-agent') || undefined;
    const referer = headers.get('referer') || undefined;
    const ip = headers.get('x-forwarded-for') || 
               headers.get('x-real-ip') || 
               '0.0.0.0';

    // Record the click event
    await prisma.clickEvent.create({
      data: {
        shortLinkId: link.id,
        ipAddress: ip,
        userAgent,
        referrer: referer,
      },
    });

    // Increment the click count
    await prisma.shortLink.update({
      where: {
        id: link.id,
      },
      data: {
        clicks: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      originalUrl: link.originalUrl,
    });
  } catch (error) {
    console.error('Error tracking click:', error);
    
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}