"use client";

import React from 'react';
import { Button } from '@/components/Button';
import { usePricing } from '@/app/web/providers/pricingContext';

export function CTALifetime() {
  const {buyNowProps} = usePricing();

  return (
    <div className="mt-5 grid items-center justify-center gap-x-6 gap-y-2 sm:flex mb-5">
      <Button
        size="2xl"
        link={{ href: buyNowProps.url ?? '', target: "_blank" }}
        color='primary'
        className='shadow-lg shadow-teal-500'
      >
        Get Lifetime Access
      </Button>
    </div>
  );
}
