import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { sendDiscordNotification } from '@/service/discord-notify';
import { sendMail } from "@/lib/mail-service";

export async function POST(request: Request) {
  try {
    const { email, routePath } = await request.json();

    // Basic email validation
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Create new blog visitor email entry
    const blogVisitorEmail = await prismadb.blogVisitorEmail.create({
      data: {
        email,
        routePath,
        source: 'popup'
      },
    });

    // Send Discord notification
    await sendDiscordNotification(`Newsletter subscribed: ${email}, ${routePath}`);

    // Prepare welcome email content
    const subject = "Welcome to Olly - Your Social Media Growth Resources";
    const emailText = `Hi there,

Thank you for subscribing! 🎉 

Here are some valuable resources to help you grow your social media presence:

📱 Platform-Specific Growth Guides:
• Instagram Growth Guide: https://www.olly.social/guides/how-to-grow/instagram
• LinkedIn Growth Guide: https://www.olly.social/guides/how-to-grow/linkedin
• Reddit Growth Guide: https://www.olly.social/guides/how-to-grow/reddit
• X (Twitter) Growth Guide: https://www.olly.social/guides/how-to-grow/x-twitter
• Facebook Growth Guide: https://www.olly.social/guides/how-to-grow/facebook

📚 Browse all our guides here: https://www.olly.social/guides

Feel free to reach out if you have any questions!

Best regards,
The Olly Team`;

    // Send welcome email
    await sendMail(subject, email, emailText, "Olly Team");

    return NextResponse.json({
      success: true,
      email: blogVisitorEmail.email
    });
    
  } catch (error: any) {
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    console.error('[BLOG_EMAIL_CAPTURE]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}