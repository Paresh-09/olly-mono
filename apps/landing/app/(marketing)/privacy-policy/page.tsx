import React from 'react';
import { Metadata } from 'next';
import PrivacyPolicy from '../_components/privacy-policy';

export const metadata: Metadata = {
  title: 'Privacy Policy | Olly AI',
  description: 'Learn about how Olly AI collects, uses, and protects your personal information. Our privacy policy outlines our commitment to your data security and privacy.',
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: 'Privacy Policy | Olly AI',
    description: 'Understand Olly AI\'s commitment to your privacy and data protection',
    images: [
      {
        url: "https://videosilvids.s3.ap-south-1.amazonaws.com/Screenshot+2024-01-15+at+1.00.33%E2%80%AFPM.png",
        width: 1200,
        height: 630,
        alt: 'Olly AI Privacy Policy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | Olly AI',
    description: 'Understand Olly AI\'s commitment to your privacy and data protection',
    images: ["https://videosilvids.s3.ap-south-1.amazonaws.com/Screenshot+2024-01-15+at+1.00.33%E2%80%AFPM.png"],
  },
}

const PrivacyPage: React.FC = () => {
    return <PrivacyPolicy />;
};

export default PrivacyPage;