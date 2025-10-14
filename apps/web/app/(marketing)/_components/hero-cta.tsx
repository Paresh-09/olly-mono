"use client";
import React, { useEffect, useState } from 'react';
import { ArrowRight, ChromeIcon, LayoutDashboardIcon } from 'lucide-react';
import { Button } from '@/components/Button';
import { usePricing } from '@/app/web/providers/pricingContext';

export function HeroCTA() {
  const [hasExtension, setHasExtension] = useState(false);
  const { buyNowProps } = usePricing();

  useEffect(() => {
    // Check if we're in the browser (client-side)
    if (typeof window === 'undefined') {
      return;
    }

    // Check if the Olly extension is installed by looking for its injected element
    const checkForExtension = () => {
      const ollyButton = document.getElementById('olly-button');
      if (ollyButton) {
        console.log('Olly extension detected!');
        setHasExtension(true);
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkForExtension()) {
      return;
    }

    // If not found immediately, wait a bit for the extension to load
    const timeout = setTimeout(() => {
      checkForExtension();
    }, 1000);

    // Also use MutationObserver to detect when the element is added
    const observer = new MutationObserver(() => {
      if (checkForExtension()) {
        observer.disconnect();
        clearTimeout(timeout);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Cleanup
    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="mt-5 flex flex-col items-center justify-center gap-y-4 mb-5">
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <Button
          size="2xl"
          color="primary"
          className="shadow-lg"
          link={hasExtension 
            ? { href: '/dashboard' } 
            : { href: 'https://chromewebstore.google.com/detail/olly-20-amplify-your-soci/ofjpapfmglfjdhmadpegoeifocomaeje?hl=en', target: '_blank' }
          }
        >
          {hasExtension ? (
            <LayoutDashboardIcon className="mr-2 h-4 w-4" />
          ) : (
            <ChromeIcon className="mr-2 h-4 w-4" />
          )}
          {hasExtension ? 'Go to Dashboard' : 'Get Started'}
        </Button>
        <Button
          size="2xl"
          color="white"
          className="shadow-md shadow-[#33dfa0]/100"
          link={{ href: buyNowProps.url ?? '', target: "_blank" }}
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          Get Lifetime Access
        </Button>
      </div>
      <div className="flex flex-col items-center text-center">
        <p className="text-2xs text-gray-600">Lifetime plans available for a limited time. Monthly plans available on a free trial.</p>
      </div>
    </div>
  );
}