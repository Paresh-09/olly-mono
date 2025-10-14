import { sendDiscordNotification } from "@/service/discord-notify";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { MilestoneType, UserJourneyMilestone } from "@repo/db";

function getReasonText(mainReason: string, specificReason: string): string {
  const reasonMap: Record<string, Record<string, string>> = {
    'technical': {
      'errors': 'Technical Issues: Error messages',
      'slow': 'Technical Issues: Slow or unresponsive',
      'popup': 'Technical Issues: Popup interface problems',
      'default': 'Technical Issues'
    },
    'setup': {
      'api': 'Setup Issues: API configuration',
      'complex': 'Setup Issues: Process too complex',
      'default': 'Setup & Configuration Challenges'
    },
    'quality': {
      'generic': 'AI Quality: Generic responses',
      'tone': 'AI Quality: Wrong tone/style',
      'default': 'AI Response Quality Issues'
    },
    'features': {
      'platform': 'Missing Features: Platform support',
      'automation': 'Missing Features: Automation needs',
      'default': 'Missing Features'
    },
    'cost': {
      'default': 'Cost Concerns'
    },
    'not_needed': {
      'default': 'No longer needed'
    }
  };

  const categoryReasons = reasonMap[mainReason] || { default: 'Other reason' };
  return categoryReasons[specificReason] || categoryReasons.default;
}

function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} days`;
  if (hours > 0) return `${hours} hours`;
  if (minutes > 0) return `${minutes} minutes`;
  return `${seconds} seconds`;
}

export async function POST(request: Request) {
  try {
    const { 
      userId, 
      mainReason, 
      specificReason, 
      additionalFeedback 
    } = await request.json();
    
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ success: false, error: "UserId is required" }),
        { status: 400 }
      );
    }

    const reasonText = getReasonText(mainReason, specificReason);
    let installation = null;
    let dbError = null;

    try {
      const user = await prismadb.user.findUnique({
        where: { id: userId },
        include: {
          licenseKeys: {
            include: {
              licenseKey: true
            }
          },
          journeyMilestones: true
        }
      });

      if (user) {
        // Track uninstall milestone
        await prismadb.userJourneyMilestone.upsert({
          where: {
            userId_milestone: {
              userId: user.id,
              milestone: MilestoneType.EXTENSION_UNINSTALLED,
            },
          },
          update: {}, // No update needed if it exists
          create: {
            userId: user.id,
            milestone: MilestoneType.EXTENSION_UNINSTALLED,
            metadata: {
              reason: reasonText,
              specificReason,
              additionalFeedback,
            },
          },
        });

        installation = await prismadb.installation.upsert({
          where: { id: user.id },
          update: {
            status: 'UNINSTALLED',
            reason: reasonText,
            specificReason: specificReason || null,
            additionalFeedback: additionalFeedback || null,
            uninstalledAt: new Date(),
          },
          create: {
            status: 'UNINSTALLED',
            reason: reasonText,
            specificReason: specificReason || null,
            additionalFeedback: additionalFeedback || null,
            uninstalledAt: new Date(),
            user: { connect: { id: user.id } },
          },
        });

        // Calculate user journey timings
        const signupTime = user.createdAt;
        const currentTime = new Date();
        const totalUserTime = currentTime.getTime() - signupTime.getTime();

        // Sort milestones by achievedAt time
        const sortedMilestones = [...user.journeyMilestones].sort((a: UserJourneyMilestone, b: UserJourneyMilestone) => 
          a.achievedAt.getTime() - b.achievedAt.getTime()
        );

        // Calculate time between key milestones
        const signupMilestone = sortedMilestones.find((m: UserJourneyMilestone) => m.milestone === MilestoneType.SIGNUP);
        const extensionMilestone = sortedMilestones.find((m: UserJourneyMilestone) => m.milestone === MilestoneType.EXTENSION_INSTALLED);
        const onboardingStartMilestone = sortedMilestones.find((m: UserJourneyMilestone) => m.milestone === MilestoneType.ONBOARDING_STARTED);
        const onboardingCompleteMilestone = sortedMilestones.find((m: UserJourneyMilestone) => m.milestone === MilestoneType.ONBOARDING_COMPLETED);

        // Prepare journey timing information
        const journeyTimings = [];
        if (signupMilestone && extensionMilestone) {
          journeyTimings.push(`Signup to Extension Install: ${formatDuration(extensionMilestone.achievedAt.getTime() - signupMilestone.achievedAt.getTime())}`);
        }
        if (extensionMilestone && onboardingStartMilestone) {
          journeyTimings.push(`Extension Install to Onboarding Start: ${formatDuration(onboardingStartMilestone.achievedAt.getTime() - extensionMilestone.achievedAt.getTime())}`);
        }
        if (onboardingStartMilestone && onboardingCompleteMilestone) {
          journeyTimings.push(`Onboarding Duration: ${formatDuration(onboardingCompleteMilestone.achievedAt.getTime() - onboardingStartMilestone.achievedAt.getTime())}`);
        }

        // Prepare milestone completion list
        const completedMilestones = sortedMilestones.map((m: UserJourneyMilestone) => 
          `• ${m.milestone} (${new Date(m.achievedAt).toLocaleString()})`
        );

        // Prepare license information
        const licenseInfo = user.licenseKeys.length 
          ? `Active Licenses: ${user.licenseKeys.map(lk => lk.licenseKey.key).join(', ')}`
          : 'No active licenses';

        // Prepare detailed notification message
        const notificationText = [
          `@everyone, user ${userId} uninstalled the extension.`,
          `Email: ${user.email}`,
          `Total Time as User: ${formatDuration(totalUserTime)}`,
          '',
          `Category: ${reasonText}`,
          specificReason && `Specific Issue: ${specificReason}`,
          additionalFeedback && `Additional Feedback: ${additionalFeedback}`,
          '',
          licenseInfo,
          '',
          'User Journey:',
          ...journeyTimings,
          '',
          'Completed Milestones:',
          ...completedMilestones
        ].filter(Boolean).join('\n');

        // Send Discord notification
        await sendDiscordNotification(notificationText);
      }
    } catch (error: any) {
      console.error(`Database operation failed: ${error.message}`);
      dbError = error.message;
    }

    return new NextResponse(
      JSON.stringify({ 
        success: true, 
        installation, 
        dbError: dbError ? "Database operation failed, but notification and logging succeeded" : null 
      }),
      { status: dbError ? 206 : 200 }
    );
  } catch (error: any) {
    console.error(`Error processing uninstall: ${error.message}`);
    return new NextResponse(
      JSON.stringify({ success: false, error: `Failed to process uninstall: ${error.message}` }),
      { status: 500 }
    );
  }
}