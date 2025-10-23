// app/api/user/onboarding/feedback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';
import { validateRequest } from "@/lib/auth";

interface FeedbackBody {
  rating: number;
  feedback?: string;
}

export async function POST(req: NextRequest) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json() as FeedbackBody;

  if (!body.rating || body.rating < 1 || body.rating > 5) {
    return NextResponse.json({ message: 'Invalid rating' }, { status: 400 });
  }

  try {
    const feedback = await prisma.onboardingFeedback.upsert({
      where: {
        userId: user.id,
      },
      update: {
        rating: body.rating,
        feedback: body.feedback,
      },
      create: {
        userId: user.id,
        rating: body.rating,
        feedback: body.feedback,
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error saving feedback:', error);
    return NextResponse.json(
      { message: 'Error saving feedback' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const feedback = await prisma.onboardingFeedback.findUnique({
      where: {
        userId: user.id,
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { message: 'Error fetching feedback' },
      { status: 500 }
    );
  }
}