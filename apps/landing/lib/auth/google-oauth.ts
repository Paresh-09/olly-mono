import { Google } from 'arctic'

export const googleOAuthClient = new Google(
    process.env.OAUTH_GOOGLE_CLIENT_ID!,
    process.env.OAUTH_GOOGLE_CLIENT_SECRET!,
    process.env.NEXT_PUBLIC_APP_URL + '/api/auth/google/callback'
    // 'http://localhost:3000' + '/api/auth/google/callback'

)