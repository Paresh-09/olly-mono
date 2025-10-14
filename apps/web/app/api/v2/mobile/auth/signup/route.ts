// app/api/v2/mobile/auth/signup/route.ts
import { NextRequest } from 'next/server'
import { lucia } from '@/lib/auth'
import { generateApiKey, generateRandomName } from '@/lib/utils'
import bcrypt from 'bcryptjs'
import prismadb from '@/lib/prismadb'

export const dynamic = 'force-dynamic'

const genericDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, platform = 'android' } = await req.json()

    // Validation
    if (!email || !email.includes('@')) {
      return Response.json({ success: false, error: 'Invalid email' }, { status: 400 })
    }

    if (!password || password.length < 6 || password.length > 255) {
      return Response.json({ success: false, error: 'Invalid password' }, { status: 400 })
    }

    // Generate username from email
    const username = email.split('@')[0].toLowerCase()

    // Check existing user outside transaction
    const existingUser = await prismadb.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    })

    if (existingUser) {
      return Response.json({
        success: false,
        error: existingUser.email === email ? 'Email already in use' : 'Username already taken'
      }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    // Prepare organization name
    const domain = email.split('@')[1]
    let baseName: string

    if (!genericDomains.includes(domain)) {
      baseName = domain.split('.')[0]
    } else {
      const firstName = email.split('@')[0].split('.')[0]
      if (firstName && firstName.length > 1) {
        baseName = firstName.charAt(0).toUpperCase() + firstName.slice(1)
      } else {
        baseName = generateRandomName()
      }
    }

    // Create user and related data in a single transaction
    const result = await prismadb.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email,
          username,
          name,
          password: passwordHash,
          signInMethod: 'EMAIL',
        }
      })

      // Create user credits
      await tx.userCredit.create({
        data: {
          userId: newUser.id,
          balance: 10,
        }
      })

      // Create API key
      const apiKey = generateApiKey()
      await tx.apiKey.create({
        data: {
          key: apiKey,
          users: {
            create: {
              userId: newUser.id
            }
          }
        }
      })

      // Find unique org name within transaction
      let uniqueName = baseName
      let counter = 1
      let orgName = uniqueName

      while (true) {
        const existingOrg = await tx.organization.findUnique({
          where: { name: orgName }
        })

        if (!existingOrg) break
        orgName = `${baseName}${counter}`
        counter++
      }

      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: orgName,
          users: {
            create: {
              userId: newUser.id,
              role: 'OWNER'
            }
          }
        }
      })

      return { user: newUser, organization }
    })

    // Create session after successful transaction
    const session = await lucia.createSession(result.user.id, {})
    const sessionToken = session.id

    // Clean up sensitive data
    const { password: _, ...userData } = result.user

    return Response.json({
      success: true,
      data: {
        ...userData,
        token: sessionToken,
        organization: {
          id: result.organization.id,
          name: result.organization.name
        }
      }
    })

  } catch (error: any) {
    console.error('Signup error:', error)
    
    // More specific error handling
    if (error.code === 'P2002') {
      return Response.json(
        { success: false, error: 'Username or email already exists' },
        { status: 409 }
      )
    }

    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS
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