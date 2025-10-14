import prismadb from '@/lib/prismadb';
import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from "@/lib/auth";
import { processOnboardingData } from '@/lib/onboarding-data';

export async function GET(request: NextRequest) {
  try {
    const { user } = await validateRequest();
    if (!user?.isSales) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const onboardingData = await prismadb.onboarding.findMany({
      include: {
        user: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    const processedData = processOnboardingData(onboardingData);
    return NextResponse.json(processedData);
    
  } catch (error) {
    console.error("Error fetching onboarding analytics:", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}