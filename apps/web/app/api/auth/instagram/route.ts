import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`

export async function GET() {
    const state = Math.random().toString(36).substring(7);
    
    (await cookies()).set('instagram_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 10, // 10 minutes
    })

    // Using Instagram Business Login
    const authUrl = `https://www.instagram.com/oauth/authorize?` +
        new URLSearchParams({
            client_id: INSTAGRAM_CLIENT_ID!,
            redirect_uri: REDIRECT_URI,
            state,
            scope: [
                'instagram_business_basic',
                'instagram_business_content_publish',
                'instagram_business_manage_messages',
                'instagram_business_manage_comments'
            ].join(','),
            response_type: 'code'
        }).toString()
    
    return NextResponse.redirect(authUrl)
}