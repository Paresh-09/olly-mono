// "use client"

// import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
// import { useSession } from './SessionProvider';

// interface BuyNowButtonProps {
//   url: string;
//   price: string;
//   originalPrice: string;
//   monthlyUrl?: string;
//   monthlyPrice?: string;
//   agencyUrl?: string;
//   agencyPrice?: string;
//   teamPrice?: string;
//   teamUrl?: string;
//   companyPrice?: string;
//   companyUrl?: string;
//   agencyMonthlyPrice?: string;
//   agencyMonthlyUrl?: string;
//   teamMonthlyPrice?: string;
//   teamMonthlyUrl?: string;
//   companyMonthlyPrice?: string;
//   companyMonthlyUrl?: string;
// }

// interface PricingContextType {
//   buyNowProps: BuyNowButtonProps;
//   getLifetimeUrl: (users: number) => string;
//   getMonthlyUrl: (users: number) => string;
// }

// const defaultBuyNowProps: BuyNowButtonProps = {
//   url: 'https://olly-ai.lemonsqueezy.com/buy/fa11a2cb-4f49-4959-a95a-215b29c51e89',
//   price: '$49.99',
//   originalPrice: '$199.99',
//   monthlyUrl: 'https://olly-ai.lemonsqueezy.com/buy/ccfcb6bb-06c7-4c35-b0f2-949cd3ca7452',
//   monthlyPrice: '$9.99',
//   agencyPrice: '$299',
//   agencyUrl: 'https://olly-ai.lemonsqueezy.com/buy/401cc038-a90f-4cda-98f9-180e2bede638',
//   teamPrice: '$199',
//   teamUrl: 'https://olly-ai.lemonsqueezy.com/buy/bc98afd2-5a3b-42c5-adf9-60a0aa3df338',
//   companyPrice: '$499',
//   companyUrl: 'https://olly-ai.lemonsqueezy.com/buy/c29d14d4-7831-4791-84b4-f3bd19c2c36e',
//   agencyMonthlyPrice: '$69.99',
//   agencyMonthlyUrl: 'https://olly-ai.lemonsqueezy.com/buy/8975b410-3f67-4f78-9550-bfa2bb0aa662',
//   teamMonthlyPrice: '$39.99',
//   teamMonthlyUrl: 'https://olly-ai.lemonsqueezy.com/buy/dcd88a81-81bb-4a67-896c-4b722fe33f76',
//   companyMonthlyPrice: '$99.99',
//   companyMonthlyUrl: 'https://olly-ai.lemonsqueezy.com/buy/b5b32644-48ac-4389-ba25-2e2e5c0b640a',
// };

// const PricingContext = createContext<PricingContextType>({
//   buyNowProps: defaultBuyNowProps,
//   getLifetimeUrl: () => "",
//   getMonthlyUrl: () => "",
// });

// export const usePricing = () => useContext(PricingContext);

// export const PricingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const { user } = useSession();
//   const [buyNowProps, setBuyNowProps] = useState<BuyNowButtonProps>(defaultBuyNowProps);

//   // Update the URLs when user changes
//   useEffect(() => {
//     if (!user?.email) {
//       // If no user or no email, use default props (no modification needed)
//       setBuyNowProps(defaultBuyNowProps);
//       return;
//     }

//     // User is logged in with an email, create modified props with email in URLs
//     const propsWithEmail: BuyNowButtonProps = {
//       ...defaultBuyNowProps
//     };

//     // Helper function to append email parameter to URL
//     const appendEmailToUrl = (url: string) => {
//       return `${url}?checkout[email]=${encodeURIComponent(user.email)}`;
//     };

//     // Add email to all URL properties
//     if (propsWithEmail.url) {
//       propsWithEmail.url = appendEmailToUrl(propsWithEmail.url);
//     }

//     if (propsWithEmail.monthlyUrl) {
//       propsWithEmail.monthlyUrl = appendEmailToUrl(propsWithEmail.monthlyUrl);
//     }

//     if (propsWithEmail.agencyUrl) {
//       propsWithEmail.agencyUrl = appendEmailToUrl(propsWithEmail.agencyUrl);
//     }

//     if (propsWithEmail.teamUrl) {
//       propsWithEmail.teamUrl = appendEmailToUrl(propsWithEmail.teamUrl);
//     }

//     if (propsWithEmail.companyUrl) {
//       propsWithEmail.companyUrl = appendEmailToUrl(propsWithEmail.companyUrl);
//     }

//     if (propsWithEmail.agencyMonthlyUrl) {
//       propsWithEmail.agencyMonthlyUrl = appendEmailToUrl(propsWithEmail.agencyMonthlyUrl);
//     }

//     if (propsWithEmail.teamMonthlyUrl) {
//       propsWithEmail.teamMonthlyUrl = appendEmailToUrl(propsWithEmail.teamMonthlyUrl);
//     }

//     if (propsWithEmail.companyMonthlyUrl) {
//       propsWithEmail.companyMonthlyUrl = appendEmailToUrl(propsWithEmail.companyMonthlyUrl);
//     }

//     setBuyNowProps(propsWithEmail);
//   }, [user]);

//   // Helper functions to get URLs based on user count (using the already-processed buyNowProps that include email if user is logged in)
//   const getLifetimeUrl = (users: number): string => {
//     switch (users) {
//       case 1:
//         return buyNowProps.url;
//       case 5:
//         return buyNowProps.teamUrl || '';
//       case 10:
//         return buyNowProps.agencyUrl || '';
//       case 20:
//         return buyNowProps.companyUrl || '';
//       default:
//         return buyNowProps.url;
//     }
//   };

//   const getMonthlyUrl = (users: number): string => {
//     switch (users) {
//       case 1:
//         return buyNowProps.monthlyUrl || '';
//       case 5:
//         return buyNowProps.teamMonthlyUrl || '';
//       case 10:
//         return buyNowProps.agencyMonthlyUrl || '';
//       case 20:
//         return buyNowProps.companyMonthlyUrl || '';
//       default:
//         return buyNowProps.monthlyUrl || '';
//     }
//   };

//   return (
//     <PricingContext.Provider value={{
//       buyNowProps,
//       getLifetimeUrl,
//       getMonthlyUrl
//     }}>
//       {children}
//     </PricingContext.Provider>
//   );
// };


"use client"

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useSession } from './SessionProvider';

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
  isUserLoggedIn: boolean;
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

// Create the context with default values
const PricingContext = createContext<PricingContextType>({
  buyNowProps: defaultBuyNowProps,
  getLifetimeUrl: () => "",
  getMonthlyUrl: () => "",
  isUserLoggedIn: false,
});

// Define the hook outside any component or function
export function usePricing() {
  const context = useContext(PricingContext);

  if (context === undefined) {
    throw new Error('usePricing must be used within a PricingProvider');
  }

  return context;
}

export const PricingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useSession();
  const [buyNowProps, setBuyNowProps] = useState<BuyNowButtonProps>(defaultBuyNowProps);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false);

  // Update the URLs when user changes
  useEffect(() => {

    if (!user?.email) {
      // If no user or no email, use default props (no modification needed)
      setBuyNowProps(defaultBuyNowProps);
      setIsUserLoggedIn(false);
      return;
    }

    // User is logged in with an email
    setIsUserLoggedIn(true);

    // Create modified props with email in URLs
    const propsWithEmail: BuyNowButtonProps = {
      ...defaultBuyNowProps
    };

    // Helper function to append email parameter to URL
    const appendEmailToUrl = (url: string) => {
      if (!url) return '';
      // Make sure we're not adding the parameter twice
      const baseUrl = url.split('?')[0];
      return `${baseUrl}?checkout[email]=${encodeURIComponent(user.email)}`;
    };

    // Add email to all URL properties
    if (propsWithEmail.url) {
      propsWithEmail.url = appendEmailToUrl(propsWithEmail.url);
    }

    if (propsWithEmail.monthlyUrl) {
      propsWithEmail.monthlyUrl = appendEmailToUrl(propsWithEmail.monthlyUrl);
    }

    if (propsWithEmail.agencyUrl) {
      propsWithEmail.agencyUrl = appendEmailToUrl(propsWithEmail.agencyUrl);
    }

    if (propsWithEmail.teamUrl) {
      propsWithEmail.teamUrl = appendEmailToUrl(propsWithEmail.teamUrl);
    }

    if (propsWithEmail.companyUrl) {
      propsWithEmail.companyUrl = appendEmailToUrl(propsWithEmail.companyUrl);
    }

    if (propsWithEmail.agencyMonthlyUrl) {
      propsWithEmail.agencyMonthlyUrl = appendEmailToUrl(propsWithEmail.agencyMonthlyUrl);
    }

    if (propsWithEmail.teamMonthlyUrl) {
      propsWithEmail.teamMonthlyUrl = appendEmailToUrl(propsWithEmail.teamMonthlyUrl);
    }

    if (propsWithEmail.companyMonthlyUrl) {
      propsWithEmail.companyMonthlyUrl = appendEmailToUrl(propsWithEmail.companyMonthlyUrl);
    }

    setBuyNowProps(propsWithEmail);
  }, [user]);

  // Helper functions to get URLs based on user count (using the already-processed buyNowProps that include email if user is logged in)
  const getLifetimeUrl = (users: number): string => {
    let url = '';

    switch (users) {
      case 1:
        url = buyNowProps.url;
        break;
      case 5:
        url = buyNowProps.teamUrl || '';
        break;
      case 10:
        url = buyNowProps.agencyUrl || '';
        break;
      case 20:
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
      case 10:
        url = buyNowProps.agencyMonthlyUrl || '';
        break;
      case 20:
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
      isUserLoggedIn
    }}>
      {children}
    </PricingContext.Provider>
  );
};