import { Metadata } from 'next';
import YouTubeTitleGenerator from '../_components/youtube-title';

export const metadata: Metadata = {
  title: 'YouTube Title Generator | AI-Powered Video Titles',
  description: 'Create engaging YouTube video titles with our AI-powered generator to attract more viewers and boost your channels growth.',
  keywords: 'YouTube title generator, video titles, content creation, AI generator',
};

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: 'Why is the video title important?',
    answer: 'The video title is crucial as its the first thing viewers see. An engaging and optimized title can significantly increase click-through rates and viewer interest.',
  },
  {
    question: 'How does the AI ensure the titles are effective?',
    answer: 'Our AI analyzes trending keywords, viewer behavior, and best practices to generate titles that are both captivating and optimized for search engines.',
  },
  // Add more FAQs as needed
];

const YouTubeTitleGeneratorPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">YouTube Title Generator</h1>
      <YouTubeTitleGenerator />
      
      {/* SEO-Optimized Content */}
      <section className="my-8">
        <h2 className="text-2xl font-semibold mb-4">Benefits of Optimizing Your YouTube Titles</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>Increases video click-through rates</li>
          <li>Improves search engine rankings</li>
          <li>Attracts the right target audience</li>
          <li>Enhances overall video performance and engagement</li>
        </ul>
      </section>
    </div>
  );
};

export default YouTubeTitleGeneratorPage;