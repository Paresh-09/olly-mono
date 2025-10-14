// pages/youtube-content-generator.tsx
import { Metadata } from 'next';
import YouTubeCombinedGenerator from '../_components/youtube-combined-app';
import BenefitSection from '../../_components/caption-generator/benefit-olly';
import FAQSection from '../../_components/caption-generator/faq-section';

export const metadata: Metadata = {
  title: 'All-in-One YouTube Content Generator | AI-Powered Video Optimization',
  description: 'Generate optimized titles, descriptions, and tags for your YouTube videos with our AI-powered tool. Boost your channel’s performance effortlessly.',
  keywords: 'YouTube SEO, video optimization, content creation, AI generator',
};

const faqs = [
  {
    question: 'What features are included in the All-in-One Generator?',
    answer: 'Our tool provides AI-generated titles, descriptions, and tags to fully optimize your YouTube videos for better performance and reach.',
  },
  {
    question: 'How does optimizing all content elements help my channel?',
    answer: 'Optimizing titles, descriptions, and tags ensures that your videos are easily discoverable, engaging, and aligned with search algorithms, leading to increased views and subscriber growth.',
  },
  // Add more FAQs as needed
];

export default function YouTubeContentGeneratorPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">All-in-One YouTube Content Generator</h1>
      <YouTubeCombinedGenerator />
      
      {/* SEO-Optimized Content */}
      <section className="my-8">
        <h2 className="text-xl font-semibold mb-2">Benefits of Comprehensive YouTube Content Optimization</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>Maximizes video discoverability</li>
          <li>Ensures consistency across content elements</li>
          <li>Enhances viewer engagement and retention</li>
          <li>Boosts channel growth and monetization opportunities</li>
        </ul>
      </section>
      
      {/* Benefit Section */}
      <BenefitSection />
      
      {/* FAQ Section */}
      <FAQSection faqs={faqs} />
    </div>
  );
}
