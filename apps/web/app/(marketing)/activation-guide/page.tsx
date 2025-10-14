// pages/activation-guide.tsx
import React from 'react';
import ActivationGuide from '../_components/activation-guide';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Activation Guide | Olly - Get Started with AI-Powered Social Media',
    description: 'Learn how to activate and use Olly Social with our comprehensive guide. Unlock the full potential of AI-driven social media management and engagement tools.',
    alternates: { canonical: "/activation-guide" },
    keywords: 'Olly activation guide, how to use Olly, social media AI tutorial, get started with Olly, AI social media tools',
    openGraph: {
      title: 'Olly Activation Guide - Maximize Your Social Media Presence',
      description: 'Follow our step-by-step guide to activate Olly and harness the power of AI for your social media strategy. Start amplifying your online presence today!',
      url: 'https://www.olly.social/activation-guide',
      siteName: 'Olly',
      images: [
        {
          url: 'https://www.olly.social/features/twitter-main.png',
          width: 1200,
          height: 630,
          alt: 'Olly Activation Guide',
        },
      ],
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Olly Activation Guide - Your Path to AI-Powered Social Media Success',
      description: 'Get started with Olly! Our activation guide walks you through setting up and using our AI-powered social media tools for maximum impact.',
      images: ['https://www.olly.social/features/twitter-main.png'],
    },
};

const ActivationGuidePage: React.FC = () => {
    return <ActivationGuide />;
};

export default ActivationGuidePage;
