'use client'

import React from 'react';
import { Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Tag } from '@/components/Tag';
import { Button } from '@repo/ui/components/ui/button';
import { usePricing } from '@/providers/pricingContext';

type TagColor = "green" | "white" | "red";

interface PlanType {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlight?: boolean;
  tag?: { color: TagColor; text: string };
  type: "lifetime" | "agency" | "free"; // COMMENTED OUT: | "monthly"
  url: string;
}

export default function PricingPlans() {
  const { buyNowProps } = usePricing();

  const plans: PlanType[] = [
    {
      name: "Lifetime",
      price: buyNowProps.price,
      period: "1 User / Lifetime",
      description: "Unlimited access to all features, forever.",
      features: [
        "OpenAI, Claude, Gemini, Straico, OpenRouter, Local Models (via Ollama)",
        "AI Personalities",
        "Custom Actions",
        "Gamification & Leaderboard",
        "Full Customisation Suite",
      ],
      cta: "Get Lifetime Access",
      highlight: true,
      tag: { color: "green", text: "Best Value ❤️" },
      type: "lifetime",
      url: buyNowProps.url,
    },
    // COMMENTED OUT - Monthly plans disabled
    // {
    //   name: "Monthly",
    //   price: buyNowProps.monthlyPrice || "$9.99",
    //   period: "1 User / Monthly",
    //   description: "Unlimited access to all features, billed monthly.",
    //   features: [
    //     "OpenAI, Claude, Gemini, Straico, OpenRouter, Local Models (via Ollama)",
    //     "AI Personalities",
    //     "Custom Actions",
    //     "Gamification & Leaderboard",
    //     "Full Customisation Suite",
    //   ],
    //   cta: "Subscribe Now",
    //   tag: { color: "white", text: "Flexible" },
    //   type: "monthly",
    //   url: buyNowProps.monthlyUrl || "",
    // },
    {
      name: "Agency",
      price: buyNowProps.agencyPrice || "$299",
      period: "10 Users / Lifetime",
      description: "Great for Agencies 🧑‍🤝‍🧑",
      features: [
        "OpenAI, Claude, Gemini, Straico, OpenRouter, Local Models (via Ollama)",
        "AI Personalities",
        "Custom Actions",
        "Gamification & Leaderboard",
        "Full Customisation Suite",
      ],
      cta: "Get Agency Plan",
      tag: { color: "red", text: "For Teams" },
      type: "agency",
      url: buyNowProps.agencyUrl || "",
    },
    {
      name: "Free Forever",
      price: "$0",
      period: "Forever",
      description: "Get started for free, forever.",
      features: [
        "20 Free Comments / Day",
        "Supported on all Social Media Platforms",
        "Limited Customisation Options",
        "Founder Support",
      ],
      cta: "Get Started",
      tag: { color: "white", text: "Free" },
      type: "free",
      url: "https://chromewebstore.google.com/detail/olly-social-media-sidekic/ofjpapfmglfjdhmadpegoeifocomaeje",
    },
  ];

  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <h2 className="text-4xl font-bold text-center mb-5">Choose Your Plan</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={`flex flex-col ${
              plan.highlight ? 'shadow-xl shadow-teal-600/20 scale-105 z-10' : ''
            }`}
          >
            <CardHeader className="pb-8">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                {plan.tag && <Tag color={plan.tag.color}>{plan.tag.text}</Tag>}
              </div>
              <CardDescription className="text-sm">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-4xl font-bold mb-4">
                {plan.price}
                <span className="text-sm text-gray-500 font-normal"> {plan.period}</span>
              </p>
              <ul className="space-y-4 text-sm mt-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="mr-3 h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pt-8">
              <Button
                variant={plan.highlight ? "premium" : "outline"}
                size="lg"
                className="w-full text-lg py-6"
                onClick={() => window.open(plan.url, '_blank')}
              >
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}