import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateRequest } from '@/lib/auth'
import prismadb from '@/lib/prismadb'

export async function POST() {
  try {
    // Validate user session
    const { user } = await validateRequest()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Invalidate the OAuth token in the database
    await prismadb.oAuthToken.updateMany({
      where: {
        userId: user.id,
        platform: 'INSTAGRAM',
      },
      data: {
        isValid: false,
      }
    })

    // Clear cookies - Following Next.js 15 async pattern
    const cookieStore = await cookies()
    cookieStore.delete('instagram_access_token')
    cookieStore.delete('instagram_business_account')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error disconnecting Instagram:', error)
    return NextResponse.json({ error: 'Failed to disconnect Instagram' }, { status: 500 })
  }
}