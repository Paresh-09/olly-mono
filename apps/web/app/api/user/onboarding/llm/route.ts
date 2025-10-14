import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { validateRequest } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await validateRequest();
    
    if (!user?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { provider } = body;

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      );
    }

    // Update the user's onboarding progress
    const onboardingProgress = await prismadb.onboardingProgress.upsert({
      where: {
        userId: user.user.id,
      },
      update: {
        currentStep: {
          increment: 1,
        },
        lastUpdated: new Date(),
      },
      create: {
        userId: user.user.id,
        currentStep: 1,
      },
    });

    // Update or create onboarding record
    await prismadb.onboarding.upsert({
      where: {
        userId: user.user.id,
      },
      update: {
        aiExperience: provider,
      },
      create: {
        userId: user.user.id,
        aiExperience: provider,
        completedAt: new Date(),
        skipped: false,
      },
    });

    return NextResponse.json({
      success: true,
      onboardingProgress,
    });

  } catch (error) {
    console.error('Error updating LLM choice:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}