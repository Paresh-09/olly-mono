// components/BenefitSection.tsx
import { Sparkles } from 'lucide-react';
import React from 'react';

const BenefitSection: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-6 text-center overflow-hidden my-8">
      <div className="absolute inset-0 bg-white opacity-10">
        <Sparkles className="w-full h-full text-white" />
      </div>
      <div className="relative z-10">
        <h4 className="text-2xl font-bold mb-2 text-white">Love this tool?</h4>
        <p className="mb-4 text-white">
          You&apos;ll love our Chrome Extension! 10x your social media growth with Olly.
        </p>
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
  );
};

export default BenefitSection;
