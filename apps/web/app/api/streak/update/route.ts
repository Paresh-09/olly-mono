// app/api/streak/update/route.ts
import prismadb from '@/lib/prismadb';
import { NextResponse } from 'next/server';

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

export async function POST(request: Request) {
  const extensionId = request.headers.get("X-Extension-ID");

  if (extensionId !== process.env.EXTENSION_ID) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  if (request.method === "OPTIONS") {
    return OPTIONS(request);
  }

  try {
    const { userId, streak } = await request.json();

    if (!userId || streak === undefined) {
      return new NextResponse(
        JSON.stringify({ 
          success: false,
          error: 'User ID and streak are required' 
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const streakNumber = parseInt(streak, 10);
    if (isNaN(streakNumber)) {
      return new NextResponse(
        JSON.stringify({ 
          success: false,
          error: 'Streak must be a valid number' 
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // First check if the user exists
    const user = await prismadb.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ 
          success: false,
          error: 'User not found' 
        }),
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Get or create user streak record
    let userStreak = await prismadb.userStreak.findUnique({
      where: { userId }
    });

    const now = new Date();

    if (!userStreak) {
      // Create new streak record for first-time user
      userStreak = await prismadb.userStreak.create({
        data: {
          userId,
          currentStreak: streakNumber,
          maxStreak: streakNumber,
          lastActivity: now
        }
      });
    } else {
      // Update maxStreak only if the new streak is greater
      const newMaxStreak = streakNumber > userStreak.maxStreak ? streakNumber : userStreak.maxStreak;

      // Update the streak record
      userStreak = await prismadb.userStreak.update({
        where: { userId },
        data: {
          currentStreak: streakNumber,
          maxStreak: newMaxStreak,
          lastActivity: now
        }
      });
    }



    return new NextResponse(
      JSON.stringify({ 
        success: true,
        data: {
          streak: {
            currentStreak: userStreak.currentStreak,
            maxStreak: userStreak.maxStreak,
            lastActivity: userStreak.lastActivity
          }
        }
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error: any) {
    console.error('Error updating user streak:', error);
    return new NextResponse(
      JSON.stringify({ 
        success: false,
        error: 'Internal Server Error' 
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
