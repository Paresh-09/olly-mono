import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { NotificationStatus } from "@/types/notifications";
import { NextResponse } from "next/server";

export async function GET(request: Request, props: { params: Promise<{ notificationId: string }> }): Promise<NextResponse> {
  const params = await props.params;
  try {
    const user = await validateRequest();
    const userId = user.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notification = await prismadb.notification.findUnique({
      where: {
        id: params.notificationId,
        userId
      }
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ notification });
  } catch (error) {
    console.error('Error fetching notification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
  
  export async function PATCH(request: Request, props: { params: Promise<{ notificationId: string }> }): Promise<NextResponse> {
    const params = await props.params;
    try {
      const user = await validateRequest();
      const userId = user.user?.id;
  
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const body = await request.json();
      const { status } = body;
  
      const notification = await prismadb.notification.update({
        where: {
          id: params.notificationId,
          userId
        },
        data: {
          status: status as NotificationStatus,
          ...(status === NotificationStatus.READ ? { readAt: new Date() } : {})
        }
      });
  
      return NextResponse.json({ notification });
    } catch (error) {
      console.error('Error updating notification:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
  
  export async function DELETE(request: Request, props: { params: Promise<{ notificationId: string }> }): Promise<NextResponse> {
    const params = await props.params;
    try {
      const user = await validateRequest();
      const userId = user.user?.id;
  
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      await prismadb.notification.update({
        where: {
          id: params.notificationId,
          userId
        },
        data: {
          status: NotificationStatus.ARCHIVED
        }
      });
  
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error archiving notification:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }