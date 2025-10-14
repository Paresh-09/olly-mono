import { sendDiscordNotification } from "@/service/discord-notify";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { feedbackType, feedback, skipped } = body;

    try {
        let discordMessage;

        if (skipped) {
            discordMessage = `
**Feedback Skipped**
User skipped the feedback.
`;
        } else {
            discordMessage = `
**Feedback Submitted**
**Feedback Type:** ${feedbackType}
**Feedback:** ${feedback}
`;
        }

        await sendDiscordNotification(discordMessage);
        return new NextResponse(null, { status: 200 });
    } catch (error: any) {
        console.error(`Error sending notification: ${error.message}`);
        return new NextResponse(`Notification Error: ${error.message}`, {
            status: 500,
        });
    }
}