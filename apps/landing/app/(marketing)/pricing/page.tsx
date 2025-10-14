import React from 'react';
import { Metadata } from 'next';
import { PricingProvider } from '@/app/web/providers/pricingContext';
import { PricingPageComponent } from '../_components/pricing-page';
import PlanComparisonTable from '../_components/pricing-page-table';
import CustomPricingTable from '../_components/pricing-page-custom-price';
import FAQComponent from '../_components/pricing-page-faq';
import { Pricing } from '../_components/pricing-2';
import { CompactSalesContact } from '../contact-sales/_components/component-contact-sales';

export const metadata: Metadata = {
  title: 'Pricing | Olly - Amplify Your Social Media Presence',
  description: 'Choose the perfect Olly plan to enhance your social media engagement. From free to custom enterprise solutions, find the right fit for your needs.',
  keywords: 'Olly pricing, social media AI, engagement tools, AI comments, social media amplification',
  openGraph: {
    title: 'Olly Pricing - Boost Your Social Media Engagement',
    description: 'Discover Olly\'s flexible pricing plans. Amplify your social media presence with AI-powered tools and analytics.',
    url: 'https://www.olly.social/pricing',
    siteName: 'Olly',
    images: [
      {
        url: 'https://www.olly.social/features/twitter-main.png', // Make sure to create and host this image
        width: 1200,
        height: 630,
        alt: 'Olly Pricing Plans',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Olly Pricing - AI-Powered Social Media Tools',
    description: 'Enhance your social media strategy with Olly. View our pricing plans and choose the best option for your needs.',
    images: ['https://www.olly.social/features/twitter-main.png'], // Make sure to create and host this image
  },
};

export default function PricingPage() {
  return (
    <PricingProvider>
      <div className="min-h-screen">
        <main className="pb-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* <div className="text-center pt-16 pb-8">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                Amplify Your Social Media Presence
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl">
                Choose the Olly plan that best fits your needs. All paid plans come with a 7-day money-back guarantee.
              </p>
            </div> */}
            <Pricing />
            <CompactSalesContact />
            <PlanComparisonTable />
            <CustomPricingTable />
            <FAQComponent />
          </div>
        </main>
      </div>
    </PricingProvider>
  );
}