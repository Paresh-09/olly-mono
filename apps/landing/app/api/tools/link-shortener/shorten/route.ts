// app/api/tools/shorten/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }


    try {
      new URL(url);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid URL format. Please include http:// or https://' },
        { status: 400 }
      );
    }


    const shortCode = nanoid(6); 

    const newLink = await prisma.shortLink.create({
      data: {
        shortCode,
        originalUrl: url,
      },
    });

   
    return NextResponse.json({
      id: newLink.id,
      shortCode: newLink.shortCode,
      originalUrl: newLink.originalUrl,
      createdAt: newLink.createdAt.toISOString(),
      clicks: newLink.clicks,
      clickData: [] 
    });
  } catch (error: any) {
    console.error('Error creating short link:', error);
    
    return NextResponse.json(
      { error: 'Failed to create short link' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}