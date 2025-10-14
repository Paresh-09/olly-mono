"use client";

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Button } from '@repo/ui/components/ui/button';
import TacoRating from '../appsumo/_components/taco-stars';
import ActivationGuidePage from './_components/activation-guide';
import { useSearchParams } from 'next/navigation';

const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

export default function ActivationSuccessPage() {
  const searchParams = useSearchParams();
  const licenseKey = searchParams.get('licenseKey');
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [currentStep, setCurrentStep] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    if (typeof window !== 'undefined') {
      handleResize();
      window.addEventListener('resize', handleResize);
    }

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigateToStep = (step: number) => {
    setCurrentStep(step);
    if (containerRef.current) {
      containerRef.current.style.transform = `translateX(-${(step - 1) * 50}%)`;
    }
  };

  if (!licenseKey) {
    return <div>No license key provided</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 overflow-hidden">
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-4">Activation Successful! 🎉</h1>
        </div>

        <div className="relative overflow-hidden">
          <div 
            ref={containerRef} 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ width: '200%' }}
          >
            <div className="w-1/2 px-3">
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <ActivationGuidePage licenseKey={licenseKey} />
                
                <div className="mt-6 text-center">
                  <Button onClick={() => navigateToStep(2)} size="lg" className="group">
                    Next: Rate Your Experience
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="w-1/2 px-3">
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-semibold mb-4">Step 2: Support us ❤️</h2>
                <p className="mb-4">We&apos;d love to hear about your experience with Olly on AppSumo!</p>
                <TacoRating reviewUrl="https://appsumo.com/products/olly#reviews" rating={5} />
                <div className="mt-6 flex justify-between">
                  <Button onClick={() => navigateToStep(1)} size="sm" variant="outline" className="group">
                    <ChevronLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back
                  </Button>
                  <Button onClick={() => window.location.href = '/login'} size="lg">
                    To Login
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="mt-4 text-sm text-gray-500">
            We&apos;ve sent these instructions to your email as well.
          </p>
          
          <div className="mt-6 flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <Image
                src="/images/blog/yt.jpg"
                alt="Yash - Founder of Olly Social"
                width={48}
                height={48}
                className="rounded-full"
              />
              <div className="text-left">
                <p className="text-sm font-semibold">Yash - Founder</p>
                <a href="mailto:yash@olly.social" className="text-xs text-blue-600 hover:underline">
                  yash@olly.social
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {currentStep === 1 && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          tweenDuration={10000}
        />
      )}
    </div>
  );
}