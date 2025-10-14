import React from 'react';
import { Metadata } from 'next';
import Eula from '../_components/eula';

export const metadata: Metadata = {
  title: 'End User License Agreement | Olly AI',
  description: 'Review the End User License Agreement for Olly AI. Understand the terms and conditions for using our services.',
  alternates: {
    canonical: "/eula",
  },
  openGraph: {
    title: 'End User License Agreement | Olly AI',
    description: 'Understand the terms and conditions for using Olly AI services.',
    images: [
      {
        url: "https://videosilvids.s3.ap-south-1.amazonaws.com/Screenshot+2024-01-15+at+1.00.33%E2%80%AFPM.png",
        width: 1200,
        height: 630,
        alt: 'Olly AI End User License Agreement',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'End User License Agreement | Olly AI',
    description: 'Understand the terms and conditions for using Olly AI services.',
    images: ["https://videosilvids.s3.ap-south-1.amazonaws.com/Screenshot+2024-01-15+at+1.00.33%E2%80%AFPM.png"],
  },
}

const EulaPage: React.FC = () => {
    return <Eula />;
};

export default EulaPage;