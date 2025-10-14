import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

// POST /api/workshops/join - Join a workshop as a participant
export async function POST(req: Request) {
  try {
    // This endpoint can be used both by authenticated and unauthenticated users
    // Use optional chaining to handle unauthenticated users gracefully
    let userId = null;
    try {
      const { user } = await validateRequest();
      userId = user?.id;
    } catch (err) {
      // Silently continue for unauthenticated users
      console.log('Unauthenticated user trying to join workshop - continuing as guest');
    }
    
    const { workshopId, accessCode, name, email, preferredGroupId } = await req.json();

   

    if (!workshopId) {
      return NextResponse.json(
        { error: 'Workshop ID is required' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Participant name is required' },
        { status: 400 }
      );
    }

    // Verify the workshop exists
    const workshop = await prismadb.workshop.findUnique({
      where: {
        id: workshopId,
        isActive: true,
      },
      include: {
        groups: {
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
        },
      },
    });

    if (!workshop) {
      return NextResponse.json(
        { error: 'Workshop not found or inactive' },
        { status: 404 }
      );
    }

    // Check if access code is required and correct
    const needsAccessCode = !!workshop.accessCode;
    
    if (needsAccessCode) {
      // Normalize access codes for comparison (trim whitespace, ensure string)
      const normalizedWorkshopCode = String(workshop.accessCode).trim();
      const normalizedProvidedCode = accessCode ? String(accessCode).trim() : '';
      
     
      
      if (normalizedWorkshopCode !== normalizedProvidedCode) {
        return NextResponse.json(
          { error: 'Invalid access code' },
          { status: 401 }
        );
      } else {
        console.log('Access code validated successfully');
      }
    }

    // Determine which group to join based on join mode
    let targetGroupId = null;

    if (workshop.joinMode === 'CHOICE' && preferredGroupId) {
      // User chose a specific group - check if it exists and belongs to the workshop
      const chosenGroup = workshop.groups.find(group => group.id === preferredGroupId);

      if (!chosenGroup) {
        return NextResponse.json(
          { error: 'Selected group not found' },
          { status: 404 }
        );
      }
      
      // Check if the group is full
      if (chosenGroup._count.participants >= chosenGroup.maxSize) {
        return NextResponse.json(
          { error: 'The selected group is full' },
          { status: 400 }
        );
      }
      
      targetGroupId = preferredGroupId;
    } else if (workshop.joinMode === 'RANDOM') {
      // Filter groups that aren't full
      const availableGroups = workshop.groups.filter(
        (group) => group._count.participants < group.maxSize
      );
      
      if (availableGroups.length === 0) {
        return NextResponse.json(
          { error: 'All groups are full' },
          { status: 400 }
        );
      }
      
      // Randomly select a group
      const randomIndex = Math.floor(Math.random() * availableGroups.length);
      targetGroupId = availableGroups[randomIndex].id;
    } else if (workshop.joinMode === 'ASSIGNED') {
      // For ASSIGNED mode, the instructor should pre-assign participants
      return NextResponse.json(
        { error: 'This workshop requires instructor assignment. Please contact the organizer.' },
        { status: 403 }
      );
    }
    
    if (!targetGroupId) {
      return NextResponse.json(
        { error: 'No suitable group found' },
        { status: 400 }
      );
    }

    // Check if this name is already taken in any group
    const existingParticipant = await prismadb.participant.findFirst({
      where: {
        name,
        group: {
          workshopId,
        },
        isActive: true,
      },
    });

    if (existingParticipant) {
      return NextResponse.json(
        { error: 'This name is already taken in this workshop' },
        { status: 400 }
      );
    }

    // Create the participant
    const participant = await prismadb.participant.create({
      data: {
        name,
        email,
        userId: userId, // Use our obtained userId or null
        groupId: targetGroupId,
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
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Successfully joined the workshop', 
        participant
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error joining workshop:', error);
    return NextResponse.json(
      { error: 'Error joining workshop' },
      { status: 500 }
    );
  }
}

// GET /api/workshops/join - Check if a workshop is joinable and what options are available
export async function GET(req: Request) {
  try {
    // Get the current user (optional)
    let userId = null;
    try {
      const { user } = await validateRequest();
      userId = user?.id;
    } catch (err) {
      // Silently continue for unauthenticated users
      console.log('Unauthenticated user checking workshop - continuing as guest');
    }
    
    const url = new URL(req.url);
    const workshopId = url.searchParams.get('workshopId');
    const accessCode = url.searchParams.get('accessCode');

    

    if (!workshopId) {
      return NextResponse.json(
        { error: 'Workshop ID is required' },
        { status: 400 }
      );
    }

    // Verify the workshop exists
    const workshop = await prismadb.workshop.findUnique({
      where: {
        id: workshopId,
        isActive: true,
      },
    });

    if (!workshop) {
      return NextResponse.json(
        { error: 'Workshop not found or inactive' },
        { status: 404 }
      );
    }

    // Check if access code is required and correct (if provided)
    const needsAccessCode = !!workshop.accessCode;
    
    // Normalize access codes for comparison (trim whitespace, ensure string)
    const normalizedWorkshopCode = workshop.accessCode ? String(workshop.accessCode).trim() : '';
    const normalizedProvidedCode = accessCode ? String(accessCode).trim() : '';
    const isAccessCodeValid = needsAccessCode ? 
      (normalizedWorkshopCode === normalizedProvidedCode) : true;
    
   
    
    // If access code is required but not provided or is invalid, don't show details
    if (needsAccessCode && !isAccessCodeValid) {
      console.log('Access code required but not provided or invalid');
      return NextResponse.json({
        id: workshop.id,
        name: workshop.name,
        description: workshop.description,
        joinMode: workshop.joinMode,
        canJoin: false,
        needsAccessCode: true,
        message: 'This workshop requires an access code',
      });
    }

    // Get workshop details including groups
    interface WorkshopDetails {
      id: string;
      name: string;
      description: string | null;
      joinMode: string;
      isActive: boolean;
      groups?: Array<{
        id: string;
        name: string;
        color: string;
        participantCount: number;
        maxSize: number;
      }>;
    }

    const workshopDetails: WorkshopDetails = {
      id: workshop.id,
      name: workshop.name,
      description: workshop.description,
      joinMode: workshop.joinMode,
      isActive: workshop.isActive,
    };

    // If the join mode is CHOICE, include group options
    if (workshop.joinMode === 'CHOICE') {
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
      });

      workshopDetails.groups = groups.map((group) => ({
        id: group.id,
        name: group.name,
        color: group.color,
        participantCount: group._count.participants,
        maxSize: group.maxSize,
      }));
    }

    console.log('Returning workshop details with access:',
      { 
        id: workshop.id, 
        canJoin: true, 
        needsAccessCode,
        accessValid: isAccessCodeValid 
      }
    );

    return NextResponse.json({
      id: workshop.id,
      name: workshop.name,
      description: workshop.description,
      joinMode: workshop.joinMode,
      canJoin: true,
      needsAccessCode,
      groups: workshopDetails.groups,
    });
  } catch (error) {
    console.error('Error checking workshop join status:', error);
    return NextResponse.json(
      { error: 'Error checking workshop join status' },
      { status: 500 }
    );
  }
} 