import CaptionGenerator from '../../_components/caption-generator/caption-template';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free YouTube Caption Generator | AI-Powered Video Descriptions',
  description: 'Create compelling YouTube video descriptions with our free AI-powered caption generator. Perfect for YouTubers aiming to increase views and subscribers.',
  keywords: 'YouTube caption generator, AI video description generator, YouTube SEO, content creator tools',
};

export default function YouTubeCaptionGenerator() {
  const benefits = [
    "AI-generated descriptions optimized for YouTube's algorithm",
    "Customizable tone to match your channel's style",
    "Option to include relevant keywords for better discoverability",
    "Increase views, engagement, and subscriber count with compelling descriptions"
  ];

  const faqs = [
    {
      question: "How can I improve my YouTube video descriptions?",
      answer: "Our AI-powered generator creates descriptions tailored to YouTube's algorithm, considering SEO best practices, your video content, and your channel's style to create engaging and discoverable descriptions."
    },
    {
      question: "Can I use this generator for different types of YouTube content?",
      answer: "Yes, our generator can create descriptions for various types of YouTube content, including vlogs, tutorials, reviews, entertainment videos, and more."
    },
    {
      question: "How important are video descriptions for YouTube SEO?",
      answer: "Video descriptions are crucial for YouTube SEO. They help YouTube understand your content and can improve your video's visibility in search results. Our generator helps you create SEO-friendly descriptions."
    }
  ];

  return (
    <CaptionGenerator
      platform="youtube"
      title="Free YouTube Caption Generator"
      description="Generate engaging descriptions for your YouTube videos with our AI-powered tool. Ideal for content creators, vloggers, and brands looking to improve their YouTube SEO and increase views and subscribers."
      benefits={benefits}
      faqs={faqs}
    />
  );
}