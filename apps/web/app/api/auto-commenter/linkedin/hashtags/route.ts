import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tag = searchParams.get('tag')
  const token = (await cookies()).get('linkedin_token')
  
  if (!token) {
    return NextResponse.json(
      { error: 'Not authenticated' }, 
      { status: 401 }
    )
  }

  if (!tag) {
    return NextResponse.json(
      { error: 'Tag parameter is required' }, 
      { status: 400 }
    )
  }

  try {
    const hashtagResponse = await fetch(
      `https://api.linkedin.com/v2/hashtags?q=hashtag&keywords=${encodeURIComponent(tag)}`, {
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'LinkedIn-Version': '202304'
        }
      }
    )

    if (!hashtagResponse.ok) {
      throw new Error('Failed to fetch hashtag information')
    }

    const hashtagData = await hashtagResponse.json()
    const hashtagUrn = hashtagData.elements[0]?.entityUrn

    if (!hashtagUrn) {
      return NextResponse.json({ elements: [] })
    }

    // Fetch posts for the hashtag
    const postsResponse = await fetch(
      `https://api.linkedin.com/v2/ugcPosts?q=authors&hashtags=List(${encodeURIComponent(hashtagUrn)})&count=20`, {
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'LinkedIn-Version': '202304'
        }
      }
    )

    if (!postsResponse.ok) {
      throw new Error('Failed to fetch posts')
    }

    const postsData = await postsResponse.json()

    // Enrich posts with author information
    const enrichedPosts = await Promise.all(postsData.elements.map(async (post: any) => {
      if (post.author) {
        const authorResponse = await fetch(
          `https://api.linkedin.com/v2/people/${post.author.slice(14)}`, {
            headers: {
              'Authorization': `Bearer ${token.value}`,
              'X-Restli-Protocol-Version': '2.0.0',
              'LinkedIn-Version': '202304'
            }
          }
        )
        if (authorResponse.ok) {
          const authorData = await authorResponse.json()
          return {
            id: post.id,
            actor: {
              name: `${authorData.localizedFirstName} ${authorData.localizedLastName}`,
              profilePicture: authorData.profilePicture?.displayImage
            },
            content: {
              text: post.specificContent?.['com.linkedin.ugc.ShareContent']?.text || '',
              media: post.specificContent?.['com.linkedin.ugc.ShareContent']?.media || []
            },
            created: {
              time: post.created?.time || Date.now()
            }
          }
        }
      }
      return post
    }))

    return NextResponse.json({
      elements: enrichedPosts
    })
  } catch (error) {
    console.error('LinkedIn hashtag posts error:', error)
    return NextResponse.json(
      { error: String(error) }, 
      { status: 500 }
    )
  }
}