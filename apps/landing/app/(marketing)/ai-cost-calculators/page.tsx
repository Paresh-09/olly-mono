import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { CTALifetime } from '../_components/cta-lifetime';
import { SiOpenai, SiAnthropic } from 'react-icons/si';
import { RiGeminiFill } from "react-icons/ri";


export const metadata: Metadata = {
  title: 'AI Cost Calculators | Compare Pricing for OpenAI, Claude, Google Gemini & More',
  description: 'Compare and estimate costs for all major AI providers including OpenAI, Anthropic Claude, Google Gemini, and Groq. Find the most cost-effective AI model for your content generation needs with Olly.',
  keywords: 'AI cost calculator, OpenAI pricing, Claude pricing, Gemini pricing, Groq pricing, AI model comparison, LLM cost comparison, text generation cost, ai content creation cost, Olly',
  alternates: {
    canonical: "/ai-cost-calculators",
  },
  openGraph: {
    title: 'AI Cost Calculators | Compare Pricing for OpenAI, Claude, Google Gemini & More',
    description: 'Compare and estimate costs for all major AI providers including OpenAI, Anthropic Claude, Google Gemini, and Groq. Find the most cost-effective AI model for your content generation needs with Olly.',
    url: 'https://www.olly.social/ai-cost-calculators',
    type: 'website',
    images: [
      {
        url: '/cost-calculator-ai.png',
        width: 1200,
        height: 630,
        alt: 'AI Cost Calculators',
      },
    ],
  },
};

const calculators = [
  {
    title: 'OpenAI Cost Calculator',
    description: 'Calculate costs for GPT-4o, GPT-5, O1, O3, and other OpenAI models. From budget-friendly mini models to premium reasoning models.',
    href: '/openai-cost-calculator',
    models: ['gpt-4o-mini', 'gpt-5-2025-08-07', 'gpt-4o', 'o1-preview'],
    priceRange: '$0.1 - $60 per 1M tokens',
    icon: <SiOpenai className="w-8 h-8 text-gray-700" />,
  },
  {
    title: 'Claude Cost Calculator',
    description: 'Estimate costs for Anthropic Claude models including Haiku, Sonnet, and Opus. Fast, efficient, and highly capable AI models.',
    href: '/claude-cost-calculator',
    models: ['claude-3-5-haiku-latest', 'claude-sonnet-4-0', 'claude-opus-4-1-20250805'],
    priceRange: '$0.25 - $75 per 1M tokens',
    icon: <SiAnthropic className="w-8 h-8 text-gray-700" />,
  },
  {
    title: 'Google Gemini Calculator',
    description: 'Calculate costs for Google Gemini models including Flash, Pro variants with different context lengths and capabilities.',
    href: '/google-cost-calculator',
    models: ['gemini-2.0-flash-lite', 'gemini-2.5-flash', 'gemini-2.5-pro'],
    priceRange: '$0.05 - $10 per 1M tokens',
    icon: <RiGeminiFill className="w-7 h-7 text-gray-700" />,
  },
  {
    title: 'Groq Cost Calculator',
    description: 'Estimate costs for Groq models including LLaMA, GPT-OSS, Qwen, and DeepSeek. High-performance open-source models.',
    href: '/groq-cost-calculator',
    models: ['LLaMA 3.1 8B', 'Qwen3 32B', 'LLaMA 3.1 70B'],
    priceRange: '$0.05 - $0.99 per 1M tokens',
    icon: <img src="/assets/groq.svg" alt="Groq" className="w-8 h-8" />,
  },
];

const AICostCalculatorsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">AI Cost Calculators</h1>
        <p className="text-gray-600 mb-8 max-w-3xl mx-auto">
          Compare and estimate costs for all major AI providers. Find the most cost-effective AI model for your content generation needs.
          Calculate costs for text generation, comments, posts, and more across different LLM providers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {calculators.map((calculator) => (
          <Card key={calculator.href} className="border border-gray-200 hover:border-gray-300 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                {calculator.icon}
                <CardTitle className="text-xl font-semibold">{calculator.title}</CardTitle>
              </div>
              <p className="text-gray-600">{calculator.description}</p>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="font-semibold text-sm text-gray-700 mb-2">Popular Models:</p>
                <div className="flex flex-wrap gap-1">
                  {calculator.models.map((model) => (
                    <span key={model} className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700 border">
                      {model}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <p className="font-semibold text-sm text-gray-700">Price Range:</p>
                <p className="text-sm text-gray-600">{calculator.priceRange}</p>
              </div>
              <Link href={calculator.href}>
                <Button className="w-full">
                  Calculate Costs
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <CTALifetime />

      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Why Use AI Cost Calculators?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Budget Optimization</h3>
            <p className="text-gray-600">
              Compare costs across different AI providers to find the most cost-effective solution for your content generation needs.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Usage Planning</h3>
            <p className="text-gray-600">
              Estimate daily and monthly costs based on your specific usage patterns to plan your AI budget effectively.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚖️</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Model Comparison</h3>
            <p className="text-gray-600">
              Compare performance and pricing across different models to choose the best fit for your quality and budget requirements.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <p className="font-bold">Q: How accurate are these cost estimates?</p>
            <p>A: Our calculators use the latest pricing information from each AI provider. However, actual costs may vary based on usage patterns, promotional pricing, and other factors. These are ballpark estimates to help with budget planning.</p>
          </div>
          <div>
            <p className="font-bold">Q: Which AI provider is the most cost-effective?</p>
            <p>A: It depends on your specific needs. Groq offers the lowest prices for open-source models, while Google Gemini provides competitive pricing for high-quality models. OpenAI offers premium models with advanced capabilities at higher prices.</p>
          </div>
          <div>
            <p className="font-bold">Q: How do I choose the right model for my needs?</p>
            <p>A: Consider factors like quality requirements, budget, speed, and specific capabilities. Start with budget-friendly options like Gemini Flash or GPT-4o Mini for basic tasks, and upgrade to premium models for complex reasoning tasks.</p>
          </div>
          <div>
            <p className="font-bold">Q: Are there any hidden costs I should be aware of?</p>
            <p>A: Most providers charge based on token usage only. However, some platforms may have minimum commitments, rate limits, or additional fees for API usage. Always check the provider's pricing page for complete details.</p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          <span className="font-bold">Note:</span> Pricing information is updated regularly but may change. 
          Always verify current pricing with the respective AI provider before making purchasing decisions.
        </p>
      </div>
    </div>
  );
};

export default AICostCalculatorsPage;