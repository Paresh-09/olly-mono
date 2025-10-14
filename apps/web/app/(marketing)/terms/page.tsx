import React from 'react';
import { Metadata } from 'next';
import TermsOfService from '../_components/terms-content';

export const metadata: Metadata = {
  title: 'Terms of Service | Olly AI',
  description: 'Read and understand the Terms of Service for Olly AI. Learn about your rights and responsibilities when using our platform.',
  openGraph: {
    title: 'Terms of Service | Olly AI',
    description: 'Understand the terms and conditions for using Olly AI',
    images: [
      {
        url: "https://www.olly.social/features/twitter-main.png",
        width: 1200,
        height: 630,
        alt: 'Olly AI Terms of Service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service | Olly AI',
    description: 'Understand the terms and conditions for using Olly AI',
    images: ["https://www.olly.social/features/twitter-main.png"],
  },
}

const TermsPage: React.FC = () => {
    return <TermsOfService />;
};

export default TermsPage;