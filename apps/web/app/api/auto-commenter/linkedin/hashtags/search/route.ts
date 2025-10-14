import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const token = (await cookies()).get('linkedin_token')
  
  
  
  if (!token) {
    console.log('No token found')
    return NextResponse.json(
      { error: 'Not authenticated' }, 
      { status: 401 }
    )
  }

  if (!query) {
    console.log('No query provided')
    return NextResponse.json(
      { error: 'Search query is required' }, 
      { status: 400 }
    )
  }

  try {
    // Using the new search endpoint
    const url = `https://api.linkedin.com/v2/hashtagsV2?q=findByHashtag&keywords=${encodeURIComponent(query)}&count=10`

    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202304'
      }
    })


    const responseText = await response.text()


    if (!response.ok) {
      throw new Error(`Failed to search hashtags: ${response.status} ${responseText}`)
    }

    const data = JSON.parse(responseText)
   
    
    // Transform response to match expected format
    const transformedData = {
      elements: data.elements?.map((element: any) => {
       
        return {
          id: element.hashtag?.replace('#', ''),
          name: element.hashtag?.replace('#', ''),
          postCount: element.totalPostCount || 0
        }
      }) || []
    }

    console.log('Transformed data:', transformedData)
    return NextResponse.json(transformedData)
  } catch (error: any) {
    console.error('LinkedIn hashtag search error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json(
      { error: String(error) }, 
      { status: 500 }
    )
  }
}