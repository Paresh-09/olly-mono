import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

interface Params {
  id: string;
  groupId: string;
}

// GET /api/workshops/[id]/groups/[groupId]/participants - List all participants in a group
export async function GET(req: Request, props: { params: Promise<Params> }) {
  const params = await props.params;
  try {
    const { user } = await validateRequest();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: workshopId, groupId } = params;
    if (!workshopId || !groupId) {
      return NextResponse.json(
        { error: 'Workshop ID and Group ID are required' },
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

    // Get all participants in the group
    const participants = await prismadb.participant.findMany({
      where: {
        groupId,
        isActive: true,
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });

    return NextResponse.json({ participants });
  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json(
      { error: 'Error fetching participants' },
      { status: 500 }
    );
  }
}

// POST /api/workshops/[id]/groups/[groupId]/participants - Add a participant to a group
export async function POST(req: Request, props: { params: Promise<Params> }) {
  const params = await props.params;
  try {
    const { user } = await validateRequest();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: workshopId, groupId } = params;
    if (!workshopId || !groupId) {
      return NextResponse.json(
        { error: 'Workshop ID and Group ID are required' },
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

    const { name, email, userId } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Participant name is required' },
        { status: 400 }
      );
    }

    // Check if group is already full
    const currentParticipantCount = await prismadb.participant.count({
      where: {
        groupId,
        isActive: true,
      },
    });

    if (currentParticipantCount >= group.maxSize) {
      return NextResponse.json(
        { error: 'Group is already full' },
        { status: 400 }
      );
    }

    // Create new participant
    const participant = await prismadb.participant.create({
      data: {
        name,
        email,
        userId,
        groupId,
        isActive: true,
      },
    });

    return NextResponse.json({ participant }, { status: 201 });
  } catch (error) {
    console.error('Error adding participant:', error);
    return NextResponse.json(
      { error: 'Error adding participant' },
      { status: 500 }
    );
  }
}

// DELETE /api/workshops/[id]/groups/[groupId]/participants - Remove a participant
export async function DELETE(req: Request, props: { params: Promise<Params> }) {
  const params = await props.params;
  try {
    const { user } = await validateRequest();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: workshopId, groupId } = params;
    if (!workshopId || !groupId) {
      return NextResponse.json(
        { error: 'Workshop ID and Group ID are required' },
        { status: 400 }
      );
    }

    // Get the participantId from the query params
    const url = new URL(req.url);
    const participantId = url.searchParams.get('participantId');
    if (!participantId) {
      return NextResponse.json(
        { error: 'Participant ID is required' },
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

    // Delete participant
    await prismadb.participant.delete({
      where: {
        id: participantId,
        groupId,
      },
    });

    return NextResponse.json(
      { message: 'Participant removed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing participant:', error);
    return NextResponse.json(
      { error: 'Error removing participant' },
      { status: 500 }
    );
  }
} 