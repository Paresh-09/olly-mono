import CaptionGenerator from '../../_components/caption-generator/caption-template';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Reddit Caption Generator | AI-Powered Post Titles',
  description: 'Create engaging Reddit post titles with our free AI-powered caption generator. Perfect for Redditors looking to increase engagement and karma.',
  keywords: 'Reddit caption generator, AI post title generator, Reddit engagement, karma boost',
};

export default function RedditCaptionGenerator() {
  const benefits = [
    "AI-generated titles optimized for Reddit's diverse communities",
    "Customizable tone to match different subreddit styles",
    "Option to include relevant keywords for better discoverability",
    "Increase upvotes, comments, and overall engagement on your posts"
  ];

  const faqs = [
    {
      question: "How can I create effective Reddit post titles?",
      answer: "Our AI-powered generator creates titles tailored to Reddit's audience, considering factors like subreddit-specific trends, engagement patterns, and your chosen topic to create compelling titles."
    },
    {
      question: "Can I use this generator for different subreddits?",
      answer: "Yes, our generator can create titles suitable for various subreddits. You can customize the tone and style to match the specific community you're posting in."
    },
    {
      question: "How can I increase my karma on Reddit?",
      answer: "Creating engaging posts with catchy titles is a great way to increase your karma. Our generator helps you craft attention-grabbing titles that can lead to more upvotes and comments."
    }
  ];

  return (
    <CaptionGenerator
      platform="reddit"
      title="Free Reddit Caption Generator"
      description="Generate catchy and engaging titles for your Reddit posts with our AI-powered tool. Ideal for Redditors aiming to increase engagement, karma, and visibility across various subreddits."
      benefits={benefits}
      faqs={faqs}
    />
  );
}