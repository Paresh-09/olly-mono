import { Metadata } from 'next';
import YouTubeDescriptionGenerator from '../_components/youtube-description';

export const metadata: Metadata = {
  title: 'YouTube Description Generator | AI-Powered Video Descriptions',
  description: 'Create SEO-friendly YouTube video descriptions with our AI-powered generator. Enhance your video visibility and engagement effortlessly.',
  keywords: 'YouTube description generator, video descriptions, SEO, AI generator',
};

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: 'Why are YouTube descriptions important?',
    answer: 'YouTube descriptions help improve your videos SEO, making it easier for viewers to find your content. They also provide context and additional information about your video.',
  },
  {
    question: 'How does the AI-powered generator work?',
    answer: 'Our AI analyzes your video content and generates optimized descriptions that include relevant keywords to enhance visibility and engagement.',
  },
  // Add more FAQs as needed
];

const YouTubeDescriptionGeneratorPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">YouTube Description Generator</h1>
      <YouTubeDescriptionGenerator />
      
      {/* SEO-Optimized Content */}
      <section className="my-8">
        <h2 className="text-2xl font-semibold mb-4">Benefits of Optimizing Your YouTube Descriptions</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>Improves search engine visibility</li>
          <li>Engages viewers with relevant information</li>
          <li>Increases video watch time and retention</li>
          <li>Enhances video discoverability through keywords</li>
        </ul>
      </section>
    </div>
  );
};

export default YouTubeDescriptionGeneratorPage;