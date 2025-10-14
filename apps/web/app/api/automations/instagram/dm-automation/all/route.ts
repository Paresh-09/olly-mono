import { NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'
import prismadb from '@/lib/prismadb'

export async function GET() {
  try {
    // Validate user session
    const { user } = await validateRequest()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all DM automation configurations for this user
    const configs = await prismadb.instagramDMAutomation.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ configs })
  } catch (error) {
    console.error('Error fetching DM automation configurations:', error)
    return NextResponse.json({ error: 'Failed to fetch DM automation configurations' }, { status: 500 })
  }
} 