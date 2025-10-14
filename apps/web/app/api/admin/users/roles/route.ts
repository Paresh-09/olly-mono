import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from "@/lib/auth";
import prismadb from '@/lib/prismadb';

export async function PUT(request: NextRequest) {
  try {
    // Validate admin access
    const { user } = await validateRequest();
    if (!user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, roles } = body;

    if (!userId || typeof roles !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Update user roles
    const updatedUser = await prismadb.user.update({
      where: { id: userId },
      data: roles,
      select: {
        id: true,
        email: true,
        isAdmin: true,
        isSales: true,
        isSupport: true,
        isBetaTester: true,
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser
    });

  } catch (error) {
    console.error("Error updating user roles:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 