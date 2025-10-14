"use client"

import { useState, useEffect, useRef } from 'react';
import { TagIcon, CopyIcon, RefreshCwIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface HashtagGeneratorProps {
  platform: string;
  title: string;
  description: string;
  benefits: string[];
  faqs: { question: string; answer: string }[];
}

export default function HashtagGenerator({ platform, title, description, benefits, faqs }: HashtagGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [numHashtags, setNumHashtags] = useState(5);
  const [popularity, setPopularity] = useState('mixed');
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const hashtagsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUserId(uuidv4());
  }, []);

  useEffect(() => {
    if (generatedHashtags.length > 0 && hashtagsRef.current) {
      hashtagsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [generatedHashtags]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/openai/hashtag-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          platform,
          numHashtags,
          popularity,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate hashtags');
      }

      const data = await response.json();
      setGeneratedHashtags(data.hashtags);
    } catch (error) {
      console.error('Error generating hashtags:', error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false);
    }
  };

  const copyHashtags = () => {
    if (generatedHashtags.length > 0) {
      navigator.clipboard.writeText(generatedHashtags.join(' '))
        .then(() => {
          alert('Hashtags copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
        });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-gray-800">{title}</h1>
        <p className="mb-6 text-center text-gray-600">{description}</p>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
              Topic or Keywords
            </label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your topic or keywords"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="numHashtags" className="block text-sm font-medium text-gray-700">
                Number of Hashtags
              </label>
              <input
                type="number"
                id="numHashtags"
                value={numHashtags}
                onChange={(e) => setNumHashtags(parseInt(e.target.value))}
                min={1}
                max={30}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="popularity" className="block text-sm font-medium text-gray-700">
                Hashtag Popularity
              </label>
              <select
                id="popularity"
                value={popularity}
                onChange={(e) => setPopularity(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="popular">Popular</option>
                <option value="niche">Niche</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 flex justify-center items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {isLoading ? 'Generating...' : 'Generate Hashtags'}
          </button>
        </form>
      </div>

      {generatedHashtags.length > 0 && (
        <div ref={hashtagsRef} className="bg-white shadow-md rounded-lg p-4 sm:p-6">
          <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">Your Generated Hashtags</h3>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 sm:p-6 mb-6">
            <p className="text-lg sm:text-xl text-gray-800 text-center">{generatedHashtags.join(' ')}</p>
          </div>
          <div className="text-center space-x-4">
            <button onClick={copyHashtags} className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-300 inline-flex items-center">
              <CopyIcon className="w-5 h-5 mr-2" />
              Copy Hashtags
            </button>
            <button onClick={handleSubmit} className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 inline-flex items-center">
              <RefreshCwIcon className="w-5 h-5 mr-2" />
              Regenerate
            </button>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">Why Use Our {platform.charAt(0).toUpperCase() + platform.slice(1)} Hashtag Generator?</h2>
        <ul className="list-disc pl-5 space-y-2">
          {benefits.map((benefit, index) => (
            <li key={index} className="text-gray-700">{benefit}</li>
          ))}
        </ul>
      </div>

      <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 pb-4">
              <h3 className="font-semibold text-gray-800 mb-2">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}