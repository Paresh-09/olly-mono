import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

// GET /api/workshops/[id]/tasks - Get all tasks for a workshop
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Get the current user (optional)
    let userId = null;
    try {
      const { user } = await validateRequest();
      userId = user?.id;
    } catch (err) {
      console.log('Unauthenticated user accessing tasks list');
    }

    const { id: workshopId } = params;
    const url = new URL(req.url);
    const accessCode = url.searchParams.get('accessCode');

    if (!workshopId) {
      return NextResponse.json(
        { error: 'Workshop ID is required' },
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

    // Fetch tasks for the workshop
    const tasks = await prismadb.workshopTask.findMany({
      where: {
        workshopId,
        isActive: true,
      },
      orderBy: {
        order: 'asc',
      },
      select: {
        id: true,
        title: true,
        description: true,
        durationMinutes: true,
        order: true,
        startTime: true,
        endTime: true,
      },
    });

    return NextResponse.json({
      tasks
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workshop tasks' },
      { status: 500 }
    );
  }
}

// POST /api/workshops/[id]/tasks - Create a new task
export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Only authenticated users should be able to create tasks
    const { user } = await validateRequest();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: workshopId } = params;
    const url = new URL(req.url);
    const accessCode = url.searchParams.get('accessCode');

    if (!workshopId) {
      return NextResponse.json(
        { error: 'Workshop ID is required' },
        { status: 400 }
      );
    }

    // Verify the workshop exists and the user owns it
    const workshop = await prismadb.workshop.findUnique({
      where: {
        id: workshopId,
        isActive: true,
        createdById: user.id, // Ensure the user is the workshop creator
      },
      select: {
        id: true,
        accessCode: true,
      },
    });

    if (!workshop) {
      return NextResponse.json(
        { error: 'Workshop not found or you do not have permission' },
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

    // Get the task data from the request
    const { title, description, durationMinutes } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Task title is required' },
        { status: 400 }
      );
    }

    // Count existing tasks to set order
    const tasksCount = await prismadb.workshopTask.count({
      where: {
        workshopId,
      },
    });

    // Create the task
    const task = await prismadb.workshopTask.create({
      data: {
        title,
        description,
        durationMinutes,
        order: tasksCount, // Set order to be the last task
        workshopId,
        isActive: true,
      },
    });

    return NextResponse.json({
      task
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
} 