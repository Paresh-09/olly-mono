import { sendDiscordNotification } from "@/service/discord-notify";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { validateRequest } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { feedbackType, feedback, description } = await request.json();
    const { user } = await validateRequest();
    
    // Send Discord notification
    const discordMessage = `
**New Feature Request**
**Feature:** ${feedback}
**Description:** ${description}
${user ? `**User:** ${user.email}` : '**User:** Anonymous'}
`;
    await sendDiscordNotification(discordMessage);

    // Create feature request if user is logged in
    if (feedbackType === 'Feature Request') {
      await prismadb.roadmapItem.create({
        data: {
          feature: feedback,
          description: description || '',
          status: 'PENDING',
          priority: 'MEDIUM',
          ...(user && { userVotes: {
            create: {
              userId: user.id,
              type: 'UPVOTE'
            }
          }}),
        }
      });
    }

    return new NextResponse(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    console.error(`Error processing feature request: ${error.message}`);
    return new NextResponse(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}