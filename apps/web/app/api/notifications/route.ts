import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { NotificationType, NotificationStatus } from "@/types/notifications";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  try {
    const user = await validateRequest();
    const userId = user.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await prismadb.notification.findMany({
      where: {
        userId,
        status: {
          not: NotificationStatus.ARCHIVED
        },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

interface CreateNotificationBody {
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  metadata?: Record<string, any>;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const user = await validateRequest();
    const userId = user.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateNotificationBody = await request.json();
    const { title, message, type, link, metadata } = body;

    const notification = await prismadb.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link,
        metadata,
      }
    });

    return NextResponse.json({ notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}