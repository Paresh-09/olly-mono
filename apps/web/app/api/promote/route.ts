import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { sendDiscordNotification } from '@/service/creator-discord-notify';


export async function POST(request: Request) {
  try {
    const { email, socialLinks, category } = await request.json();

    // Basic validation
    if (!email || !email.includes('@') || !Array.isArray(socialLinks) || !socialLinks[0] || !category) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields.' },
        { status: 400 }
      );
    }

    // Create new promote application entry
    const promoteApp = await prismadb.promoteApplication.create({
      data: {
        email,
        socialLinks,
        category,
      },
    });

    // Send Discord notification
    await sendDiscordNotification(
      `New Influencer Application\nEmail: ${email}\nLinks: ${socialLinks.join(', ')}\nCategory: ${category}`
    );

    return NextResponse.json({ success: true, email: promoteApp.email });
  } catch (error: any) {
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Application already submitted with this email.' },
        { status: 400 }
      );
    }
    console.error('[PROMOTE_APPLICATION]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
