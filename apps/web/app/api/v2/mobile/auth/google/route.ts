// app/api/auth/google/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { lucia } from '@/lib/auth'; 
import  prismadb  from '@/lib/prismadb'; 
import { DeviceType, SignInMethod, MilestoneType } from '@prisma/client';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface GoogleAuthRequest {
  idToken: string;
  platform: string;
  email?: string;
  name?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GoogleAuthRequest = await request.json();
    const { idToken, platform, email, name } = body;

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 400 }
      );
    }

    const googleId = payload.sub;
    const userEmail = payload.email || email;
    const userName = payload.name || name;
    const userPicture = payload.picture;

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    let existingUser = await prismadb.user.findUnique({
      where: { email: userEmail },
      include: {
        credit: true,
        organizations: {
          include: {
            organization: true
          }
        }
      }
    });

    let userId: string;
    let isFirstLogin = false;

    if (existingUser) {
      // User exists, update if needed
      userId = existingUser.id;
      isFirstLogin = existingUser.firstLogin || false;
      
      // Update user info if needed
      await prismadb.user.update({
        where: { id: userId },
        data: {
          picture: userPicture,
          signInMethod: SignInMethod.GOOGLE,
          isEmailVerified: true,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new user with Android-optimized defaults
      const newUser = await prismadb.user.create({
        data: {
          email: userEmail,
          name: userName || userEmail.split('@')[0],
          picture: userPicture,
          signInMethod: SignInMethod.GOOGLE,
          isEmailVerified: true,
          firstLogin: true,
          onboardingComplete: false,
          thumbnailCredits: 1,
          hasClaimedOnboardingCredits: false,
          // Create user credit with default balance
          credit: {
            create: {
              balance: 10 // Default credits for new users
            }
          }
        },
        include: {
          credit: true,
          organizations: {
            include: {
              organization: true
            }
          }
        }
      });

      userId = newUser.id;
      isFirstLogin = true;

      // Track signup milestone for new users
      await prismadb.userJourneyMilestone.create({
        data: {
          userId: userId,
          milestone: MilestoneType.SIGNUP,
          metadata: {
            platform: 'android',
            signupMethod: 'google',
            source: 'mobile_app'
          }
        }
      });

      // Track first login milestone
      await prismadb.userJourneyMilestone.create({
        data: {
          userId: userId,
          milestone: MilestoneType.FIRST_LOGIN,
          metadata: {
            platform: 'android',
            deviceType: 'mobile'
          }
        }
      });
    }

    // Determine device type based on platform
    const deviceType = platform.toLowerCase() === 'android' ? DeviceType.MOBILE_ANDROID : 
                      platform.toLowerCase() === 'ios' ? DeviceType.MOBILE_IOS : 
                      DeviceType.OTHER;

    // Create Lucia session with mobile-optimized settings
    const session = await lucia.createSession(userId, {});

    // Create session cookie optimized for mobile
    const sessionCookie = lucia.createSessionCookie(session.id);

    // Get updated user data with the exact fields needed
    const updatedUser = await prismadb.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        externalUserId: true,
        firstLogin: true,
        email: true,
        name: true,
        username: true,
        picture: true,
        createdAt: true,
        updatedAt: true,
        deactivated: true,
        isSuperAdmin: true,
        isAdmin: true,
        isBetaTester: true,
        isSales: true,
        isPaidUser: true,
        onboardingComplete: true,
        thumbnailCredits: true,
        isSupport: true,
        hasClaimedOnboardingCredits: true,
        isEmailVerified: true,
        diwali24SaleEmailSent: true,
        signInMethod: true,
        signupSource: true,
        organizations: {
          select: {
            organization: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    });

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'User not found after creation' },
        { status: 500 }
      );
    }

    // Prepare the response data in the exact format requested
    const responseData = {
      ...updatedUser,
      token: session.id,
      // Include organization data if user has organizations
      organization: updatedUser.organizations.length > 0 
        ? updatedUser.organizations[0].organization 
        : null
    };

    // Remove the organizations array since we're including organization as a single object
    delete (responseData as any).organizations;


    // Prepare response with the exact format requested
    const response = NextResponse.json({
      success: true,
      data: responseData
    });

    // Set session cookie with mobile-friendly attributes
    response.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      {
        ...sessionCookie.attributes,
        sameSite: 'lax', // Better for mobile WebView
        secure: process.env.NODE_ENV === 'production',
      }
    );

    return response;

  } catch (error) {
    console.error('Google auth error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication failed', 
          details: process.env.NODE_ENV === 'development' ? error.message : undefined 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// Handle preflight requests for mobile CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, User-Agent',
      'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
    },
  });
}