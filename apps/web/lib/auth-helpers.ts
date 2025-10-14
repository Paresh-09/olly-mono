import { lucia } from '@/lib/auth'

export async function validateAuthToken(token: string) {
  try {
    const { session, user } = await lucia.validateSession(token)
    if (!session) {
      return null
    }
    return user
  } catch {
    return null
  }
}