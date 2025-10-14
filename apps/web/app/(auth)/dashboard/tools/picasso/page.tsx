'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Sparkles } from 'lucide-react';
import Link from 'next/link';
import StyleGenerator from '../_components/style-generator';

interface GeneratedImage {
  id: string;
  originalImageUrl: string;
  generatedImageUrl: string;
  prompt: string;
}

export default function PicassoPage() {
  const router = useRouter();
  const [creditsAvailable, setCreditsAvailable] = useState<number>(0);
  const [isLoadingCredits, setIsLoadingCredits] = useState<boolean>(true);
  const [generationComplete, setGenerationComplete] = useState<boolean>(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  // Fetch user credit balance
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        setIsLoadingCredits(true);
        const response = await fetch('/api/user/credits');
        if (response.ok) {
          const data = await response.json();
          setCreditsAvailable(data.balance);
        }
      } catch (error) {
        console.error('Error fetching credits:', error);
      } finally {
        setIsLoadingCredits(false);
      }
    };

    fetchCredits();
  }, []);

  // Handle generation complete
  const handleGenerationComplete = (images: GeneratedImage[], remainingCredits: number) => {
    setGeneratedImages(images);
    setGenerationComplete(true);
    setCreditsAvailable(remainingCredits);
    
    // Scroll to results
    setTimeout(() => {
      const resultsElement = document.getElementById('results-section');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 500);
  };

  // Reset generation state
  const handleStartOver = () => {
    setGeneratedImages([]);
    setGenerationComplete(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 rounded-full hover:bg-gray-100 transition"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold flex items-center">
                  <Sparkles className="w-6 h-6 mr-2 text-purple-600" />
                  Picasso
                </h1>
                <p className="text-sm text-gray-500">Bulk generate styled images within minutes</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="flex items-center bg-gray-100 px-4 py-2 rounded">
                <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
                {isLoadingCredits ? (
                  <span className="text-sm font-medium">Loading...</span>
                ) : (
                  <span className="text-sm font-medium">
                    {creditsAvailable} credit{creditsAvailable !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <Link 
                href="/dashboard/tools/picasso/jobs" 
                className="ml-4 text-sm text-purple-600 hover:text-purple-800 underline"
              >
                Gallery
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto pt-6 pb-16 px-4">
        <div className="bg-white border-t border-gray-200 p-6">
          <div className="max-w-5xl mx-auto">
            <StyleGenerator
              onGenerationComplete={handleGenerationComplete} 
              initialCreditBalance={creditsAvailable}
            />
          </div>
        </div>
      </div>

      {/* Results section */}
      {generationComplete && generatedImages.length > 0 && (
        <div id="results-section" className="container mx-auto py-8 px-4">
          <div className="bg-gray-50 p-8 border-l-4 border-purple-400">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Transformation complete!</h2>
              <p className="text-gray-600">Your images are ready</p>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <button
                onClick={() => router.push('/dashboard/tools/picasso/jobs')}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 px-6 py-3 rounded transition"
              >
                View Gallery
              </button>
              
              <button
                onClick={handleStartOver}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded transition"
              >
                Generate More
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-end">
            <a 
              href="/credits" 
              className="text-purple-600 hover:text-purple-800 flex items-center text-sm font-medium"
            >
              <CreditCard className="w-4 h-4 mr-1" />
              Purchase Credits
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}