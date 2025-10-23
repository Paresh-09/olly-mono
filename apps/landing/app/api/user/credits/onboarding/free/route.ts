// app/api/credits/add-free-credits/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';
import { validateRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { credits = 50 } = await req.json();

    // Check if user has already claimed free credits
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { hasClaimedOnboardingCredits: true }
    });

    if (existingUser?.hasClaimedOnboardingCredits) {
      return NextResponse.json({ 
        success: false,
        message: 'Free credits already claimed'
      }, { status: 400 });
    }

    // Use transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Add credits
      const userCredit = await tx.userCredit.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          balance: credits
        },
        update: {
          balance: {
            increment: credits
          }
        }
      });

      // Record the transaction
      await tx.creditTransaction.create({
        data: {
          userCreditId: userCredit.id,
          amount: credits,
          type: 'GIFTED',
          description: 'Free credits for choosing Olly API during onboarding'
        }
      });

      // Mark credits as claimed
      await tx.user.update({
        where: { id: user.id },
        data: { hasClaimedOnboardingCredits: true }
      });

      return userCredit;
    });

    return NextResponse.json({ 
      success: true,
      message: 'Credits added successfully',
      balance: result.balance
    });

  } catch (error) {
    console.error('Error adding credits:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Error adding credits'
    }, { status: 500 });
  }
}