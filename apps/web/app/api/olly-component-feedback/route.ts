import { sendDiscordNotification } from "@/service/discord-notify";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { feedbackType, feedback, skipped, source, context } = body;

    try {
        let discordMessage;

        if (skipped) {
            discordMessage = `
**Olly Popup Feedback Skipped**
User skipped the feedback.
**Source:** ${source}
`;
        } else {
            discordMessage = `
**Olly Popup Feedback Submitted**
**Feedback Type:** ${feedbackType}
**Feedback:** ${feedback}
**Source:** ${source}
**Context:**
- Response Text: ${context.responseText}
- Selected Text: ${context.selectedText}
`;
        }

        await sendDiscordNotification(discordMessage);
        return new NextResponse(null, { status: 200 });
    } catch (error: any) {
        console.error(`Error sending Olly popup feedback notification: ${error.message}`);
        return new NextResponse(`Olly Popup Feedback Notification Error: ${error.message}`, {
            status: 500,
        });
    }
}