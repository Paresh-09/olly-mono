import CaptionGenerator from '../../_components/caption-generator/caption-template';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free LinkedIn Caption Generator | AI-Powered Professional Captions',
  description: 'Create impactful LinkedIn post captions with our free AI-powered generator. Ideal for professionals, job seekers, and businesses looking to enhance their LinkedIn presence.',
  keywords: 'LinkedIn caption generator, AI caption generator, professional social media, business networking',
};

export default function LinkedInCaptionGenerator() {
  const benefits = [
    "AI-generated captions tailored for a professional audience",
    "Customizable tone to match your industry and personal brand",
    "Option to include relevant hashtags for better discoverability",
    "Increase engagement and grow your professional network"
  ];

  const faqs = [
    {
      question: "How can I make my LinkedIn posts more professional?",
      answer: "Our AI generator creates captions optimized for LinkedIn's professional audience, considering industry trends and best practices for business communication."
    },
    {
      question: "Can I use this generator for different types of LinkedIn content?",
      answer: "Yes, our generator can create captions for various LinkedIn content types, including text posts, articles, and updates about job changes or achievements."
    },
    {
      question: "How can I increase my visibility on LinkedIn?",
      answer: "Consistently posting engaging content with well-crafted captions can boost your visibility. Our generator helps you create compelling captions that encourage engagement and sharing."
    }
  ];

  return (
    <CaptionGenerator
      platform="linkedin"
      title="Free LinkedIn Caption Generator"
      description="Generate professional and engaging captions for your LinkedIn posts with our AI-powered tool. Perfect for professionals, job seekers, and businesses aiming to improve their LinkedIn presence and networking opportunities."
      benefits={benefits}
      faqs={faqs}
    />
  );
}