// Server-side PostHog identity management
// This file handles setting PostHog identity in cookies during server-side operations

import { NextRequest, NextResponse } from "next/server";

// Initialize global storage
if (typeof global.posthogIdentityInfo === 'undefined') {
  global.posthogIdentityInfo = {};
}

/**
 * Utility functions for working with PostHog identity on the server side
 * This allows us to pass user information that will be picked up by the client
 * without changing the user's anonymous distinct ID
 */
export const PostHogUserServer = {
  /**
   * Sets the identity information in cookies that will be used by the client-side PostHog
   * With our strategy, we keep the anonymous ID as the distinct ID and add user ID as a property
   * 
   * @param userId - The user ID from your authentication system
   * @param properties - User properties to set in PostHog
   * @param req - The NextRequest object (for reading request data)
   * @param cookies - The cookies store (we don't use it directly but keep for API compatibility)
   */
  setIdentityInCookie: (
    userId: string, 
    properties: Record<string, any> = {}, 
    req: NextRequest,
    // Accept any type of cookies object since we don't use it directly
    _cookieStore: any
  ) => {
    try {
      // Ensure the identity info storage exists
      if (!global.posthogIdentityInfo) {
        global.posthogIdentityInfo = {};
      }
      
      // Store the data for this request
      global.posthogIdentityInfo[req.url] = {
        userId, // Store the user ID instead of distinct ID
        properties: JSON.stringify({
          user_id: userId, // Always include the user ID in properties
          is_authenticated: true,
          is_anonymous: false,
          ...properties
        })
      };
      
    } catch (error) {
      console.error('Error setting PostHog identity in cookie:', error);
    }
  },
  
  /**
   * Applies the identity cookies to the response
   * Call this after creating the response object
   * 
   * @param response - The NextResponse to add cookies to
   */
  applyIdentityCookiesToResponse: (response: NextResponse) => {
    try {
      // Get the identity info from temporary storage
      if (global.posthogIdentityInfo && global.posthogIdentityInfo[response.url]) {
        const identityInfo = global.posthogIdentityInfo[response.url];
        
        // Set the cookies in the response with a short expiry (they only need to last until the page loads)
        response.cookies.set('ph_identify', 'true', { maxAge: 60 }); // 60 seconds
        response.cookies.set('ph_user_id', identityInfo.userId, { maxAge: 60 }); // Use user_id instead of distinct_id
        response.cookies.set('ph_properties', identityInfo.properties, { maxAge: 60 });
        
        // Clean up
        delete global.posthogIdentityInfo[response.url];
      }
    } catch (error) {
      console.error('Error applying PostHog identity cookies to response:', error);
    }
  }
};

// Declare the global type for TypeScript
declare global {
  var posthogIdentityInfo: Record<string, { userId: string, properties: string }> | undefined;
} 