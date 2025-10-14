import { NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'
import prismadb from '@/lib/prismadb'

export async function GET() {
  try {
    // Validate user session
    const {user} = await validateRequest()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user's comment monitoring configuration from the database
    const config = await prismadb.instagramCommentMonitoring.findFirst({
      where: {
        userId: user.id
      }
    })

    if (config) {
      return NextResponse.json({ 
        config: {
          userId: config.userId,
          postId: config.postId,
          isEnabled: config.isEnabled,
          keywordRules: config.keywordRules,
          updatedAt: config.updatedAt
        } 
      })
    }

    return NextResponse.json({ config: null })
  } catch (error) {
    console.error('Error fetching comment monitoring config:', error)
    return NextResponse.json({ error: 'Failed to fetch configuration' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Validate user session
    const {user} = await validateRequest()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { isEnabled, postId, keywordRules } = body

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    if (!Array.isArray(keywordRules) || keywordRules.length === 0) {
      return NextResponse.json({ error: 'At least one keyword rule is required' }, { status: 400 })
    }

    // Validate that the user has a valid Instagram token
    const oauthToken = await prismadb.oAuthToken.findFirst({
      where: {
        userId: user.id,
        platform: 'INSTAGRAM',
        isValid: true,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    if (!oauthToken) {
      return NextResponse.json({ error: 'No valid Instagram token found' }, { status: 400 })
    }

    // Check if a configuration already exists
    const existingConfig = await prismadb.instagramCommentMonitoring.findFirst({
      where: {
        userId: user.id,
        postId: postId
      }
    })

    let config;
    
    if (existingConfig) {
      // Update existing configuration
      config = await prismadb.instagramCommentMonitoring.update({
        where: {
          id: existingConfig.id
        },
        data: {
          isEnabled: !!isEnabled,
          keywordRules: keywordRules
        }
      })
    } else {
      // Create new configuration
      config = await prismadb.instagramCommentMonitoring.create({
        data: {
          userId: user.id,
          postId,
          isEnabled: !!isEnabled,
          keywordRules: keywordRules
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      config: {
        userId: config.userId,
        postId: config.postId,
        isEnabled: config.isEnabled,
        keywordRules: config.keywordRules,
        updatedAt: config.updatedAt
      } 
    })
  } catch (error) {
    console.error('Error saving comment monitoring config:', error)
    return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 })
  }
} 