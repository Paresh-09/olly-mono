import { NextRequest } from 'next/server'
import { lucia } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import prismadb from '@/lib/prismadb'

export async function POST(req: NextRequest) {
  try {
    const { email, password, platform = 'android' } = await req.json()

    if (!email || !email.includes('@')) {
      return Response.json({ success: false, error: 'Invalid email' }, { status: 400 })
    }

    const existingUser = await prismadb.user.findUnique({
      where: { email },
      include: {
        credit: true
      }
    })

    if (!existingUser) {
      return Response.json(
        { success: false, error: 'Incorrect email or password' },
        { status: 401 }
      )
    }

    if (existingUser.deactivated) {
      return Response.json(
        { success: false, error: 'Account is deactivated' },
        { status: 403 }
      )
    }

    if (!existingUser.password) {
      return Response.json(
        { success: false, error: 'Password not set for this account' },
        { status: 400 }
      )
    }

    const validPassword = await bcrypt.compare(password, existingUser.password)
    if (!validPassword) {
      return Response.json(
        { success: false, error: 'Incorrect email or password' },
        { status: 401 }
      )
    }

    // Create session
    const session = await lucia.createSession(existingUser.id, {})
    const sessionToken = session.id // This will be used as bearer token for mobile

    // Clean up sensitive data
    const { password: _, ...userData } = existingUser

    return Response.json({
      success: true,
      data: {
        ...userData,
        token: sessionToken // Send token to mobile client
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
