// app/api/tools/analytics/[shortCode]/route.ts
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

   
    const link = await prisma.shortLink.findUnique({
      where: {
        shortCode,
      },
      include: {
        clickEvents: true,
      },
    });

    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

  
    const clickData = generateClickDataForLastWeek(link.clickEvents);

    return NextResponse.json({
      id: link.id,
      shortCode: link.shortCode,
      originalUrl: link.originalUrl,
      createdAt: link.createdAt.toISOString(),
      clicks: link.clicks,
      clickData,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

function generateClickDataForLastWeek(clickEvents: any[]) {

  const clickData = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const dateStr = date.toISOString().split('T')[0]; 
    

    const clicksForDay = clickEvents.filter(event => {
      const eventDate = new Date(event.clickedAt);
      return eventDate.toISOString().split('T')[0] === dateStr;
    }).length;
    
    clickData.push({
      date: dateStr,
      clicks: clicksForDay,
    });
  }
  
  return clickData;
}