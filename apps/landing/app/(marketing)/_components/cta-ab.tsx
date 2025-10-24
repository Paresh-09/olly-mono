import React from 'react';
import { ChromeIcon, SparklesIcon } from 'lucide-react';
import { Button } from '@/components/Button';
import { usePricing } from '@/app/web/providers/pricingContext';

export function CTAButtonsAB() {
  const { buyNowProps } = usePricing();
  const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || process.env.DASHBOARD_URL || "http://localhost:3000";

  const primaryButtonProps = {
    text: "Start @ $9.99/month",
    link: { href: buyNowProps.monthlyUrl ?? '', target: "_blank" }
  };

  return (
    <div className="mt-5 flex flex-col items-center justify-center gap-y-4 mb-5">
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <div className="flex flex-col items-center">
          <Button
            size="2xl"
            color="premium"
            className="shadow-lg"
            link={primaryButtonProps.link}
          >
            <SparklesIcon className="mr-2 h-5 w-5" />
            {primaryButtonProps.text}
          </Button>
        </div>
        <Button
          size="2xl"
          color="white"
          className="shadow-md shadow-[#33dfa0]/100"
          link={{href: `${dashboardUrl}/signup`}}
        >
          <ChromeIcon className="mr-2 h-4 w-4" />
          Start for Free
        </Button>
      </div>
    </div>
  );
}