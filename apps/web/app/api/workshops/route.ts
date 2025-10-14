import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

// GET /api/workshops - List all workshops for the current user
export async function GET() {
  try {
    const { user } = await validateRequest();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    
    // Get workshops created by this user
    const workshops = await prismadb.workshop.findMany({
      where: {
        createdById: userId,
        isActive: true,
      },
      include: {
        groups: {
          include: {
            _count: {
              select: {
                participants: {
                  where: { isActive: true }
                }
              }
            }
          }
        },
        _count: {
          select: {
            tasks: {
              where: { isActive: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format the response to include participant counts
    const formattedWorkshops = workshops.map(workshop => ({
      id: workshop.id,
      name: workshop.name,
      description: workshop.description,
      joinMode: workshop.joinMode,
      accessCode: workshop.accessCode,
      createdAt: workshop.createdAt,
      totalParticipants: workshop.totalParticipants,
      groupCount: workshop.groups.length,
      taskCount: workshop._count.tasks,
      groups: workshop.groups.map(group => ({
        id: group.id,
        name: group.name,
        color: group.color,
        maxSize: group.maxSize,
        participantCount: group._count.participants
      }))
    }));

    return NextResponse.json({ workshops: formattedWorkshops });
  } catch (error) {
    console.error('Error fetching workshops:', error);
    return NextResponse.json(
      { error: 'Error fetching workshops' },
      { status: 500 }
    );
  }
}

// POST /api/workshops - Create a new workshop
export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    const { 
      name, 
      description, 
      totalParticipants, 
      joinMode = 'ASSIGNED', 
      accessCode 
    } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Workshop name is required' },
        { status: 400 }
      );
    }

    // Validate join mode
    const validJoinModes = ['ASSIGNED', 'CHOICE', 'RANDOM'];
    if (!validJoinModes.includes(joinMode)) {
      return NextResponse.json(
        { error: 'Invalid join mode. Must be one of: ASSIGNED, CHOICE, RANDOM' },
        { status: 400 }
      );
    }

    // Create the workshop
    const workshop = await prismadb.workshop.create({
      data: {
        name,
        description,
        totalParticipants: totalParticipants || 0,
        joinMode: joinMode as any, // Cast to any to handle string to enum conversion
        accessCode,
        createdById: userId,
      },
    });

    return NextResponse.json({ workshop }, { status: 201 });
  } catch (error) {
    console.error('Error creating workshop:', error);
    return NextResponse.json(
      { error: 'Error creating workshop' },
      { status: 500 }
    );
  }
} 