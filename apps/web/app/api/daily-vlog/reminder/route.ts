import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { startOfDay, subDays } from 'date-fns';

// This would typically be called by a cron job
export async function GET(req: Request) {
  try {
    // Check for API key or other authorization
    const { searchParams } = new URL(req.url);
    const apiKey = searchParams.get('apiKey');
    
    if (apiKey !== process.env.CRON_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Find users who have reminder enabled but haven't created a vlog today
    const today = startOfDay(new Date());
    const yesterday = subDays(today, 1);
    
    // Get users who have reminder enabled
    const usersWithReminders = await prismadb.user.findMany({
      where: {
        dailyVlogs: {
          some: {
            reminderEnabled: true,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        dailyVlogs: {
          orderBy: {
            date: 'desc',
          },
          take: 1,
        },
      },
    });
    
    // Filter users who haven't created a vlog today
    const usersToRemind = usersWithReminders.filter(user => {
      // If no vlogs or last vlog is before today
      return !user.dailyVlogs.length || 
        new Date(user.dailyVlogs[0].date) < today;
    });
    
    // Send email reminders (implementation would depend on your email service)
    const remindersSent = await Promise.all(
      usersToRemind.map(async (user) => {
        if (!user.email) return null;
        
        try {
          // This is a placeholder - replace with your actual email sending logic
          // Example: await sendEmail({
          //   to: user.email,
          //   subject: "Don't forget your daily vlog!",
          //   text: `Hi ${user.name || 'there'}, don't forget to record your daily vlog today!`,
          // });
          
          return user.id;
        } catch (error) {
          console.error(`Failed to send reminder to ${user.email}:`, error);
          return null;
        }
      })
    );
    
    const successfulReminders = remindersSent.filter(Boolean);
    
    return NextResponse.json({
      success: true,
      remindersSent: successfulReminders.length,
    });
  } catch (error) {
    console.error('Error sending reminders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 