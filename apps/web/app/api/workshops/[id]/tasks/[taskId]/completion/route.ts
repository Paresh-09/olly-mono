import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

interface Params {
  id: string;
  taskId: string;
}

// POST /api/workshops/[id]/tasks/[taskId]/completion - Mark a task as completed
export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string; taskId: string }> }
) {
  const params = await props.params;
  try {
    // Get the current user (optional)
    let userId = null;
    try {
      const { user } = await validateRequest();
      userId = user?.id;
    } catch (err) {
      console.log('Unauthenticated user marking task completion');
    }

    const { id: workshopId, taskId } = params;
    const url = new URL(req.url);
    const accessCode = url.searchParams.get('accessCode');
    
    // Extract group ID from request body
    const { groupId, participantId } = await req.json();
    
    if (!workshopId || !taskId || !groupId) {
      return NextResponse.json(
        { error: 'Workshop ID, Task ID, and Group ID are required' },
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

    // Verify the task exists and belongs to the workshop
    const task = await prismadb.workshopTask.findUnique({
      where: {
        id: taskId,
        workshopId,
        isActive: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Verify the group exists and belongs to the workshop
    const group = await prismadb.group.findUnique({
      where: {
        id: groupId,
        workshopId,
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found or does not belong to this workshop' },
        { status: 404 }
      );
    }

    // Check if the task is already completed by this group
    const existing = await prismadb.completedTask.findUnique({
      where: {
        taskId_groupId: {
          taskId,
          groupId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        message: 'Task already marked as completed',
        completedTask: existing,
      });
    }

    // Create the completed task record
    const completedTask = await prismadb.completedTask.create({
      data: {
        taskId,
        groupId,
        participantId,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Task marked as completed',
      completedTask,
    });
  } catch (error) {
    console.error('Error marking task as completed:', error);
    return NextResponse.json(
      { error: 'Failed to mark task as completed' },
      { status: 500 }
    );
  }
}

// DELETE /api/workshops/[id]/tasks/[taskId]/completion/[groupId] - Remove completion status
export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string; taskId: string; groupId: string }> }
) {
  const params = await props.params;
  try {
    // Get the current user (optional)
    let userId = null;
    try {
      const { user } = await validateRequest();
      userId = user?.id;
    } catch (err) {
      console.log('Unauthenticated user removing task completion');
    }

    const { id: workshopId, taskId, groupId } = params;
    const url = new URL(req.url);
    const accessCode = url.searchParams.get('accessCode');
    
    if (!workshopId || !taskId || !groupId) {
      return NextResponse.json(
        { error: 'Workshop ID, Task ID, and Group ID are required' },
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

    // Delete the completed task record
    await prismadb.completedTask.delete({
      where: {
        taskId_groupId: {
          taskId,
          groupId,
        },
      },
    });

    return NextResponse.json({
      message: 'Task completion status removed',
    });
  } catch (error) {
    console.error('Error removing task completion:', error);
    return NextResponse.json(
      { error: 'Failed to remove task completion status' },
      { status: 500 }
    );
  }
}

// GET /api/workshops/[id]/tasks/[taskId]/completion - Get completion status of a task
export async function GET(req: Request, props: { params: Promise<Params> }) {
  const params = await props.params;
  try {
    const { user } = await validateRequest();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: workshopId, taskId } = params;
    if (!workshopId || !taskId) {
      return NextResponse.json(
        { error: 'Workshop ID and Task ID are required' },
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

    // Get completion records for this task, including group and participant info
    const completions = await prismadb.completedTask.findMany({
      where: {
        taskId,
        group: {
          workshopId,
        },
      },
      include: {
        group: {
          select: {
            name: true,
            color: true,
          },
        },
        participant: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        completedAt: 'asc',
      },
    });

    return NextResponse.json({ completions });
  } catch (error) {
    console.error('Error fetching task completions:', error);
    return NextResponse.json(
      { error: 'Error fetching task completions' },
      { status: 500 }
    );
  }
} 