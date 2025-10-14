import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/encryption'

interface UserProfileResponse {
  sub: string;
  [key: string]: any;
}

interface CommentBody {
  postUrn: string;
  comment: string;
}

async function decryptToken(encryptedToken: string): Promise<string> {
  try {
    return decrypt(encryptedToken)
  } catch (error) {
    console.error('Token decryption failed:', error)
    throw new Error('Failed to retrieve token data')
  }
}

async function getCurrentUser(token: string): Promise<string> {
  try {
    const response = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    })

    
    const responseText = await response.text()
    

    if (!response.ok) {
      throw new Error(`Failed to fetch user profile: ${response.status} ${responseText}`)
    }

    const data: UserProfileResponse = JSON.parse(responseText)
    if (!data.sub) {
      throw new Error('User ID not found in profile response')
    }

    return `urn:li:person:${data.sub}`
  } catch (error) {
    console.error('Error fetching user profile:', error)
    throw error
  }
}

export async function POST(request: Request) {
  const encryptedToken = (await cookies()).get('linkedin_token')

  if (!encryptedToken) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }

  let decryptedToken: string
  try {
    decryptedToken = await decryptToken(encryptedToken.value)
  } catch (error) {
    console.error('Failed to decrypt token:', error)
    return NextResponse.json(
      { error: 'Invalid authentication token' },
      { status: 401 }
    )
  }

  try {
    const body: CommentBody = await request.json()
    const { postUrn, comment } = body

    // Get the current user's URN using decrypted token
    const userUrn = await getCurrentUser(decryptedToken)


    // Ensure the URN is properly formatted
    const decodedUrn = decodeURIComponent(postUrn)
   

    const response = await fetch(
      `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(decodedUrn)}/comments`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${decryptedToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify({
          actor: userUrn,
          message: {
            text: comment,
            attributes: []
          },
          object: decodedUrn
        })
      }
    )

    
    const responseText = await response.text()
 

    if (!response.ok) {
      let errorMessage
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.message || errorData.code || 'Failed to create comment'
      } catch {
        errorMessage = responseText || 'Failed to create comment'
      }
      throw new Error(errorMessage)
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch {
      data = { success: true }
    }
    return NextResponse.json(data)

  } catch (error) {
    console.error('LinkedIn comment error:', error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
