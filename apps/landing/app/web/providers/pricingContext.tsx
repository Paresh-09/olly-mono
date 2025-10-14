"use client"

import React, { createContext, useContext, ReactNode } from 'react';

interface BuyNowButtonProps {
  url: string;
  price: string;
  originalPrice: string;
  monthlyUrl?: string;
  monthlyPrice?: string;
  agencyUrl?: string;
  agencyPrice?: string;
  teamPrice?: string;
  teamUrl?: string;
  companyPrice?: string;
  companyUrl?: string;
  agencyMonthlyPrice?: string;
  agencyMonthlyUrl?: string;
  teamMonthlyPrice?: string;
  teamMonthlyUrl?: string;
  companyMonthlyPrice?: string;
  companyMonthlyUrl?: string;
}

interface PricingContextType {
  buyNowProps: BuyNowButtonProps;
  getLifetimeUrl: (users: number) => string;
  getMonthlyUrl: (users: number) => string;
  isUserLoggedIn?: boolean;
}

const defaultBuyNowProps: BuyNowButtonProps = {
  url: 'https://olly-ai.lemonsqueezy.com/buy/fa11a2cb-4f49-4959-a95a-215b29c51e89',
  price: '$49.99',
  originalPrice: '$199.99',
  monthlyUrl: 'https://olly-ai.lemonsqueezy.com/buy/ccfcb6bb-06c7-4c35-b0f2-949cd3ca7452',
  monthlyPrice: '$9.99',
  agencyPrice: '$299',
  agencyUrl: 'https://olly-ai.lemonsqueezy.com/buy/401cc038-a90f-4cda-98f9-180e2bede638',
  teamPrice: '$199',
  teamUrl: 'https://olly-ai.lemonsqueezy.com/buy/bc98afd2-5a3b-42c5-adf9-60a0aa3df338',
  companyPrice: '$499',
  companyUrl: 'https://olly-ai.lemonsqueezy.com/buy/c29d14d4-7831-4791-84b4-f3bd19c2c36e',
  agencyMonthlyPrice: '$69.99',
  agencyMonthlyUrl: 'https://olly-ai.lemonsqueezy.com/buy/8975b410-3f67-4f78-9550-bfa2bb0aa662',
  teamMonthlyPrice: '$39.99',
  teamMonthlyUrl: 'https://olly-ai.lemonsqueezy.com/buy/dcd88a81-81bb-4a67-896c-4b722fe33f76',
  companyMonthlyPrice: '$99.99',
  companyMonthlyUrl: 'https://olly-ai.lemonsqueezy.com/buy/b5b32644-48ac-4389-ba25-2e2e5c0b640a',
};

const PricingContext = createContext<PricingContextType | undefined>(undefined);

export const usePricing = (): PricingContextType => {
  const context = useContext(PricingContext);
  if (!context) {
    throw new Error('usePricing must be used within a PricingProvider');
  }
  return context;
};

interface PricingProviderProps {
  children: ReactNode;
}

export const PricingProvider: React.FC<PricingProviderProps> = ({ children }) => {
  const buyNowProps = defaultBuyNowProps;

  const getLifetimeUrl = (users: number): string => {
    let url = '';
    switch (users) {
      case 1:
        url = buyNowProps.url;
        break;
      case 5:
        url = buyNowProps.teamUrl || '';
        break;
      case 25:
        url = buyNowProps.agencyUrl || '';
        break;
      case 100:
        url = buyNowProps.companyUrl || '';
        break;
      default:
        url = buyNowProps.url;
    }
    return url;
  };

  const getMonthlyUrl = (users: number): string => {
    let url = '';
    switch (users) {
      case 1:
        url = buyNowProps.monthlyUrl || '';
        break;
      case 5:
        url = buyNowProps.teamMonthlyUrl || '';
        break;
      case 25:
        url = buyNowProps.agencyMonthlyUrl || '';
        break;
      case 100:
        url = buyNowProps.companyMonthlyUrl || '';
        break;
      default:
        url = buyNowProps.monthlyUrl || '';
    }
    return url;
  };

  return (
    <PricingContext.Provider value={{
      buyNowProps,
      getLifetimeUrl,
      getMonthlyUrl,
      isUserLoggedIn: false
    }}>
      {children}
    </PricingContext.Provider>
  );
};
