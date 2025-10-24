import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'YouTube Content Creation Tools | AI-Powered Video Optimization',
  description: 'Explore our suite of AI-powered tools for YouTube content creation including title, description, and tag generators.',
  keywords: 'YouTube tools, content creation, video optimization, AI generator',
};

export default function YouTubeToolsPage() {
  const tools = [
    { name: 'YouTube Title Generator', path: '/apps/youtube/title-generator' },
    { name: 'YouTube Description Generator', path: '/apps/youtube/description-generator' },
    { name: 'YouTube Tags Generator', path: '/apps/youtube/tags-generator' },
    { name: 'All-in-One YouTube Content Generator', path: '/apps/youtube/content-generator' },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">YouTube Content Creation Tools</h1>
      <p className="mb-6">Explore our AI-powered tools to optimize your YouTube content:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool, index) => (
          <Link key={index} href={tool.path} className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100">
            <h2 className="mb-2 text-xl font-bold tracking-tight text-gray-900">{tool.name}</h2>
            <p className="font-normal text-gray-700">Click to use this tool</p>
          </Link>
        ))}
      </div>
    </div>
  );
}