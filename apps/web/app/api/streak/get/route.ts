// app/api/streak/get/route.ts
import prismadb from '@/lib/prismadb';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user streak record
    const userStreak = await prismadb.userStreak.findUnique({
      where: { userId }
    });

    if (!userStreak) {
      // Return default values if no streak record exists
      return NextResponse.json({
        success: true,
        streak: {
          currentStreak: 0,
          maxStreak: 0,
          lastActivity: null
        }
      });
    }

    return NextResponse.json({
      success: true,
      streak: {
        currentStreak: userStreak.currentStreak,
        maxStreak: userStreak.maxStreak,
        lastActivity: userStreak.lastActivity
      }
    });

  } catch (error) {
    console.error('Error fetching user streak:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
