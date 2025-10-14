import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

// GET /api/workshops/[id]/tasks/completions - Get all completed tasks for a workshop
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Get the current user (optional)
    let userId = null;
    try {
      const { user } = await validateRequest();
      userId = user?.id;
    } catch (err) {
      console.log('Unauthenticated user fetching task completions');
    }

    const { id: workshopId } = params;
    const url = new URL(req.url);
    const accessCode = url.searchParams.get('accessCode');
    const groupId = url.searchParams.get('groupId');
    
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

    // Build query to fetch completed tasks
    const where: any = { 
      task: {
        workshopId
      }
    };

    // If groupId is provided, filter by that group
    if (groupId) {
      where.groupId = groupId;
    }

    // Get all completed tasks for this workshop, optionally filtered by group
    const completedTasks = await prismadb.completedTask.findMany({
      where,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            description: true,
            order: true,
          }
        },
        group: {
          select: {
            id: true,
            name: true,
            color: true,
          }
        },
        participant: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      }
    });

    return NextResponse.json({
      completedTasks
    });
  } catch (error) {
    console.error('Error fetching completed tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch completed tasks' },
      { status: 500 }
    );
  }
} 