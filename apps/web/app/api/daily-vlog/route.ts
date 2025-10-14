import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import prismadb from '@/lib/prismadb';
import { startOfDay, endOfDay, format } from 'date-fns';

export async function GET(req: Request) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const dateParam = searchParams.get('date');
    
    let dateFilter = {};
    
    if (dateParam) {
      const date = new Date(dateParam);
      dateFilter = {
        date: {
          gte: startOfDay(date),
          lte: endOfDay(date),
        },
      };
    }

    const [vlogs, total] = await Promise.all([
      prismadb.dailyVlog.findMany({
        where: {
          userId: user.id,
          ...dateFilter,
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prismadb.dailyVlog.count({
        where: {
          userId: user.id,
          ...dateFilter,
        },
      }),
    ]);

    return NextResponse.json({
      vlogs,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching daily vlogs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { transcription, content, isPublic = false, reminderEnabled = false, date, enhanced = false } = await req.json();

    if (!transcription || !content) {
      return NextResponse.json(
        { error: 'Transcription and content are required' },
        { status: 400 }
      );
    }

    // Use provided date or default to today
    const entryDate = date ? new Date(date) : new Date();
    
    // Check if a vlog already exists for the specified date
    const existingVlog = await prismadb.dailyVlog.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: startOfDay(entryDate),
        },
      },
    });

    if (existingVlog) {
      // Update existing vlog
      const updatedVlog = await prismadb.dailyVlog.update({
        where: { id: existingVlog.id },
        data: {
          transcription,
          content,
          isPublic,
          reminderEnabled,
          enhanced,
          updatedAt: new Date(),
        },
      });
      
      return NextResponse.json(updatedVlog);
    } else {
      // Create new vlog
      const newVlog = await prismadb.dailyVlog.create({
        data: {
          userId: user.id,
          date: startOfDay(entryDate),
          transcription,
          content,
          isPublic,
          reminderEnabled,
          enhanced,
        },
      });
      
      return NextResponse.json(newVlog);
    }
  } catch (error) {
    console.error('Error creating/updating daily vlog:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 