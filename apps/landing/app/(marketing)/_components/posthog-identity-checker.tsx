'use client'

import { useEffect } from "react"
import { PostHogUser } from "@/app/lib/posthog-utils"
import { useSession } from "@/app/web/providers/SessionProvider"

/**
 * Component that manages PostHog identity tracking
 * 
 * This implementation uses a consistent approach to user tracking:
 * - We always use the anonymous ID as the primary identifier
 * - When users login, we store the user ID as a property instead of changing identity
 * - This ensures perfect continuity across the entire user lifecycle
 * - No "Person not found" errors because the person profile never changes
 */
export default function PostHogIdentityChecker() {
  const { user } = useSession()

  useEffect(() => {
    // Check if we need to handle logout state (after server logout)
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)
    
    if (cookies.ph_reset === 'true') {
      // Handle logout - mark user as logged out but maintain the same person profile
      PostHogUser.reset(false)
      
      // Clear the cookie
      document.cookie = 'ph_reset=; path=/; max-age=0'
    }
    
    // Always initialize tracking for all users with the anonymous ID
    // This ensures one continuous profile per device/browser
    PostHogUser.setupAnonymousTracking({
      // Include detailed properties for better user tracking
      referrer: document.referrer,
      landing_url: window.location.href,
      utm_source: new URLSearchParams(window.location.search).get('utm_source'),
      utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
      utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
      device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      browser: navigator.userAgent,
      first_visit_date: new Date().toISOString().split('T')[0]
    })
    
    // Check for identity in cookies (for OAuth flows)
    PostHogUser.checkForServerIdentity()
    
    // When a user is logged in, update properties but keep using the same anonymous ID
    if (user?.id) {
      PostHogUser.identify(user.id, {
        $set: {
          is_authenticated: true,
          is_anonymous: false,
          last_login: new Date().toISOString(),
          onboarding_complete: user.onboardingComplete || false,
          is_verified: user.isEmailVerified || false, 
          signup_date: user.createdAt?.toISOString(),
          account_age_days: user.createdAt ? 
            Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0
        }
      })
    }
  }, [user])
  
  return null
} 