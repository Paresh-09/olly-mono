import { Metadata } from 'next';
import HashtagGenerator from '../../_components/caption-generator/hashtag-template';

export const metadata: Metadata = {
  title: 'Free Facebook Hashtag Generator | AI-Powered Hashtags',
  description: 'Create engaging Facebook hashtags with our free AI-powered hashtag generator. Perfect for social media marketers and content creators.',
  keywords: 'Facebook hashtag generator, AI hashtag generator, social media hashtags, content creation',
};

export default function FacebookHashtagGenerator() {
  const benefits = [
    "AI-powered suggestions tailored for Facebook's audience",
    "Customizable number and popularity of hashtags",
    "Boost discoverability and engagement on your Facebook posts",
    "Save time and stay up-to-date with trending hashtags"
  ];

  const faqs = [
    {
      question: "How does the Facebook Hashtag Generator work?",
      answer: "Our AI-powered tool analyzes your input topic and generates relevant hashtags optimized for Facebook's audience and algorithm. It considers factors like popularity and trendiness to create effective hashtags."
    },
    {
      question: "Can I customize the generated hashtags?",
      answer: "Yes, you can customize the number of hashtags and their popularity level. You can also regenerate hashtags if you're not satisfied with the initial results."
    },
    {
      question: "Is this hashtag generator free to use?",
      answer: "Yes, our Facebook Hashtag Generator is completely free to use."
    }
  ];

  return (
    <HashtagGenerator
      platform="facebook"
      title="Free Facebook Hashtag Generator"
      description="Create engaging hashtags for your Facebook posts with our AI-powered hashtag generator. Perfect for social media marketers, influencers, and content creators looking to boost their Facebook engagement and discoverability."
      benefits={benefits}
      faqs={faqs}
    />
  );
}