// app/api/v2/mobile/user/route.ts
import { NextRequest } from 'next/server'
import { lucia } from '@/lib/auth'
import prismadb from '@/lib/prismadb'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    
    if (!authHeader) {
      return Response.json(
        { success: false, error: 'No authorization header' },
        { status: 401 }
      )
    }

    // Extract the session token
    const sessionToken = authHeader.replace('Bearer ', '')

    // Validate session
    const { session, user } = await lucia.validateSession(sessionToken)
    
    if (!session) {
      return Response.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      )
    }

    // Fetch user with credit data
    const userData = await prismadb.user.findUnique({
      where: {
        id: user.id
      },
      include: {
        credit: true,
        onboarding: true
      }
    })

    if (!userData) {
      return Response.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Format the response
    const response = {
      id: userData.id,
      externalUserId: userData.externalUserId,
      firstLogin: userData.firstLogin,
      email: userData.email,
      name: userData.name,
      username: userData.username,
      picture: userData.picture,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      deactivated: userData.deactivated,
      isAdmin: userData.isAdmin,
      isPaidUser: userData.isPaidUser,
      onboardingComplete: userData.onboardingComplete,
      thumbnailCredits: userData.thumbnailCredits,
      isSupport: userData.isSupport,
      isEmailVerified: userData.isEmailVerified,
      signInMethod: userData.signInMethod,
      credit: userData.credit,
      onboarding: userData.onboarding,
      token: sessionToken
    }

    return Response.json({
      success: true,
      data: response
    })

  } catch (error: any) {
    console.error('Get user error:', error)
    
    if (error.message === 'INVALID_SESSION_ID') {
      return Response.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      )
    }

    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}