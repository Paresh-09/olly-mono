import { Metadata } from 'next';
import HashtagGenerator from '../../_components/caption-generator/hashtag-template';

export const metadata: Metadata = {
  title: 'Free Twitter/X Hashtag Generator | AI-Powered Trending Hashtags',
  description: 'Create impactful Twitter/X hashtags with our free AI-powered generator. Perfect for increasing your tweet visibility and engagement.',
  keywords: 'Twitter hashtag generator, X hashtag generator, social media trends, tweet optimization',
};

export default function TwitterXHashtagGenerator() {
  const benefits = [
    "AI-generated hashtags optimized for Twitter/X's trending algorithm",
    "Increase your tweet's visibility and potential for virality",
    "Stay current with real-time trends and conversations",
    "Enhance your Twitter/X marketing strategy"
  ];

  const faqs = [
    {
      question: "How do hashtags work on Twitter/X?",
      answer: "Hashtags on Twitter/X categorize your tweets, making them discoverable to users interested in specific topics. They can help your tweets appear in searches and trending discussions."
    },
    {
      question: "How many hashtags should I use in a tweet?",
      answer: "While Twitter/X doesn't have a strict limit, it's generally recommended to use 1-2 relevant hashtags per tweet for optimal engagement. Our generator can provide you with the most effective options."
    },
    {
      question: "Can I use this generator for different types of Twitter/X content?",
      answer: "Yes, our generator is versatile and can create hashtags for various types of tweets, including news, personal updates, marketing campaigns, and more."
    }
  ];

  return (
    <HashtagGenerator
      platform="twitter"
      title="Free Twitter/X Hashtag Generator"
      description="Amplify your voice on Twitter/X with our AI-powered hashtag generator. Perfect for individuals, businesses, and marketers looking to boost their tweet engagement and participate in trending conversations."
      benefits={benefits}
      faqs={faqs}
    />
  );
}
