import CaptionGenerator from '../../_components/caption-generator/caption-template';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Facebook Caption Generator | AI-Powered Captions',
  description: 'Create engaging Facebook captions with our free AI-powered caption generator. Perfect for social media marketers and content creators.',
  keywords: 'Facebook caption generator, AI caption generator, social media captions, content creation',
};

export default function FacebookCaptionGenerator() {
  const benefits = [
    "AI-powered suggestions tailored for Facebook's audience",
    "Customizable tone and length to match your brand voice",
    "Option to include relevant hashtags and emojis",
    "Save time and boost engagement on your Facebook posts"
  ];

  const faqs = [
    {
      question: "How does the Facebook Caption Generator work?",
      answer: "Our AI-powered tool analyzes your input and generates captions optimized for Facebook's audience and algorithm. It considers factors like tone, length, and engagement potential to create compelling captions."
    },
    {
      question: "Can I customize the generated captions?",
      answer: "Yes, you can customize the tone, length, and whether to include hashtags or emojis. You can also edit the generated captions to better fit your needs."
    },
    {
      question: "Is this caption generator free to use?",
      answer: "Yes, our Facebook Caption Generator is completely free to use."
    }
  ];

  return (
    <CaptionGenerator
      platform="facebook"
      title="Free Facebook Caption Generator"
      description="Create engaging captions for your Facebook posts with our AI-powered caption generator. Perfect for social media marketers, influencers, and content creators looking to boost their Facebook engagement."
      benefits={benefits}
      faqs={faqs}
    />
  );
}