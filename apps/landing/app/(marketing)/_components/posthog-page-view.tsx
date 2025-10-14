// app/PostHogPageView.tsx
'use client'

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { usePostHog } from 'posthog-js/react';
import { useSession } from "@/app/web/providers/SessionProvider";
import { PostHogUser } from "@/app/lib/posthog-utils";

export default function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();
  const { user } = useSession();
  
  // Keep track of previous path for journey tracking
  const prevPathRef = useRef<string | null>(null);
  
  // Track pageviews with enhanced context
  useEffect(() => {
    if (pathname && posthog) {
      // Build the full URL
      let url = window.origin + pathname
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }
      
      // Construct richer pageview event with user journey context
      const pageviewProperties: Record<string, any> = {
        '$current_url': url,
        path: pathname,
        referrer: document.referrer,
        
        // User state info
        is_authenticated: !!user,
        is_anonymous: PostHogUser.isAnonymous(),
        
        // Journey tracking
        previous_path: prevPathRef.current,
        session_duration_seconds: typeof window !== 'undefined' && window.performance ? 
          Math.floor(performance.now() / 1000) : undefined,
        
        // UTM parameters for marketing attribution
        utm_source: searchParams.get('utm_source') || undefined,
        utm_medium: searchParams.get('utm_medium') || undefined,
        utm_campaign: searchParams.get('utm_campaign') || undefined,
        
        // Device and viewport info for UX analysis
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight
      }
      
      // Capture the pageview with enhanced properties
      posthog.capture('$pageview', pageviewProperties)
      
      // Update previous path for next pageview
      prevPathRef.current = pathname;
    }
  }, [pathname, searchParams, posthog, user])
  
  return null
}