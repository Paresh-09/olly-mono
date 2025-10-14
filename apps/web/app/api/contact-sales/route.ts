import { sendAcknowledgmentEmail, sendTeamNotificationEmail } from "@/lib/emails/support";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

interface SalesFormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  teamSize: string;
  message: string;
}

async function sendDiscordNotification(content: string, webhookUrl: string): Promise<void> {
  if (!webhookUrl) {
    throw new Error('Discord webhook URL is not configured');
  }

  try {
    await axios.post(webhookUrl, { content });
  } catch (error) {
    console.error('Error sending Discord notification:', error);
    throw new Error('Failed to send Discord notification');
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as SalesFormData;
    const { name, email, company, phone, teamSize, message } = body;

    // Validate required fields
    if (!name || !email || !company || !message) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields' }), 
        { status: 400 }
      );
    }

    // Format Discord message
    const discordMessage = `
      🎯 **New Enterprise Sales Lead**
      
      Name: ${name}
      Company: ${company}
      Email: ${email}
      Phone: ${phone || 'Not provided'}
      Team Size: ${teamSize || 'Not specified'}
      
      Message:
      ${message}
    `;

    // Send notifications
    const webhookUrl = process.env.SALES_WEBHOOK_URL;
    if (webhookUrl) {
      await sendDiscordNotification(discordMessage, webhookUrl);
    }

    // Send email notifications
    await Promise.all([
      sendTeamNotificationEmail(name, email, phone, message, {
        company,
        teamSize,
        type: 'sales'
      }),
      sendAcknowledgmentEmail(name, email, {
        template: 'sales-inquiry'
      })
    ]);

    return new NextResponse(
      JSON.stringify({ message: 'Sales inquiry received successfully' }), 
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error processing sales inquiry:', error);
    
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to process sales inquiry',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }), 
      { status: 500 }
    );
  }
}