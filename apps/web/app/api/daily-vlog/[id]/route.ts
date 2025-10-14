import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { isPublic, reminderEnabled, content } = body;

    // Verify the vlog belongs to the user
    const vlog = await prismadb.dailyVlog.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!vlog) {
      return NextResponse.json({ error: 'Vlog not found' }, { status: 404 });
    }

    // Update the vlog
    const updatedVlog = await prismadb.dailyVlog.update({
      where: { id },
      data: {
        ...(isPublic !== undefined && { isPublic }),
        ...(reminderEnabled !== undefined && { reminderEnabled }),
        ...(content && { content }),
      },
    });

    return NextResponse.json(updatedVlog);
  } catch (error) {
    console.error('Error updating vlog:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Verify the vlog belongs to the user
    const vlog = await prismadb.dailyVlog.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!vlog) {
      return NextResponse.json({ error: 'Vlog not found' }, { status: 404 });
    }

    // Delete the vlog
    await prismadb.dailyVlog.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting vlog:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 