import { Metadata } from 'next';
import HashtagGenerator from '../../_components/caption-generator/hashtag-template';

export const metadata: Metadata = {
  title: 'Free LinkedIn Hashtag Generator | AI-Powered Professional Hashtags',
  description: 'Create effective LinkedIn hashtags with our free AI-powered generator. Ideal for professionals, businesses, and job seekers.',
  keywords: 'LinkedIn hashtag generator, professional hashtags, business networking, career development',
};

export default function LinkedInHashtagGenerator() {
  const benefits = [
    "AI-generated hashtags optimized for professional networking",
    "Enhance your LinkedIn post visibility and engagement",
    "Stay current with industry-specific and trending professional hashtags",
    "Improve your personal or business brand on LinkedIn"
  ];

  const faqs = [
    {
      question: "How can hashtags benefit my LinkedIn presence?",
      answer: "Hashtags on LinkedIn can increase the visibility of your posts, help you connect with professionals in your industry, and showcase your expertise on specific topics."
    },
    {
      question: "Are the generated hashtags suitable for all types of LinkedIn content?",
      answer: "Yes, our generator creates hashtags suitable for various LinkedIn content types, including posts, articles, and even your profile."
    },
    {
      question: "How often should I use hashtags on LinkedIn?",
      answer: "It's recommended to use 3-5 relevant hashtags per post on LinkedIn. Our generator can provide you with the optimal number of hashtags for your content."
    }
  ];

  return (
    <HashtagGenerator
      platform="linkedin"
      title="Free LinkedIn Hashtag Generator"
      description="Elevate your professional presence on LinkedIn with our AI-powered hashtag generator. Perfect for networking, job searching, and establishing thought leadership in your industry."
      benefits={benefits}
      faqs={faqs}
    />
  );
}
