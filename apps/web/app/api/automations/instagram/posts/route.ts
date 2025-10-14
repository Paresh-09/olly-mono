import { NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'
import prismadb from '@/lib/prismadb'
import { decrypt } from '@/lib/encryption'

export async function GET() {
  try {
    // Validate user session
    const {user} = await validateRequest()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has a valid Instagram token
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
      return NextResponse.json({ error: 'No valid Instagram token found' }, { status: 404 })
    }

    // Decrypt the access token
    const accessToken = decrypt(oauthToken.accessToken)
    
    try {
      // Get Instagram media directly using the Instagram API
      const postsResponse = await fetch(
        `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=25&access_token=${accessToken}`
      )
      
      if (!postsResponse.ok) {
        const errorText = await postsResponse.text()
        console.error('Failed to fetch Instagram posts:', errorText)
        
        // If token is invalid, mark it as such
        if (errorText.includes('Invalid OAuth access token')) {
          await prismadb.oAuthToken.update({
            where: {
              id: oauthToken.id
            },
            data: {
              isValid: false
            }
          })
          return NextResponse.json({ error: 'Invalid Instagram token' }, { status: 401 })
        }
        
        return NextResponse.json({ error: 'Failed to fetch Instagram posts' }, { status: 500 })
      }
      
      const postsData = await postsResponse.json()
      
      if (!postsData.data) {
        return NextResponse.json({ posts: [] })
      }
      
      return NextResponse.json({ posts: postsData.data })
    } catch (error) {
      console.error('Error in Instagram API calls:', error)
      return NextResponse.json({ error: 'Failed to fetch Instagram data' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error fetching Instagram posts:', error)
    return NextResponse.json({ error: 'Failed to fetch Instagram posts' }, { status: 500 })
  }
} 