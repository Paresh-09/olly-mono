// app/api/v2/mobile/credits/add/route.ts
import { NextRequest } from 'next/server'
import { lucia } from '@/lib/auth'
import prismadb from '@/lib/prismadb'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
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

    // Add credits in a transaction
    const updatedUser = await prismadb.$transaction(async (tx) => {
      // Get or create user credit record
      let userCredit = await tx.userCredit.findUnique({
        where: { userId: user.id }
      })

      if (!userCredit) {
        userCredit = await tx.userCredit.create({
          data: {
            userId: user.id,
            balance: 10 // Default starting balance
          }
        })
      }

      // Update credit balance
      const updatedCredit = await tx.userCredit.update({
        where: { userId: user.id },
        data: {
          balance: userCredit.balance + 5,
        }
      })

      // Create transaction record
      await tx.creditTransaction.create({
        data: {
          userCreditId: userCredit.id,
          amount: 5,
          type: 'EARNED',
          description: 'Watched ad for credits'
        }
      })

      // Get updated user data
      return await tx.user.findUnique({
        where: { id: user.id },
        include: {
          credit: true,
          onboarding: true
        }
      })
    })

    if (!updatedUser) {
      return Response.json(
        { success: false, error: 'Failed to update credits' },
        { status: 400 }
      )
    }

    return Response.json({
      success: true,
      data: {
        id: updatedUser.id,
        externalUserId: updatedUser.externalUserId,
        email: updatedUser.email,
        name: updatedUser.name,
        credit: updatedUser.credit,
        // ... other user fields
      }
    })

  } catch (error: any) {
    console.error('Add credits error:', error)
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}