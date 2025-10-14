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

    // Fetch all comment monitoring configurations for this user
    const configs = await prismadb.instagramCommentMonitoring.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ configs })
  } catch (error) {
    console.error('Error fetching comment monitoring configurations:', error)
    return NextResponse.json({ error: 'Failed to fetch comment monitoring configurations' }, { status: 500 })
  }
} 