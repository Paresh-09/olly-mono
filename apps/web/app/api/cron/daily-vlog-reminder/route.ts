import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { startOfDay, endOfDay } from 'date-fns';
import { sendEmail } from '@/lib/send-email';
import { getDailyVlogReminderTemplate } from '@/lib/email-templates/daily-vlog-reminder';

// Helper function to check if the day is odd
function isOddDay(date: Date): boolean {
  return date.getDate() % 2 === 1;
}

export async function GET(req: Request) {
  try {
    // Check if it's an odd day - only send reminders on odd days
    const today = new Date();
    if (!isOddDay(today)) {
      return NextResponse.json({ 
        message: 'Skipping reminders - not an odd day',
        success: true 
      });
    }

    // Find users who have reminder enabled for any vlog entry
    const usersWithReminders = await prismadb.user.findMany({
      where: {
        dailyVlogs: {
          some: {
            reminderEnabled: true
          }
        },
        email: {
          not: null
        }
      },
      select: {
        id: true,
        email: true,
        username: true
      }
    });

    // For each user, check if they have created an entry today
    const today_start = startOfDay(today);
    const today_end = endOfDay(today);
    
    let remindersSent = 0;

    for (const user of usersWithReminders) {
      // Skip users without an email (shouldn't happen due to our query, but just to be safe)
      if (!user.email) continue;
      
      // Check if user has created a vlog entry today
      const todayEntry = await prismadb.dailyVlog.findFirst({
        where: {
          userId: user.id,
          date: {
            gte: today_start,
            lte: today_end
          }
        }
      });

      // If no entry for today, send a reminder
      if (!todayEntry) {
        const displayName = user.username || user.email.split('@')[0];
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://olly.social';
        
        // Generate HTML email content
        const htmlContent = getDailyVlogReminderTemplate({
          displayName,
          appUrl
        });
        
        // Plain text fallback
        const textContent = `Hi ${displayName},

We noticed you haven't created your daily vlog entry yet today. 

Taking a few minutes to reflect on your day can help you stay mindful and track your progress over time.

Click here to create your entry now: ${appUrl}/dashboard/daily-vlog

Best regards,
The Olly Team`;
        
        await sendEmail({
          to: user.email,
          subject: "Don't forget your daily vlog entry!",
          text: textContent,
          html: htmlContent,
          attachments: []
        });
        
        remindersSent++;
      }
    }

    return NextResponse.json({ 
      message: `Successfully sent ${remindersSent} reminders`,
      success: true 
    });
  } catch (error) {
    console.error('Error sending daily vlog reminders:', error);
    return NextResponse.json({ 
      error: 'Failed to send reminders',
      success: false 
    }, { status: 500 });
  }
} 