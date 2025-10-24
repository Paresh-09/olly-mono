import CaptionGenerator from '../../_components/caption-generator/caption-template';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Twitter (X) Caption Generator | AI-Powered Tweet Composer',
  description: 'Create engaging tweets with our free AI-powered Twitter (X) caption generator. Perfect for maximizing engagement within character limits.',
  keywords: 'Twitter caption generator, X caption generator, AI tweet composer, social media engagement',
};

export default function TwitterCaptionGenerator() {
  const benefits = [
    "AI-generated tweets optimized for Twitter's character limit",
    "Customizable tone to match your personal or brand voice",
    "Option to include trending hashtags for better visibility",
    "Increase retweets, likes, and overall engagement on your posts"
  ];

  const faqs = [
    {
      question: "How can I create more engaging tweets?",
      answer: "Our AI-powered generator creates tweets tailored to Twitter's audience, considering current trends, popular hashtags, and your chosen tone to create engaging content within the character limit."
    },
    {
      question: "Can I use this generator for different types of tweets?",
      answer: "Yes, our generator can create captions for various types of tweets, including news updates, personal thoughts, brand promotions, and more."
    },
    {
      question: "How can I increase my Twitter following?",
      answer: "Consistently posting engaging content with well-crafted tweets can help increase your following. Our generator helps you create compelling tweets that encourage engagement and sharing."
    }
  ];

  return (
    <CaptionGenerator
      platform="twitter"
      title="Free Twitter (X) Caption Generator"
      description="Compose impactful tweets with our AI-powered caption generator. Ideal for Twitter users, brands, and social media managers looking to increase engagement and grow their following within the platform's character limits."
      benefits={benefits}
      faqs={faqs}
    />
  );
}