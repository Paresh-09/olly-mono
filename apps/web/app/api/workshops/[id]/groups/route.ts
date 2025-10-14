import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

// GET /api/workshops/[id]/groups - List all groups in a workshop
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Get the current user (optional)
    let userId = null;
    try {
      const { user } = await validateRequest();
      userId = user?.id;
    } catch (err) {
      console.log('Unauthenticated user accessing groups list');
    }

    const { id: workshopId } = params;
    const url = new URL(req.url);
    const accessCode = url.searchParams.get('accessCode');

    if (!workshopId) {
      return NextResponse.json({ error: 'Workshop ID is required' }, { status: 400 });
    }

    // First check if the workshop exists
    const workshop = await prismadb.workshop.findUnique({
      where: {
        id: workshopId,
        isActive: true,
      },
      select: {
        id: true,
        createdById: true,
        accessCode: true,
      },
    });

    if (!workshop) {
      return NextResponse.json(
        { error: 'Workshop not found or inactive' },
        { status: 404 }
      );
    }

    // If user is not the creator, we need to validate the access code
    if (userId !== workshop.createdById) {
      // Check if access code is required and valid
      if (workshop.accessCode) {
        const normalizedWorkshopCode = String(workshop.accessCode).trim();
        const normalizedProvidedCode = accessCode ? String(accessCode).trim() : '';
        
        console.log('Groups - Access code check:', {
          hasCode: !!workshop.accessCode,
          providedCode: accessCode ? '✓' : '✗',
          isValid: normalizedWorkshopCode === normalizedProvidedCode
        });
        
        if (normalizedWorkshopCode !== normalizedProvidedCode) {
          return NextResponse.json(
            { error: 'Invalid access code' },
            { status: 401 }
          );
        }
      }
    }

    // Get the groups for this workshop
    const groups = await prismadb.group.findMany({
      where: {
        workshopId,
      },
      include: {
        _count: {
          select: {
            participants: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Format the response
    const formattedGroups = groups.map((group) => ({
      id: group.id,
      name: group.name,
      color: group.color,
      participantCount: group._count.participants,
      maxSize: group.maxSize,
    }));

    return NextResponse.json({ groups: formattedGroups });
  } catch (error) {
    console.error('Error fetching workshop groups:', error);
    return NextResponse.json(
      { error: 'Error fetching workshop groups' },
      { status: 500 }
    );
  }
}

// POST /api/workshops/[id]/groups - Create a new group in a workshop
export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Only authenticated users should be able to create groups
    const { user } = await validateRequest();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: workshopId } = params;
    const url = new URL(req.url);
    const accessCode = url.searchParams.get('accessCode');

    if (!workshopId) {
      return NextResponse.json({ error: 'Workshop ID is required' }, { status: 400 });
    }

    const { name, color, maxSize } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
    }

    // Verify the workshop exists and belongs to the user or has valid access code
    const workshop = await prismadb.workshop.findUnique({
      where: {
        id: workshopId,
        isActive: true,
      },
      select: {
        id: true,
        createdById: true,
        accessCode: true,
      },
    });

    if (!workshop) {
      return NextResponse.json(
        { error: 'Workshop not found or inactive' },
        { status: 404 }
      );
    }

    // If user is not the creator, check the access code
    if (user.id !== workshop.createdById) {
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
      } else {
        // No access code but user is not creator - deny access
        return NextResponse.json(
          { error: 'You do not have permission to create groups in this workshop' },
          { status: 403 }
        );
      }
    }

    // Check if a group with the same name already exists
    const existingGroup = await prismadb.group.findFirst({
      where: {
        workshopId,
        name,
      },
    });

    if (existingGroup) {
      return NextResponse.json(
        { error: 'A group with this name already exists in this workshop' },
        { status: 400 }
      );
    }

    // Create the new group
    const group = await prismadb.group.create({
      data: {
        name,
        color: color || '#3B82F6', // Default to blue if no color provided
        maxSize: maxSize || 8, // Default max size
        workshopId,
      },
    });

    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    console.error('Error creating workshop group:', error);
    return NextResponse.json(
      { error: 'Error creating workshop group' },
      { status: 500 }
    );
  }
} 