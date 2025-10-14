// app/api/images/gallery/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prismadb";
import { startOfDay, startOfWeek, startOfMonth } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    // Validate user authentication
    const { user } = await validateRequest();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get URL parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '12');
    const style = url.searchParams.get('style');
    const sortOrder = url.searchParams.get('sortOrder') || 'newest';
    const timeframe = url.searchParams.get('timeframe');
    
    // Build query
    const where: any = { 
      userId: user.id,
    };
    
    // Add style filter if provided
    if (style && style !== 'all') {
      where.style = style;
    }
    
    // Add timeframe filter if provided
    if (timeframe) {
      const now = new Date();
      
      switch (timeframe) {
        case 'today':
          where.createdAt = { gte: startOfDay(now) };
          break;
        case 'week':
          where.createdAt = { gte: startOfWeek(now) };
          break;
        case 'month':
          where.createdAt = { gte: startOfMonth(now) };
          break;
      }
    }

    // Get total count
    const totalCount = await prisma.imageGeneration.count({ where });
    
    // Get images with pagination
    const images = await prisma.imageGeneration.findMany({
      where,
      orderBy: { 
        createdAt: sortOrder === 'oldest' ? 'asc' : 'desc' 
      },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        prompt: true,
        imageUrl: true,
        referenceImageUrl: true,
        style: true,
        customStyle: true,
        quality: true,
        size: true,
        createdAt: true,
      }
    });

    // Get available styles with counts for this user
    const styleStats = await prisma.imageGeneration.groupBy({
      by: ['style'],
      where: { userId: user.id },
      _count: true
    });

    const styles = styleStats.map(item => ({
      name: item.style,
      count: item._count
    }));

    return NextResponse.json({
      images,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      styles
    });
  } catch (error: any) {
    console.error('Error fetching images:', error);
    return new NextResponse(JSON.stringify({ error: "Failed to fetch images" }), { status: 500 });
  }
}