'use client'

import { useEffect } from 'react'
import { PostHogUser } from './posthog-utils'

/**
 * Example component demonstrating proper PostHog user identification patterns
 * This is for reference only - not meant to be used directly
 */
export function PostHogIdentificationExample() {
  // Example: Check for existing anonymous ID in localStorage
  useEffect(() => {
    // This would typically run on initial app load
    // You can track anonymous visitors with their anonymous ID
    const anonymousId = localStorage.getItem('anonymous_visitor_id')
    
    if (!anonymousId) {
      // First-time visitor - generate and store anonymous ID
      const newAnonymousId = `anon_${Math.random().toString(36).substring(2, 15)}`
      localStorage.setItem('anonymous_visitor_id', newAnonymousId)
      
      // Log the anonymous visit (optional)
   
    }
  }, [])
  
  /**
   * Example: Handle user signup
   * Call this when a user successfully signs up
   */
  const handleSignup = (userId: string, email: string, username?: string) => {
    // 1. Get anonymous ID if it exists (for tracking conversion)
    const anonymousId = localStorage.getItem('anonymous_visitor_id')
    
    // 2. Identify the user in PostHog
    // This links past anonymous events to this user
    PostHogUser.identify(userId, {
      email,
      name: username,
      signup_method: 'email',
      signup_date: new Date().toISOString(),
    })
    
    // 3. Track conversion metrics (optional)
    
    
    // 4. Clear anonymous ID if desired
    // This depends on your tracking needs - you may want to keep it
    localStorage.removeItem('anonymous_visitor_id')
    
    // 5. Store signup flag for future reference
    localStorage.setItem('has_signed_up', 'true')
  }
  
  /**
   * Example: Handle user login
   * Call this when a user successfully logs in
   */
  const handleLogin = (userId: string, email: string) => {
    // 1. Get anonymous ID if it exists
    const anonymousId = localStorage.getItem('anonymous_visitor_id')
    
    // 2. Identify the user in PostHog
    // This links any events captured in this session to the user
    PostHogUser.identify(userId, {
      email,
      last_login: new Date().toISOString(),
    })
    
    // 3. Decide what to do with anonymous ID
    // If this was an anonymous user who previously signed up, you might want to clear it
    if (anonymousId && localStorage.getItem('has_signed_up') === 'true') {
      localStorage.removeItem('anonymous_visitor_id')
    }
    
    // If this was a new anonymous user on a new device, you might keep it
    // for cross-device tracking (depends on your privacy policy)
  }
  
  /**
   * Example: Handle user logout
   * Call this when a user logs out
   */
  const handleLogout = () => {
    // Reset PostHog user to prevent future events from being associated with this user
    PostHogUser.reset()
    
    // You may also want to reset other user-specific data in localStorage
    // depending on your app's needs
  }
  
  return null // This is just an example component
} 