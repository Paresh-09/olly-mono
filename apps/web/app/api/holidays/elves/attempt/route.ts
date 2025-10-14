// app/api/holidays/elves/attempt/route.ts
import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import { headers } from 'next/headers';
import prismadb from '@/lib/prismadb';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, level, timestamp } = body;

    // Validate request
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const { user } = await validateRequest();
    const userId = user?.id;
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';

    // Get or create game session
    try {
      let gameSession = await prismadb.elfGameAttempt.findFirst({
        where: {
          OR: [
            { 
              userId: userId,
              sessionId: sessionId 
            },
            {
              ipAddress: ip,
              sessionId: sessionId
            }
          ]
        }
      });

      if (!gameSession) {
        // Create new session
        gameSession = await prismadb.elfGameAttempt.create({
          data: {
            sessionId,
            userId: userId || null,
            ipAddress: !userId ? ip : null,
            attempts: 0,
            catches: 0,
          }
        });
      }

      // Check attempts limit
      if (gameSession.attempts >= 6) {
        return NextResponse.json({ 
          success: false,
          error: 'Maximum attempts reached',
          attemptsRemaining: 0,
          catches: gameSession.catches
        });
      }

      // Update attempt count
      const updatedSession = await prismadb.elfGameAttempt.update({
        where: { id: gameSession.id },
        data: {
          attempts: { increment: 1 },
          lastAttemptAt: new Date()
        }
      });

      return NextResponse.json({ 
        success: true,
        attemptsRemaining: Math.max(0, 6 - updatedSession.attempts),
        catches: updatedSession.catches
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ 
        success: false,
        error: 'Database error' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Game attempt error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to process attempt' 
    }, { status: 500 });
  }
}