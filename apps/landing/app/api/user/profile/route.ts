// app/api/user/profile/route.ts

import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

export async function GET() {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userProfile = await prismadb.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
    },
  });

  if (!userProfile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(userProfile);
}

export async function PUT(request: Request) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();

  const updatedUser = await prismadb.user.update({
    where: { id: user.id },
    data: {
      name: data.name,
      username: data.username,
    },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
    },
  });

  return NextResponse.json(updatedUser);
}