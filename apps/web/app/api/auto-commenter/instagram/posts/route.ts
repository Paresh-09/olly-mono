import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
    const token = (await cookies()).get('instagram_access_token')?.value
    const account = JSON.parse((await cookies()).get('instagram_business_account')?.value || '{}')
    
    const response = await fetch(
        `https://graph.facebook.com/v18.0/${account.id}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&access_token=${token}`
    )
    
    return NextResponse.json(await response.json())
}
