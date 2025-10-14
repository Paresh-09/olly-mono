'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to delay hydration of interactive features
 * This allows static content to render first, improving LCP
 */
export function useDelayedHydration(delay: number = 0) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Use requestIdleCallback if available, otherwise setTimeout
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        const id = window.requestIdleCallback(() => {
          setIsHydrated(true);
        }, { timeout: delay + 100 });
        
        return () => window.cancelIdleCallback(id);
      } else {
        const timer = setTimeout(() => {
          setIsHydrated(true);
        }, delay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [delay]);

  return isHydrated;
}