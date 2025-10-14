import React from 'react';
import GroqCostCalculator from '../_components/groq-cost-calculator';
import { Metadata } from 'next';
import { CTALifetime } from '../_components/cta-lifetime';

export const metadata: Metadata = {
  title: 'Groq Cost Calculator | Estimate Costs for Groq AI Text Generation',
  description: 'Use our Groq Cost Calculator to estimate the cost of using different Groq models for generating comments, posts, and text based on your specific requirements. Optimize your budget for AI-powered content creation with Olly.',
  keywords: 'Groq cost calculator, groq pricing calculator, ai cost calculator, llama cost, deepseek cost, qwen cost, text generation cost, ai content creation cost, Olly',
  alternates: {
    canonical: "/groq-cost-calculator",
  },
  openGraph: {
    title: 'Groq Cost Calculator | Estimate Costs for Groq AI Text Generation',
    description: 'Use our Groq Cost Calculator to estimate the cost of using different Groq models for generating comments, posts, and text based on your specific requirements. Optimize your budget for AI-powered content creation with Olly.',
    url: 'https://www.olly.social/groq-cost-calculator',
    type: 'website',
    images: [
      {
        url: '/cost-calculator-groq.png',
        width: 1200,
        height: 630,
        alt: 'Groq Cost Calculator',
      },
    ],
  },
};

const GroqCostCalculatorPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <div className="flex justify-center items-center gap-4 mb-6">
          <img src="/assets/groq.svg" alt="Groq" className="w-10 h-10" />
          <h1 className="text-4xl font-bold">Groq Cost Calculator</h1>
        </div>
        <p className="mb-8">
          Estimate the cost of using different Groq models for generating comments, posts, and text based on your specific requirements.
          Our Groq Cost Calculator helps you make informed decisions and optimize your budget for AI-powered content creation.
        </p>
      </div>
      <div className="max-w-xl mx-auto">
        <GroqCostCalculator />
      </div>
      <CTALifetime />
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Calculator Details</h2>
        <div className="space-y-4">
          <div>
            <p className="font-bold">Models:</p>
            <ul className="list-disc pl-6">
              <li>LLaMA 3.1 8B: Priced at $0.05 per 1M input tokens and $0.08 per 1M output tokens.</li>
              <li>GPT-OSS 20B: Priced at $0.1 per 1M input tokens and $0.5 per 1M output tokens.</li>
              <li>GPT-OSS 120B: Priced at $0.15 per 1M input tokens and $0.75 per 1M output tokens.</li>
              <li>Qwen3 32B: Priced at $0.3 per 1M input tokens and $0.79 per 1M output tokens.</li>
              <li>LLaMA 3.1 70B: Priced at $0.59 per 1M input tokens and $0.79 per 1M output tokens.</li>
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
            <p className="font-bold">Q: What is the Groq Cost Calculator?</p>
            <p>A: The Groq Cost Calculator is a tool that helps you estimate the cost of using different Groq models for generating text based on your specific requirements, such as input length, comment length, and the number of comments per day.</p>
          </div>
          <div>
            <p className="font-bold">Q: How does the calculator estimate the costs?</p>
            <p>A: The calculator uses the pricing information provided by Groq for each model and calculates the estimated cost based on the input length, comment length, and the number of comments per day. It provides both daily and monthly cost estimates.</p>
          </div>
          <div>
            <p className="font-bold">Q: What models are supported by the calculator?</p>
            <p>A: The calculator supports all latest Groq models including LLaMA 3.1 8B (entry-tier), GPT-OSS models (OpenAI open models), Qwen3 32B (balanced performance), LLaMA 3.1 70B (mid-range), and DeepSeek R1 Distill Llama 70B. Each model has different pricing for input and output tokens.</p>
          </div>
          <div>
            <p className="font-bold">Q: Can I customize the input and comment lengths?</p>
            <p>A: Yes, you can adjust the input length using the slider, ranging from 1000 to 10000 characters. For comment length, you can select from predefined options: 150, 300, 500, or 1000 characters.</p>
          </div>
          <div>
            <p className="font-bold">Q: How can I use the cost estimates?</p>
            <p>A: The cost estimates provided by the calculator can help you make informed decisions about which Groq model to use based on your budget and requirements. It allows you to optimize your spending on AI-powered content creation.</p>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center">
        <p className="text-sm"><span className="font-bold">Note:</span> Text length is the combination of input and output. For example, if your selected input text has 500 characters and the generated output text has 250 characters, the total text length is 750 characters. An average LinkedIn post is typically between 1000 and 3000 characters.</p>
      </div>
    </div>
  );
};

export default GroqCostCalculatorPage;