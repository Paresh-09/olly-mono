import { Metadata } from 'next';
import HashtagGenerator from '../../_components/caption-generator/hashtag-template';

export const metadata: Metadata = {
  title: 'Free Instagram Hashtag Generator | AI-Powered Hashtags',
  description: 'Create engaging Instagram hashtags with our free AI-powered hashtag generator. Perfect for social media marketers and content creators.',
  keywords: 'Instagram hashtag generator, AI hashtag generator, social media hashtags, content creation',
};

export default function InstagramHashtagGenerator() {
  const benefits = [
    "AI-powered suggestions tailored for Instagram's visual platform",
    "Customizable number and popularity of hashtags",
    "Increase your post's discoverability and reach on Instagram",
    "Stay ahead with trending and niche-specific hashtags"
  ];

  const faqs = [
    {
      question: "How does the Instagram Hashtag Generator work?",
      answer: "Our AI tool analyzes your input and generates Instagram-optimized hashtags. It considers factors like popularity, relevance, and current trends to create effective hashtags for your posts."
    },
    {
      question: "How many hashtags should I use on Instagram?",
      answer: "Instagram allows up to 30 hashtags per post. Our generator can provide you with a customizable number of hashtags, allowing you to choose the optimal amount for your content strategy."
    },
    {
      question: "Can I use this generator for different types of Instagram content?",
      answer: "Yes, our generator is versatile and can create hashtags for various types of Instagram content, including posts, stories, and reels."
    }
  ];

  return (
    <HashtagGenerator
      platform="instagram"
      title="Free Instagram Hashtag Generator"
      description="Boost your Instagram presence with our AI-powered hashtag generator. Ideal for influencers, businesses, and content creators looking to enhance their Instagram strategy and reach."
      benefits={benefits}
      faqs={faqs}
    />
  );
}
