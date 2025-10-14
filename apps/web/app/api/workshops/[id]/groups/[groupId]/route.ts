import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

// GET /api/workshops/[id]/groups/[groupId]
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string; groupId: string }> }
) {
  const params = await props.params;
  try {
    // Get the current user (optional)
    let userId = null;
    try {
      const { user } = await validateRequest();
      userId = user?.id;
    } catch (err) {
      console.log('Unauthenticated user accessing group details');
    }

    const { id: workshopId, groupId } = params;
    const url = new URL(req.url);
    const accessCode = url.searchParams.get('accessCode');

    if (!workshopId || !groupId) {
      return NextResponse.json(
        { error: 'Workshop ID and Group ID are required' },
        { status: 400 }
      );
    }



    // First, verify workshop exists and access code is valid
    const workshop = await prismadb.workshop.findUnique({
      where: {
        id: workshopId,
        isActive: true,
      },
      select: {
        id: true,
        accessCode: true,
        groups: {
          where: {
            id: groupId,
          },
          include: {
            participants: {
              where: {
                isActive: true,
              },
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            completedTasks: {
              include: {
                task: true,
              },
            },
          },
        },
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

    // Check if group exists
    if (!workshop.groups || workshop.groups.length === 0) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    const group = workshop.groups[0];

    // Return the group data
    return NextResponse.json({
      group: {
        id: group.id,
        name: group.name,
        color: group.color,
        maxSize: group.maxSize || 0,
        participants: group.participants,
        completedTasks: group.completedTasks
      }
    });
  } catch (error) {
    console.error('Error fetching group details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group details' },
      { status: 500 }
    );
  }
} 