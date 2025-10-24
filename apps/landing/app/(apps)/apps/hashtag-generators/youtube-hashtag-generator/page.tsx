import { Metadata } from 'next';
import HashtagGenerator from '../../_components/caption-generator/hashtag-template';

export const metadata: Metadata = {
  title: 'Free YouTube Hashtag Generator | AI-Powered Video Optimization',
  description: 'Create effective YouTube hashtags with our free AI-powered generator. Perfect for video creators looking to increase their content visibility.',
  keywords: 'YouTube hashtag generator, video SEO, content discovery, YouTube optimization',
};

export default function YouTubeHashtagGenerator() {
  const benefits = [
    "AI-generated hashtags optimized for YouTube's search and recommendation algorithms",
    "Improve your video's discoverability and reach",
    "Customize hashtags for different video genres and topics",
    "Stay updated with trending YouTube categories and themes"
  ];

  const faqs = [
    {
      question: "How do hashtags work on YouTube?",
      answer: "YouTube hashtags help categorize your videos, making them more discoverable in search results and related video suggestions. They can appear above your video title and in the description."
    },
    {
      question: "How many hashtags should I use on YouTube?",
      answer: "YouTube allows up to 15 hashtags per video, but it's recommended to use 3-5 relevant hashtags. Our generator can provide you with the optimal selection for your content."
    },
    {
      question: "Can I use hashtags for different types of YouTube content?",
      answer: "Yes, our generator can create hashtags for various YouTube content types, including vlogs, tutorials, reviews, music videos, and more."
    }
  ];

  return (
    <HashtagGenerator
      platform="youtube"
      title="Free YouTube Hashtag Generator"
      description="Boost your YouTube video visibility with our AI-powered hashtag generator. Ideal for content creators, vloggers, and brands looking to optimize their YouTube SEO and reach a wider audience."
      benefits={benefits}
      faqs={faqs}
    />
  );
}