import { NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'
import prismadb from '@/lib/prismadb'
import { decrypt } from '@/lib/encryption'

export async function GET(request: Request) {
  try {
    // Validate user session
    const {user} = await validateRequest()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get post ID from query params
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
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
      // Get comments for the specified post directly using the Instagram API
      const commentsResponse = await fetch(
        `https://graph.instagram.com/${postId}/comments?fields=id,text,username,timestamp,like_count,replies{id,text,username,timestamp,like_count}&limit=50&access_token=${accessToken}`
      )
      
      if (!commentsResponse.ok) {
        const errorText = await commentsResponse.text()
        console.error('Failed to fetch Instagram comments:', errorText)
        
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
        
        return NextResponse.json({ error: 'Failed to fetch Instagram comments' }, { status: 500 })
      }
      
      const commentsData = await commentsResponse.json()
      
      if (!commentsData.data) {
        return NextResponse.json({ comments: [] })
      }

      console.log('Comments for post:', commentsData.data);
      
      return NextResponse.json({ comments: commentsData.data })
    } catch (error) {
      console.error('Error in Instagram API calls:', error)
      return NextResponse.json({ error: 'Failed to fetch Instagram data' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error fetching Instagram comments:', error)
    return NextResponse.json({ error: 'Failed to fetch Instagram comments' }, { status: 500 })
  }
} 