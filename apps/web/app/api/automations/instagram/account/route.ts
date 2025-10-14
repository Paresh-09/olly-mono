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
      // Get Instagram account details directly using the Instagram API
      const accountResponse = await fetch(
        `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`
      )
      
      if (!accountResponse.ok) {
        const errorText = await accountResponse.text()
        console.error('Failed to fetch Instagram account:', errorText)
        
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
        
        return NextResponse.json({ error: 'Failed to fetch Instagram account' }, { status: 500 })
      }
      
      const accountData = await accountResponse.json()
      
      // Get profile picture URL
      const profileResponse = await fetch(
        `https://graph.instagram.com/${accountData.id}?fields=profile_picture_url&access_token=${accessToken}`
      )
      
      let profilePictureUrl = null
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        profilePictureUrl = profileData.profile_picture_url
      }
      
      return NextResponse.json({
        account: {
          id: accountData.id,
          username: accountData.username,
          name: accountData.username,
          accountType: accountData.account_type || 'BUSINESS',
          mediaCount: accountData.media_count || 0,
          profilePicture: profilePictureUrl
        }
      })
    } catch (error) {
      console.error('Error in Instagram API calls:', error)
      return NextResponse.json({ error: 'Failed to fetch Instagram data' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error fetching Instagram account:', error)
    return NextResponse.json({ error: 'Failed to fetch Instagram account' }, { status: 500 })
  }
} 