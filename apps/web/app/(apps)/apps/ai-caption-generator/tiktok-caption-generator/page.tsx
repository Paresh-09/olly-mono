import CaptionGenerator from '../../_components/caption-generator/caption-template';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free TikTok Caption Generator | AI-Powered Viral Captions',
  description: 'Create viral-worthy TikTok captions with our free AI-powered generator. Perfect for content creators aiming to boost views and engagement.',
  keywords: 'TikTok caption generator, AI caption generator, viral TikTok content, social media trends',
};

export default function TikTokCaptionGenerator() {
  const benefits = [
    "AI-generated captions optimized for TikTok's fast-paced environment",
    "Customizable tone to match current TikTok trends and challenges",
    "Option to include popular hashtags and emojis",
    "Boost views, likes, and followers with attention-grabbing captions"
  ];

  const faqs = [
    {
      question: "How can I make my TikTok captions more engaging?",
      answer: "Our AI-powered generator creates captions tailored to TikTok's audience, considering current trends, popular hashtags, and your content style to create catchy and engaging captions."
    },
    {
      question: "Can I use this generator for different types of TikTok content?",
      answer: "Yes, our generator can create captions for various types of TikTok content, including dance challenges, tutorials, comedy skits, and more."
    },
    {
      question: "How important are hashtags on TikTok?",
      answer: "Hashtags are crucial on TikTok for discoverability. Our generator can suggest relevant and trending hashtags to include in your captions, potentially increasing your video's reach."
    }
  ];

  return (
    <CaptionGenerator
      platform="tiktok"
      title="Free TikTok Caption Generator"
      description="Generate catchy and trendy captions for your TikTok videos with our AI-powered tool. Ideal for content creators, influencers, and brands looking to go viral and increase their TikTok following."
      benefits={benefits}
      faqs={faqs}
    />
  );
}