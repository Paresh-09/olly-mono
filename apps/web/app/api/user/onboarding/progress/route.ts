import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';
import { validateRequest } from "@/lib/auth";
import { STEPS } from '@/types/onboarding';

interface UpdateProgressBody {
  step: number;
  isCompleted?: boolean;
}

// Get current progress
export async function GET() {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const progress = await prisma.onboardingProgress.findUnique({
    where: { userId: user.id },
  });

  return NextResponse.json(progress || { currentStep: 0, isCompleted: false });
}

// Update progress
export async function POST(req: NextRequest) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json() as UpdateProgressBody;

  // Start a transaction to update both progress and user status
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Update onboarding progress
      const progress = await tx.onboardingProgress.upsert({
        where: { userId: user.id },
        update: {
          currentStep: body.step,
          isCompleted: body.isCompleted ?? false,
        },
        create: {
          userId: user.id,
          currentStep: body.step,
          isCompleted: body.isCompleted ?? false,
        },
      });

      // If user has reached completion step or isCompleted is true, mark onboardingComplete
      if (body.step === STEPS.COMPLETION || body.isCompleted) {
        await tx.user.update({
          where: { id: user.id },
          data: {
            onboardingComplete: true
          }
        });
      }

      return progress;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating onboarding progress:', error);
    return NextResponse.json(
      { message: 'Failed to update onboarding progress' },
      { status: 500 }
    );
  }
}