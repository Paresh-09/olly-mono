import CaptionGenerator from '../../_components/caption-generator/caption-template';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Instagram Caption Generator | AI-Powered Captions',
  description: 'Create eye-catching Instagram captions with our free AI-powered caption generator. Ideal for influencers and brands looking to increase engagement.',
  keywords: 'Instagram caption generator, AI caption generator, social media captions, influencer marketing',
};

export default function InstagramCaptionGenerator() {
  const benefits = [
    "AI-generated captions optimized for Instagram's algorithm",
    "Customizable tone to match your personal or brand style",
    "Option to include trending hashtags and relevant emojis",
    "Increase likes, comments, and followers with compelling captions"
  ];

  const faqs = [
    {
      question: "How can I make my Instagram captions more engaging?",
      answer: "Our AI-powered generator creates captions tailored to Instagram's audience, considering factors like trending topics, engagement patterns, and your specific style to create compelling captions."
    },
    {
      question: "Can I use this generator for different types of Instagram posts?",
      answer: "Yes, our generator can create captions for various types of Instagram content, including photos, videos, reels, and stories."
    },
    {
      question: "How often should I post on Instagram?",
      answer: "Posting frequency can vary, but consistency is key. Many successful accounts post 1-3 times per day. Our caption generator can help you maintain a consistent posting schedule by quickly creating engaging captions."
    }
  ];

  return (
    <CaptionGenerator
      platform="instagram"
      title="Free Instagram Caption Generator"
      description="Generate captivating captions for your Instagram posts with our AI-powered tool. Perfect for influencers, brands, and content creators aiming to increase engagement and grow their Instagram presence."
      benefits={benefits}
      faqs={faqs}
    />
  );
}