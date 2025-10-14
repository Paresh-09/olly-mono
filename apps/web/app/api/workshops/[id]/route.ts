import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

// GET /api/workshops/[id] - Get a single workshop with detailed information
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
      include: {
        groups: {
          include: {
            participants: {
              where: {
                isActive: true,
              },
              orderBy: {
                name: 'asc',
              },
            },
            completedTasks: {
              include: {
                task: true,
                participant: true,
              },
            },
            _count: {
              select: {
                participants: {
                  where: {
                    isActive: true,
                  },
                },
                completedTasks: true,
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
        },
        tasks: {
          where: {
            isActive: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!workshop) {
      return NextResponse.json(
        { error: 'Workshop not found or access denied' },
        { status: 404 }
      );
    }

    // Format the response with detailed information
    const formattedWorkshop = {
      id: workshop.id,
      name: workshop.name,
      description: workshop.description,
      joinMode: workshop.joinMode,
      accessCode: workshop.accessCode,
      totalParticipants: workshop.totalParticipants,
      createdAt: workshop.createdAt,
      updatedAt: workshop.updatedAt,
      groups: workshop.groups.map(group => ({
        id: group.id,
        name: group.name,
        color: group.color,
        maxSize: group.maxSize,
        participantCount: group._count.participants,
        completedTaskCount: group._count.completedTasks,
        participants: group.participants.map(participant => ({
          id: participant.id,
          name: participant.name,
          email: participant.email,
          userId: participant.userId,
          joinedAt: participant.joinedAt,
        })),
        completedTasks: group.completedTasks.map(completion => ({
          id: completion.id,
          taskId: completion.taskId,
          taskTitle: completion.task.title,
          participantId: completion.participantId,
          participantName: completion.participant?.name || null,
          completedAt: completion.completedAt,
          notes: completion.notes,
        })),
      })),
      tasks: workshop.tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        durationMinutes: task.durationMinutes,
        startTime: task.startTime,
        endTime: task.endTime,
        order: task.order,
        isActive: task.isActive,
      })),
      // Calculate workshop statistics
      statistics: {
        totalGroups: workshop.groups.length,
        totalTasks: workshop.tasks.length,
        totalParticipants: workshop.groups.reduce(
          (acc, group) => acc + group._count.participants,
          0
        ),
        taskCompletionRate: workshop.tasks.length > 0
          ? (workshop.groups.reduce(
              (acc, group) => acc + group._count.completedTasks,
              0
            ) / (workshop.tasks.length * workshop.groups.length)) * 100
          : 0,
      },
    };

    return NextResponse.json({ workshop: formattedWorkshop });
  } catch (error) {
    console.error('Error fetching workshop details:', error);
    return NextResponse.json(
      { error: 'Error fetching workshop details' },
      { status: 500 }
    );
  }
}

// PATCH /api/workshops/[id] - Update a workshop
export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
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

    const { 
      name, 
      description, 
      totalParticipants, 
      joinMode, 
      accessCode,
      isActive 
    } = await req.json();

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

    // Validate join mode if provided
    if (joinMode) {
      const validJoinModes = ['ASSIGNED', 'CHOICE', 'RANDOM'];
      if (!validJoinModes.includes(joinMode)) {
        return NextResponse.json(
          { error: 'Invalid join mode. Must be one of: ASSIGNED, CHOICE, RANDOM' },
          { status: 400 }
        );
      }
    }

    // Update the workshop
    const updatedWorkshop = await prismadb.workshop.update({
      where: {
        id: workshopId,
      },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(totalParticipants !== undefined && { totalParticipants }),
        ...(joinMode && { joinMode: joinMode as any }),
        ...(accessCode !== undefined && { accessCode }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ workshop: updatedWorkshop });
  } catch (error) {
    console.error('Error updating workshop:', error);
    return NextResponse.json(
      { error: 'Error updating workshop' },
      { status: 500 }
    );
  }
}

// DELETE /api/workshops/[id] - Delete a workshop
export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
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

    // Delete the workshop (this will cascade to delete groups, participants and task completions)
    await prismadb.workshop.delete({
      where: {
        id: workshopId,
      },
    });

    return NextResponse.json(
      { message: 'Workshop deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting workshop:', error);
    return NextResponse.json(
      { error: 'Error deleting workshop' },
      { status: 500 }
    );
  }
} 