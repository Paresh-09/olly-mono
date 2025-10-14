import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
    const token = (await cookies()).get('instagram_access_token')?.value
    const account = JSON.parse((await cookies()).get('instagram_business_account')?.value || '{}')
    
    const response = await fetch(
        `https://graph.facebook.com/v18.0/${account.id}/insights?metric=impression,reach,profile_views&period=day&access_token=${token}`
    )
    
    return NextResponse.json(await response.json())
}