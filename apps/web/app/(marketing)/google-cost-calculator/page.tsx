import React from 'react';
import GoogleCostCalculator from '../_components/google-cost-calculator';
import { Metadata } from 'next';
import { CTALifetime } from '../_components/cta-lifetime';
import { RiGeminiFill } from "react-icons/ri";


export const metadata: Metadata = {
  title: 'Google Gemini Cost Calculator | Estimate Costs for Google AI Text Generation',
  description: 'Use our Google Gemini Cost Calculator to estimate the cost of using different Google Gemini models for generating comments, posts, and text based on your specific requirements. Optimize your budget for AI-powered content creation with Olly.',
  keywords: 'Google cost calculator, Gemini cost calculator, google ai pricing calculator, gemini pricing calculator, ai cost calculator, gemini flash cost, gemini pro cost, text generation cost, ai content creation cost, Olly',
  alternates: {
    canonical: "/google-cost-calculator",
  },
  openGraph: {
    title: 'Google Gemini Cost Calculator | Estimate Costs for Google AI Text Generation',
    description: 'Use our Google Gemini Cost Calculator to estimate the cost of using different Google Gemini models for generating comments, posts, and text based on your specific requirements. Optimize your budget for AI-powered content creation with Olly.',
    url: 'https://www.olly.social/google-cost-calculator',
    type: 'website',
    images: [
      {
        url: '/cost-calculator-google.png',
        width: 1200,
        height: 630,
        alt: 'Google Gemini Cost Calculator',
      },
    ],
  },
};

const GoogleCostCalculatorPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <div className="flex justify-center items-center gap-4 mb-6">
          <RiGeminiFill className="w-10 h-10 text-gray-800" />
          <h1 className="text-4xl font-bold">Google Gemini Cost Calculator</h1>
        </div>
        <p className="mb-8">
          Estimate the cost of using different Google Gemini models for generating comments, posts, and text based on your specific requirements.
          Our Google Gemini Cost Calculator helps you make informed decisions and optimize your budget for AI-powered content creation.
        </p>
      </div>
      <div className="max-w-xl mx-auto">
        <GoogleCostCalculator />
      </div>
      <CTALifetime />
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Calculator Details</h2>
        <div className="space-y-4">
          <div>
            <p className="font-bold">Models:</p>
            <ul className="list-disc pl-6">
              <li>Gemini Flash Lite: Priced at $0.1 per 1M input tokens and $0.4 per 1M output tokens.</li>
              <li>Gemini 2.5 Flash: Priced at $0.15 per 1M input tokens and $0.6 per 1M output tokens.</li>
              <li>Gemini 2.5 Pro (≤200K): Priced at $1.25 per 1M input tokens and $10.0 per 1M output tokens.</li>
              <li>Gemini 1.5 Pro (≤128K): Priced at $1.25 per 1M input tokens and $5.0 per 1M output tokens.</li>
              <li>Gemini 2.5 Pro (&gt;200K): Priced at $2.5 per 1M input tokens and $15.0 per 1M output tokens.</li>
            </ul>
          </div>
          <div>
            <p className="font-bold">Input Length:</p>
            <p>Adjustable from 1000 to 10000 characters.</p>
          </div>
          <div>
            <p className="font-bold">Comment Length:</p>
            <p>Select from 150, 300, 500, or 1000 characters.</p>
          </div>
          <div>
            <p className="font-bold">Comments per Day:</p>
            <p>Specify the number of comments generated per day, from 1 to 100.</p>
          </div>
        </div>
      </div>
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">FAQ</h2>
        <div className="space-y-4">
          <div>
            <p className="font-bold">Q: What is the Google Gemini Cost Calculator?</p>
            <p>A: The Google Gemini Cost Calculator is a tool that helps you estimate the cost of using different Google Gemini models for generating text based on your specific requirements, such as input length, comment length, and the number of comments per day.</p>
          </div>
          <div>
            <p className="font-bold">Q: How does the calculator estimate the costs?</p>
            <p>A: The calculator uses the pricing information provided by Google for each Gemini model and calculates the estimated cost based on the input length, comment length, and the number of comments per day. It provides both daily and monthly cost estimates.</p>
          </div>
          <div>
            <p className="font-bold">Q: What models are supported by the calculator?</p>
            <p>A: The calculator supports all latest Google Gemini models including Gemini Flash Lite (most affordable), Gemini 2.5 Flash (fast and efficient), Gemini 2.5 Pro (latest flagship), and Gemini 1.5 Pro. Each model has different pricing for input and output tokens.</p>
          </div>
          <div>
            <p className="font-bold">Q: Can I customize the input and comment lengths?</p>
            <p>A: Yes, you can adjust the input length using the slider, ranging from 1000 to 10000 characters. For comment length, you can select from predefined options: 150, 300, 500, or 1000 characters.</p>
          </div>
          <div>
            <p className="font-bold">Q: How can I use the cost estimates?</p>
            <p>A: The cost estimates provided by the calculator can help you make informed decisions about which Gemini model to use based on your budget and requirements. It allows you to optimize your spending on AI-powered content creation.</p>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center">
        <p className="text-sm"><span className="font-bold">Note:</span> Text length is the combination of input and output. For example, if your selected input text has 500 characters and the generated output text has 250 characters, the total text length is 750 characters. An average LinkedIn post is typically between 1000 and 3000 characters.</p>
      </div>
    </div>
  );
};

export default GoogleCostCalculatorPage;