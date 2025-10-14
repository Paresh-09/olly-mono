// EngagementCalculatorPage.tsx
import React from 'react';
import { Metadata } from 'next';
import LinkedInEngagementCalculator from '@/app/(marketing)/_components/engagement-calculators/linkedin';

export const metadata: Metadata = {
  title: 'Social Media Engagement Rate Calculator | Olly.social',
  description: 'Calculate your LinkedIn, Twitter, X, Instagram, engagement rate easily with our free calculator. Measure the success of your LinkedIn posts and optimize your content strategy.',
  keywords: 'LinkedIn engagement rate, LinkedIn, Twitter, X, Instagram engagement rate calculator, engagement rate calculator, LinkedIn analytics, social media metrics, Olly.social',
  alternates: {
    canonical: "/engagement-calculator",
  },
  openGraph: {
    title: 'LinkedIn, Twitter, X, Instagram, Engagement Rate Calculator | Olly.social',
    description: 'Calculate your LinkedIn engagement rate easily with our free calculator. Measure the success of your LinkedIn posts and optimize your content strategy.',
    url: 'https://www.olly.social/engagement-calculator',
    type: 'website',
    images: [
      {
        url: 'https://www.olly.social/images/linkedin-engagement-calculator-og.jpg',
        width: 1200,
        height: 630,
        alt: 'LinkedIn Engagement Rate Calculator',
      },
    ],
  },
};

const EngagementCalculatorPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">LinkedIn, Twitter, X, Instagram, Engagement Rate Calculator</h1>
      <p className="mb-8">
        Measure the success of your LinkedIn, Twitter, X, Instagram, posts with our free engagement rate calculator.
        Simply enter the number of reactions, comments, shares, and impressions your post received,
        and our calculator will determine your engagement rate percentage.
      </p>
      <LinkedInEngagementCalculator />
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Why LinkedIn, Twitter, X, Instagram, Engagement Rate Matters</h2>
        <p className="mb-4">
          Your LinkedIn, Twitter, X, Instagram, engagement rate is a key metric that indicates how well your content resonates
          with your audience. A high engagement rate means that your posts are generating meaningful
          interactions, such as reactions, comments, and shares. This engagement helps to increase
          your visibility on the platform and can lead to more followers, connections, and opportunities.
        </p>
        <p>
          By monitoring your LinkedIn, Twitter, X, Instagram, engagement rate, you can gain valuable insights into the types of
          content that your audience responds to best. This information can help you refine your content
          strategy, create more engaging posts, and ultimately grow your presence on LinkedIn.
        </p>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">How to Improve Your LinkedIn, Twitter, X, Instagram, Engagement Rate</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Create valuable and relevant content that addresses your audience&apos;s interests and pain points.</li>
          <li>Use eye-catching visuals, such as images and videos, to make your posts more engaging.</li>
          <li>Encourage interaction by asking questions, starting discussions, and responding to comments.</li>
          <li>Post consistently to maintain a strong presence and keep your audience engaged.</li>
          <li>Experiment with different post formats, such as articles, polls, and live videos, to see what works best for your audience.</li>
        </ul>
        <p>
          By implementing these strategies and regularly monitoring your LinkedIn engagement rate, you can
          continuously improve your content performance and achieve your goals on the platform.
        </p>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">About Olly.social</h2>
        <p>
          Olly.social is a leading provider of social media management tools and resources. Our mission
          is to help businesses and individuals maximize their social media presence and achieve their
          marketing goals. With our powerful tools and expert guidance, you can streamline your social
          media efforts, engage your audience, and drive meaningful results.
        </p>
      </div>
    </div>
  );
};

export default EngagementCalculatorPage;