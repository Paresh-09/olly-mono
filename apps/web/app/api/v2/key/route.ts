import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { validateRequest } from '@/lib/auth';

export async function GET() {
  try {
    const user = await validateRequest();
    
    if (!user?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find the user's API key and check credit claim status
    const userData = await prismadb.user.findUnique({
      where: { id: user.user.id },
      select: {
        hasClaimedOnboardingCredits: true,
        apiKeys: {
          include: {
            apiKey: true,
          },
          take: 1,
        },
      },
    });

    const userApiKey = userData?.apiKeys[0];

    return NextResponse.json({
      apiKey: userApiKey?.apiKey ? {
        id: userApiKey.apiKey.id,
        key: userApiKey.apiKey.key,
        isActive: userApiKey.apiKey.isActive,
      } : null,
      hasClaimedFreeCredits: userData?.hasClaimedOnboardingCredits || false,
    });

  } catch (error) {
    console.error('Error fetching API key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}