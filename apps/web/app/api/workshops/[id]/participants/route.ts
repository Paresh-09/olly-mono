import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

// GET /api/workshops/[id]/participants - List all participants across all groups in a workshop
export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { user } = await validateRequest();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: workshopId } = params;
    if (!workshopId) {
      return NextResponse.json(
        { error: 'Workshop ID is required' },
        { status: 400 }
      );
    }

    // Verify the workshop exists and belongs to the user
    const workshop = await prismadb.workshop.findFirst({
      where: {
        id: workshopId,
        createdById: user.id,
      },
    });

    if (!workshop) {
      return NextResponse.json(
        { error: 'Workshop not found or access denied' },
        { status: 404 }
      );
    }

    // Get all participants across all groups
    const participants = await prismadb.participant.findMany({
      where: {
        group: {
          workshopId,
        },
        isActive: true,
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: [
        {
          group: {
            name: 'asc',
          },
        },
        {
          name: 'asc',
        },
      ],
    });

    return NextResponse.json({ participants });
  } catch (error) {
    console.error('Error fetching workshop participants:', error);
    return NextResponse.json(
      { error: 'Error fetching workshop participants' },
      { status: 500 }
    );
  }
}

// POST /api/workshops/[id]/participants - Pre-assign a participant to a group
export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { user } = await validateRequest();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: workshopId } = params;
    if (!workshopId) {
      return NextResponse.json(
        { error: 'Workshop ID is required' },
        { status: 400 }
      );
    }

    const { name, email, groupId, userId } = await req.json();

    if (!name || !groupId) {
      return NextResponse.json(
        { error: 'Participant name and group ID are required' },
        { status: 400 }
      );
    }

    // Verify the workshop exists and belongs to the user
    const workshop = await prismadb.workshop.findFirst({
      where: {
        id: workshopId,
        createdById: user.id,
      },
    });

    if (!workshop) {
      return NextResponse.json(
        { error: 'Workshop not found or access denied' },
        { status: 404 }
      );
    }

    // Verify the group exists and belongs to the workshop
    const group = await prismadb.group.findFirst({
      where: {
        id: groupId,
        workshopId,
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Check if this name is already taken in any group
    const existingParticipant = await prismadb.participant.findFirst({
      where: {
        name,
        group: {
          workshopId,
        },
      },
    });

    if (existingParticipant) {
      return NextResponse.json(
        { error: 'This name is already taken in this workshop' },
        { status: 400 }
      );
    }

    // Check if the group is full
    const participantCount = await prismadb.participant.count({
      where: {
        groupId,
        isActive: true,
      },
    });

    if (participantCount >= group.maxSize) {
      return NextResponse.json(
        { error: 'The selected group is full' },
        { status: 400 }
      );
    }

    // Create the participant
    const participant = await prismadb.participant.create({
      data: {
        name,
        email,
        userId,
        groupId,
        isActive: true,
      },
      include: {
        group: {
          select: {
            name: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json(
      { participant },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error pre-assigning participant:', error);
    return NextResponse.json(
      { error: 'Error pre-assigning participant' },
      { status: 500 }
    );
  }
}

// PUT /api/workshops/[id]/participants/reassign - Move a participant to a different group
export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { user } = await validateRequest();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: workshopId } = params;
    if (!workshopId) {
      return NextResponse.json(
        { error: 'Workshop ID is required' },
        { status: 400 }
      );
    }

    const { participantId, newGroupId } = await req.json();

    if (!participantId || !newGroupId) {
      return NextResponse.json(
        { error: 'Participant ID and new group ID are required' },
        { status: 400 }
      );
    }

    // Verify the workshop exists and belongs to the user
    const workshop = await prismadb.workshop.findFirst({
      where: {
        id: workshopId,
        createdById: user.id,
      },
    });

    if (!workshop) {
      return NextResponse.json(
        { error: 'Workshop not found or access denied' },
        { status: 404 }
      );
    }

    // Verify the participant exists and belongs to a group in this workshop
    const participant = await prismadb.participant.findFirst({
      where: {
        id: participantId,
        group: {
          workshopId,
        },
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found in this workshop' },
        { status: 404 }
      );
    }

    // Verify the new group exists and belongs to the workshop
    const newGroup = await prismadb.group.findFirst({
      where: {
        id: newGroupId,
        workshopId,
      },
    });

    if (!newGroup) {
      return NextResponse.json(
        { error: 'New group not found in this workshop' },
        { status: 404 }
      );
    }

    // Check if the new group is full
    const participantCount = await prismadb.participant.count({
      where: {
        groupId: newGroupId,
        isActive: true,
      },
    });

    if (participantCount >= newGroup.maxSize) {
      return NextResponse.json(
        { error: 'The selected group is full' },
        { status: 400 }
      );
    }

    // Move the participant to the new group
    const updatedParticipant = await prismadb.participant.update({
      where: {
        id: participantId,
      },
      data: {
        groupId: newGroupId,
      },
      include: {
        group: {
          select: {
            name: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json({ participant: updatedParticipant });
  } catch (error) {
    console.error('Error reassigning participant:', error);
    return NextResponse.json(
      { error: 'Error reassigning participant' },
      { status: 500 }
    );
  }
} 