import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

export async function GET(req: Request) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's credit balance
    const userCredit = await prismadb.userCredit.findUnique({
      where: { userId: user.id }
    });

    // If user doesn't have a credit record yet, return 0 balance
    const balance = userCredit?.balance || 0;

    return NextResponse.json({
      success: true,
      balance
    });
  } catch (error) {
    console.error('Error fetching user credits:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 