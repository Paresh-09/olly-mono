import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

// GET /api/workshops/[id]/participants/[participantId]
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string; participantId: string }> }
) {
  const params = await props.params;
  try {
    // Get the current user (optional)
    let userId = null;
    try {
      const { user } = await validateRequest();
      userId = user?.id;
    } catch (err) {
      console.log('Unauthenticated user accessing participant details');
    }

    const { id: workshopId, participantId } = params;
    const url = new URL(req.url);
    const accessCode = url.searchParams.get('accessCode');

    if (!workshopId || !participantId) {
      return NextResponse.json(
        { error: 'Workshop ID and Participant ID are required' },
        { status: 400 }
      );
    }


    // First check if the workshop exists and if access code is valid
    const workshop = await prismadb.workshop.findUnique({
      where: {
        id: workshopId,
        isActive: true,
      },
      select: {
        id: true,
        accessCode: true,
      },
    });

    if (!workshop) {
      return NextResponse.json(
        { error: 'Workshop not found or inactive' },
        { status: 404 }
      );
    }

    // Check if access code is required and valid
    if (workshop.accessCode) {
      const normalizedWorkshopCode = String(workshop.accessCode).trim();
      const normalizedProvidedCode = accessCode ? String(accessCode).trim() : '';
      
      if (normalizedWorkshopCode !== normalizedProvidedCode) {
        return NextResponse.json(
          { error: 'Invalid access code' },
          { status: 401 }
        );
      }
    }

    // Fetch participant details
    const participant = await prismadb.participant.findUnique({
      where: {
        id: participantId,
        isActive: true,
        group: {
          workshop: {
            id: workshopId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        joinedAt: true,
        userId: true,
        group: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      participant
    });
  } catch (error) {
    console.error('Error fetching participant details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participant details' },
      { status: 500 }
    );
  }
} 