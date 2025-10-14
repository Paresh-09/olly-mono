import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const token = (await cookies()).get('linkedin_token')
  
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        author: `urn:li:person:${body.authorId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: body.content
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      })
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('LinkedIn post error:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}

export async function GET() {
  const token = (await cookies()).get('linkedin_token')
  
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    // Fetch user's network posts
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(urn:li:person:{userId})', {
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('LinkedIn posts fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}