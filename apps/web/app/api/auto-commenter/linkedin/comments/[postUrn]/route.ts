import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request, props: { params: Promise<{ postUrn: string }> }) {
  const params = await props.params;
  const token = (await cookies()).get('linkedin_token')

  if (!token) {
    return NextResponse.json(
      { error: 'Not authenticated' }, 
      { status: 401 }
    )
  }

  try {
    // Convert URN to correct format for API
    const decodedUrn = decodeURIComponent(params.postUrn)
    const activityId = decodedUrn.split(':').pop()
    

    // Use POST with X-HTTP-Method-Override for long URNs
    const response = await fetch(
      `https://api.linkedin.com/v2/socialActions/urn:li:share:${activityId}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'X-HTTP-Method-Override': 'GET',
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: new URLSearchParams({
        'projection': '(elements(*(*,actor~(*,profilePicture(displayImage~:playableStreams)))))'
      }).toString()
    })


    if (!response.ok) {
      const errorText = await response.text()
      console.error('LinkedIn API Error:', errorText)
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('LinkedIn comments fetch error:', error)
    return NextResponse.json(
      { error: String(error) }, 
      { status: 500 }
    )
  }
}