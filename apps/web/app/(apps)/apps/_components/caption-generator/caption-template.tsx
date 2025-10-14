"use client"

import { Platform } from '@/types';
import { CloudIcon, SmileIcon, TagIcon, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface CaptionGeneratorProps {
  platform: Platform;
  title: string;
  description: string;
  benefits: string[];
  faqs: { question: string; answer: string }[];
}

export default function CaptionGenerator({ platform, title, description, benefits, faqs }: CaptionGeneratorProps) {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [postDescription, setPostDescription] = useState('');
  const [variants, setVariants] = useState(1);
  const [writingTone, setWritingTone] = useState('casual');
  const [length, setLength] = useState('medium');
  const [addHashtags, setAddHashtags] = useState(false);
  const [addEmoji, setAddEmoji] = useState(false);
  const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const captionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUserId(uuidv4());
  }, []);

  useEffect(() => {
    if (generatedCaptions.length > 0 && captionRef.current) {
      captionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [generatedCaptions]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('description', postDescription);
      formData.append('platform', platform);
      formData.append('writingTone', writingTone);
      formData.append('length', length);
      formData.append('addHashtags', addHashtags.toString());
      formData.append('addEmoji', addEmoji.toString());
      formData.append('userId', userId);
      if (image) {
        formData.append('image', image);
      }

      const response = await fetch('/api/openai/caption-generator', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Failed to generate caption');
      }
  
      const data = await response.json();
      setGeneratedCaptions([data.caption]);
    } catch (error) {
      console.error('Error generating caption:', error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false);
    }
  };

  const copyCaption = () => {
    if (generatedCaptions.length > 0) {
      navigator.clipboard.writeText(generatedCaptions[0])
        .then(() => {
          alert('Caption copied to clipboard!');
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
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
              Upload Image
            </label>
            <div className="flex items-center justify-center w-full">
              <label htmlFor="image" className="flex flex-col items-center justify-center w-full h-48 sm:h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <CloudIcon className="w-8 h-8 sm:w-10 sm:h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 800x400px)</p>
                  </div>
                )}
                <input id="image" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={postDescription}
              onChange={(e) => setPostDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Describe your image or post content..."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="variants" className="block text-sm font-medium text-gray-700">
                Number of Variants
              </label>
              <input
                type="number"
                id="variants"
                value={variants}
                onChange={(e) => setVariants(parseInt(e.target.value))}
                min={1}
                max={5}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="writingTone" className="block text-sm font-medium text-gray-700">
                Writing Tone
              </label>
              <select
                id="writingTone"
                value={writingTone}
                onChange={(e) => setWritingTone(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
                <option value="humorous">Humorous</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="length" className="block text-sm font-medium text-gray-700">
              Length
            </label>
            <select
              id="length"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row sm:space-x-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={addHashtags}
                onChange={(e) => setAddHashtags(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-700">Add Hashtags</span>
              <TagIcon className="w-5 h-5 ml-1 text-gray-400" />
            </label>
            <label className="inline-flex items-center mt-2 sm:mt-0">
              <input
                type="checkbox"
                checked={addEmoji}
                onChange={(e) => setAddEmoji(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-700">Add Emoji</span>
              <SmileIcon className="w-5 h-5 ml-1 text-gray-400" />
            </label>
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
            {isLoading ? 'Generating...' : 'Generate Captions'}
          </button>
        </form>
      </div>

      {generatedCaptions.length > 0 && (
        <div ref={captionRef} className="bg-white shadow-md rounded-lg p-4 sm:p-6">
          <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">Your Generated Caption</h3>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 sm:p-6 mb-6">
            <p className="text-lg sm:text-xl text-gray-800 text-center">{generatedCaptions[0]}</p>
          </div>
          <div className="text-center">
            <button onClick={copyCaption} className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-300">
              Copy Caption
            </button>
          </div>
        </div>
      )}

      <div className="relative bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-white opacity-10">
          <Sparkles className="w-full h-full text-white" />
        </div>
        <div className="relative z-10">
          <h4 className="text-2xl font-bold mb-2 text-white">Love this tool?</h4>
          <p className="mb-4 text-white">You&apos;ll love our Chrome Extension! 10x your social media growth with Olly.</p>
          <a 
            href="https://chromewebstore.google.com/detail/olly-ai-assistant-for-soc/ofjpapfmglfjdhmadpegoeifocomaeje?hl=en" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-block bg-white text-purple-600 font-semibold py-2 px-6 rounded-full hover:bg-gray-100 transition duration-300 shadow-lg"
          >
            Add Olly Chrome Extension
          </a>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">Why Use Our {platform.charAt(0).toUpperCase() + platform.slice(1)} Caption Generator?</h2>
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
