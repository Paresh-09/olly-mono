import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { NotificationStatus } from "@/types/notifications";
import { NextResponse } from "next/server";

interface MarkReadRequestBody {
    notificationIds: string[];
  }
  
  export async function PUT(request: Request): Promise<NextResponse> {
    try {
      const user = await validateRequest();
      const userId = user.user?.id;
  
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const body: MarkReadRequestBody = await request.json();
      const { notificationIds } = body;
  
      await prismadb.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId
        },
        data: {
          status: NotificationStatus.READ,
          readAt: new Date()
        }
      });
  
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }  