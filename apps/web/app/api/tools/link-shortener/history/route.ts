// app/api/tools/link-shortener/history/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Find all soft-deleted links
    const deletedLinks = await prisma.shortLink.findMany({
      where: {
        isDeleted: true
      },
      orderBy: {
        deletedAt: 'desc'
      },
      include: {
        clickEvents: true,
      }
    });

    // Format the response
    const formattedLinks = deletedLinks.map(link => {
      // Generate the last 7 days data for each link
      const clickData = generateClickDataForLastWeek(link.clickEvents);

      return {
        id: link.id,
        shortCode: link.shortCode,
        originalUrl: link.originalUrl,
        createdAt: link.createdAt.toISOString(),
        deletedAt: link.deletedAt?.toISOString(),
        clicks: link.clicks,
        clickData,
      };
    });

    return NextResponse.json(formattedLinks);
  } catch (error) {
    console.error('Error fetching deleted links:', error);

    return NextResponse.json(
      { error: 'Failed to fetch deleted links' },
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