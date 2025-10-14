import { sendAcknowledgmentEmail, sendTeamNotificationEmail } from "@/lib/emails/support";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

async function sendDiscordNotification(content: string, webhookUrl: string) {
  if (!webhookUrl) {
    console.error('Webhook URL is not defined.');
    throw new Error('Webhook URL is not defined.');
  }

  try {
    const response = await axios.post(webhookUrl, { content });
    return response;
  } catch (error) {
    console.error('Error sending Discord notification:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { name, email, message, phone } = body;

  try {
    const discordMessage = `
      @everyone 🚨,
      New contact form submission:
      Name: ${name}
      Email: ${email}
      Phone: ${phone}
      Message: ${message}
    `;

    const webhookUrls = [
      process.env.OLLY_SUPPORT_WEBHOOK,
    ].filter(Boolean) as string[];

    for (const webhookUrl of webhookUrls) {
      await sendDiscordNotification(discordMessage, webhookUrl);
    }

    // Send notification email to the team
    await sendTeamNotificationEmail(name, email, phone, message);

    // Send acknowledgment email to the user
    await sendAcknowledgmentEmail(name, email);

    return new NextResponse(null, { status: 200 });
  } catch (error: any) {
    console.error(`Error processing contact form submission: ${error.message}`);
    return new NextResponse(`Error: ${error.message}`, {
      status: 500,
    });
  }
}