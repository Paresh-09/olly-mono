// PostHog utility functions
'use client'

import posthog from 'posthog-js'

/**
 * Utility functions for working with PostHog user identification
 * 
 * This implementation creates and maintains a single profile for each user:
 * - We always use the anonymous ID as the primary identifier
 * - User ID is stored as a property on the anonymous identity
 * - This ensures perfect continuity across the user's entire lifecycle
 */
export const PostHogUser = {
  /**
   * Set up anonymous tracking for new visitors
   * This creates a person profile for users and ensures the anonymous ID is stored
   * 
   * @param properties - Properties to set on the user
   */
  setupAnonymousTracking: (properties: Record<string, any> = {}) => {
    if (typeof window === 'undefined') return
    
    try {
      // Get the current distinct ID (which is the anonymous ID)
      const anonymousId = posthog.get_distinct_id()
      
      // Store it for future reference and continuity
      localStorage.setItem('posthog_anonymous_id', anonymousId)
      
      // Register common properties for this user
      posthog.register({
        first_visit_timestamp: new Date().toISOString(),
        is_anonymous: true,
        is_authenticated: false,
        anonymous_id: anonymousId,
        ...properties
      })
      
      // Explicitly capture a session start event with all properties
      posthog.capture('session_started', {
        is_anonymous: true,
        session_type: 'anonymous',
        distinct_id: anonymousId,
        ...properties
      })
    } catch (error) {
      console.error('Error setting up anonymous tracking:', error)
    }
  },

  /**
   * Update a user's properties in PostHog when they authenticate
   * Instead of changing the distinct ID, we add the user ID as a property
   * 
   * @param userId - The user's ID from your authentication system
   * @param properties - Additional properties to set
   */
  identify: (userId: string, properties: Record<string, any> = {}) => {
    if (typeof window === 'undefined') return
    
    try {
      // We always use the anonymous ID as the distinct ID for continuity
      const anonymousId = posthog.get_distinct_id()
      
      // Capture an identification event
      posthog.capture('user_identified', {
        $set: {
          is_anonymous: false,
          is_authenticated: true,
          user_id: userId, // Always store user ID as a property
          authenticated_at: new Date().toISOString(),
          ...(properties.$set || {})
        },
        user_id: userId // Include user_id in the event properties as well
      })
      
      // Update the user properties with the user ID and other properties
      posthog.people.set({
        // Always include these key properties
        is_anonymous: false,
        is_authenticated: true,
        user_id: userId, // Always store the user ID as a property
        
        // Include any other properties
        ...(properties.$set ? {} : properties),
        
        // If $set was provided, include those properties directly
        ...(properties.$set || {})
      })
      
      // Store the user ID for reference
      localStorage.setItem('posthog_user_id', userId)
    } catch (error) {
      console.error('Error updating user properties in PostHog:', error)
    }
  },

  /**
   * Reset authentication state but maintain the same person
   * This keeps the same anonymous ID but marks the user as logged out
   * 
   * @param resetDeviceId - Whether to create a completely new profile (defaults to false)
   */
  reset: (resetDeviceId: boolean = false) => {
    if (typeof window === 'undefined') return
    
    try {
      // Get the current user ID if available
      const userId = localStorage.getItem('posthog_user_id')
      
      // If we want a completely new profile (rarely needed)
      if (resetDeviceId) {
        // Do a full reset
        posthog.reset(true)
        
        // Generate a new anonymous ID after reset
        const newAnonymousId = posthog.get_distinct_id()
        localStorage.setItem('posthog_anonymous_id', newAnonymousId)
        localStorage.removeItem('posthog_user_id')
        
        // Set up fresh anonymous tracking
        PostHogUser.setupAnonymousTracking({
          reset_reason: 'full_reset',
          reset_timestamp: new Date().toISOString()
        })
      } else {
        // Just capture a logout event and update properties
        // DO NOT change the distinct ID, keep using the same anonymous ID
        posthog.capture('user_logout', {
          $set: { 
            is_authenticated: false,
            is_anonymous: true,
            logged_out_at: new Date().toISOString(),
            previous_user_id: userId || undefined
          }
        })
        
        // Update properties directly without changing identity
        posthog.people.set({
          is_anonymous: true,
          is_authenticated: false,
          logout_timestamp: new Date().toISOString(),
          previous_user_id: userId || undefined
        })
        
        // Remove the user ID but keep the anonymous ID
        localStorage.removeItem('posthog_user_id')
      }
    } catch (error) {
      console.error('Error handling logout in PostHog:', error)
    }
  },
  
  /**
   * Get the current user's anonymous ID
   */
  getAnonymousId: () => {
    if (typeof window === 'undefined') return null
    
    try {
      // Get from localStorage if available
      const storedAnonymousId = localStorage.getItem('posthog_anonymous_id')
      if (storedAnonymousId) return storedAnonymousId
      
      // Otherwise use the current distinct ID from PostHog
      return posthog.get_distinct_id()
    } catch (error) {
      console.error('Error getting PostHog anonymous ID:', error)
      return null
    }
  },
  
  /**
   * Get the user's authenticated ID if available
   */
  getUserId: () => {
    if (typeof window === 'undefined') return null
    
    try {
      return localStorage.getItem('posthog_user_id')
    } catch (error) {
      console.error('Error getting PostHog user ID:', error)
      return null
    }
  },
  
  /**
   * Get the current user's distinct ID (always the anonymous ID)
   */
  getDistinctId: () => {
    return PostHogUser.getAnonymousId()
  },

  /**
   * Check if the current user is anonymous (not authenticated)
   */
  isAnonymous: () => {
    if (typeof window === 'undefined') return true
    
    try {
      // Check if we have a stored user ID (means they're authenticated)
      const userId = localStorage.getItem('posthog_user_id')
      if (userId) return false
      
      // Check if we've explicitly set the is_anonymous property
      const isAnonymous = posthog.get_property('is_anonymous')
      if (isAnonymous !== undefined) {
        return isAnonymous === true
      }
      
      // Default to true (anonymous) if we can't determine
      return true
    } catch (error) {
      console.error('Error checking if PostHog user is anonymous:', error)
      return true
    }
  },

  /**
   * Check for and apply user identity from cookies (for OAuth flows)
   * Updates properties without changing the distinct ID
   */
  checkForServerIdentity: () => {
    if (typeof window === 'undefined') return
    
    try {
      // Read cookies
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=')
        acc[key] = decodeURIComponent(value)
        return acc
      }, {} as Record<string, string>)
      
      // Check if identity info is present
      if (cookies.ph_identify === 'true' && cookies.ph_user_id) {
        // Get the user ID from cookie
        const userId = cookies.ph_user_id
        
        // Get the user properties if available
        let properties = {}
        if (cookies.ph_properties) {
          try {
            properties = JSON.parse(cookies.ph_properties)
          } catch (e) {
            console.error('Error parsing PostHog properties from cookie:', e)
          }
        }
        
        // Update the user properties (but keep the same anonymous ID as the distinct ID)
        PostHogUser.identify(userId, { 
          $set: {
            authentication_method: 'oauth',
            authenticated_via_server: true,
            ...properties
          } 
        })
        
        // Clear the cookies
        document.cookie = 'ph_identify=; path=/; max-age=0'
        document.cookie = 'ph_user_id=; path=/; max-age=0'
        document.cookie = 'ph_properties=; path=/; max-age=0'
      }
    } catch (error) {
      console.error('Error checking for server identity:', error)
    }
  }
} 