// app/giveaway/page.tsx
import React from 'react';
import { Metadata } from 'next';
import GiveawaySteps from '../_components/giveaway';

export const metadata: Metadata = {
  title: 'Olly Giveaway - Win a Free Lifetime License for AI-Powered Social Media Tools',
  description: 'Participate in Ollys exciting giveaway! Support Olly, share with your network, and get a chance to win a free lifetime license for our AI comment generator and Reddit summarizer. Boost your social media game for free!',
  alternates: {
    canonical: "/giveaways",
  },
  keywords: "Olly giveaway, free lifetime license, AI social media tools, AI comment generator, Reddit summarizer, social media contest, Olly promotion, free AI tools, social media engagement, AI-powered marketing, content creation tools, digital marketing giveaway, social media management, AI technology, online marketing tools",
  openGraph: {
    title: 'Win a Lifetime of AI-Powered Social Media Tools with Olly',
    description: 'Join Ollys giveaway for a chance to win a free lifetime license! Get access to our AI comment generator and Reddit summarizer. Elevate your social media presence now!',
    url: 'https://www.olly.social/giveaways',
    siteName: 'Olly Social',
    images: [
      {
        url: 'https://www.olly.social/features/twitter-main.png',
        width: 1200,
        height: 630,
        alt: 'Olly Giveaway - Free Lifetime License',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Olly Giveaway: Your Chance for Free Lifetime AI Social Media Tools',
    description: 'Participate in our giveaway and win a free lifetime license for Ollys AI comment generator and Reddit summarizer. Transform your social media strategy!',
    images: ['https://www.olly.social/features/twitter-main.png'],
  },
};

const GiveawayPage: React.FC = () => {
  return (
    <main className="min-h-screen">
      <GiveawaySteps />
    </main>
  );
};

export default GiveawayPage;