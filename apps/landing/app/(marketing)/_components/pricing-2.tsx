"use client";

import React, { useState } from "react";
import { CheckIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { Tag } from "@/components/Tag";
import { cva } from "class-variance-authority";
import { usePricing } from "@/app/web/providers/pricingContext";
import pricingFeatures from "./pricing-features";

type TagColor = "green" | "white" | "red";

interface Plan {
  name: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  unavailableFeatures?: string[];
  buttonText: string;
  buttonVariant?:
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "premium";
  buttonLink: string;
  tag?: {
    color: TagColor;
    text: string;
  };
  highlight?: boolean;
}

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        premium:
          "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0 hover:opacity-90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export function Pricing() {
  const { buyNowProps } = usePricing();
  const [users, setUsers] = useState(1);

  // Available user tiers
  const userTiers = [1, 5, 10, 20];

  const getLifetimePrice = (users: number): string => {
    switch (users) {
      case 1:
        return buyNowProps.price || "$49.99";
      case 5:
        return buyNowProps.teamPrice || "$199";
      case 10:
        return buyNowProps.agencyPrice || "$299";
      case 20:
        return buyNowProps.companyPrice || "$499";
      default:
        return buyNowProps.price || "$49.99";
    }
  };

  const getMonthlyPrice = (users: number): string => {
    switch (users) {
      case 1:
        return buyNowProps.monthlyPrice || "$9.99";
      case 5:
        return buyNowProps.teamMonthlyPrice || "$39";
      case 10:
        return buyNowProps.agencyMonthlyPrice || "$59";
      case 20:
        return buyNowProps.companyMonthlyPrice || "$99";
      default:
        return buyNowProps.monthlyPrice || "$9.99";
    }
  };

  const getLifetimeCredits = (users: number): number => {
    return users * 100;
  };

  const getMonthlyCredits = (users: number): number => {
    return users * 100;
  };

  const getPerUserPrice = (price: string, users: number): string => {
    const numericPrice = parseFloat(price.replace("$", ""));
    return `$${(numericPrice / users).toFixed(2)}`;
  };

  const getLifetimeUrl = (users: number): string => {
    switch (users) {
      case 1:
        return buyNowProps.url || "#";
      case 5:
        return buyNowProps.teamUrl || "#";
      case 10:
        return buyNowProps.agencyUrl || "#";
      case 20:
        return buyNowProps.companyUrl || "#";
      default:
        return buyNowProps.url || "#";
    }
  };

  const getMonthlyUrl = (users: number): string => {
    switch (users) {
      case 1:
        return buyNowProps.monthlyUrl || "#";
      case 5:
        return buyNowProps.teamMonthlyUrl || "#";
      case 10:
        return buyNowProps.agencyMonthlyUrl || "#";
      case 20:
        return buyNowProps.companyMonthlyUrl || "#";
      default:
        return buyNowProps.monthlyUrl || "#";
    }
  };

  const plans: Plan[] = [
    {
      name: "Lifetime",
      description: "Unlimited access to all features, forever.",
      price: getLifetimePrice(users),
      period: `up to ${users} User${users > 1 ? "s" : ""} / Lifetime + ${getLifetimeCredits(users)} LLM Credits`,
      features: pricingFeatures,
      buttonText: "Get Lifetime Access",
      buttonVariant: "default",
      buttonLink: getLifetimeUrl(users),
    },
    // {
    //   name: "Monthly",
    //   description: "Unlimited access to all features, billed monthly.",
    //   price: getMonthlyPrice(users),
    //   period: `Per Month (${users} User${users > 1 ? "s" : ""} + ${getMonthlyCredits(users)} LLM Credits)`,
    //   features: pricingFeatures,
    //   tag: { color: "white", text: "Most Loved ❤️" },
    //   buttonText: "Start 7-Day  Free Trial",
    //   buttonVariant: "default",
    //   buttonLink: getMonthlyUrl(users),
    //   highlight: true,
    // },
    {
      name: "Free Forever",
      description: "Get started for free, forever.",
      price: "$0",
      period: "Forever",
      features: [
        "20 Free Comments / Day",
        "Supported on all Social Media Platforms",
        "Limited Customisation Options",
        "Founder Support",
      ],
      unavailableFeatures: [
        "OpenAI, Claude, Gemini, Straico, OpenRouter, Local Models (via Ollama)",
        "AI Personalities",
        "Custom Actions",
        "Gamification & Leaderboard",
        "Full Customisation Suite",
      ],
      buttonText: "Get Started",
      buttonVariant: "outline",
      buttonLink:
        "https://chromewebstore.google.com/detail/olly-social-media-sidekic/ofjpapfmglfjdhmadpegoeifocomaeje",
    },
  ];

  return (
    <div
      id="pricing"
      className="py-10 sm:py-20 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            💰 Pricing
          </div>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
            Choose the plan that fits your needs
          </h2>
          <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get started for free, upgrade when you're ready. All plans include our core features with flexible pricing for teams of any size.
          </p>
        </div>

        {/* User Selection */}
        <div className="mb-10 sm:mb-16">
          <p className="text-center text-base sm:text-lg font-medium mb-4 sm:mb-6 text-gray-700">
            Select number of users
          </p>
          <div className="flex justify-center">
            <div className="inline-flex p-1 bg-gray-50 rounded-2xl border border-gray-200 gap-1 sm:gap-2">
              {userTiers.map((tier) => (
                <button
                  key={tier}
                  onClick={() => setUsers(tier)}
                  className={`
                    px-4 sm:px-8 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all duration-200
                    ${users === tier
                      ? "bg-white shadow-lg text-blue-600 scale-105"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    }
                  `}
                >
                  {tier} {tier === 1 ? "User" : "Users"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl sm:rounded-3xl border transition-all duration-300 group ${
                // Order: Lifetime first, Free second
                plan.name === 'Lifetime' ? 'order-1' :
                  'order-2'
                } ${plan.highlight
                  ? "border-blue-200 bg-blue-50/50 backdrop-blur-sm shadow-xl hover:shadow-2xl scale-100 sm:scale-105"
                  : "border-gray-200 bg-white/50 backdrop-blur-sm hover:border-gray-300 hover:shadow-lg"
                }`}
            >
              {/* Popular Badge */}
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium shadow-lg">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-4 sm:p-8">
                {/* Plan Header */}
                <div className="text-center mb-6 sm:mb-8">
                  <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <h3 className="text-lg sm:text-2xl font-bold text-gray-900">
                      {plan.name}
                    </h3>
                    {plan.tag && !plan.highlight && (
                      <Tag color={plan.tag.color}>{plan.tag.text}</Tag>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-4 sm:mb-6">
                    <div className="flex items-baseline justify-center gap-1 sm:gap-2">
                      <span className="text-3xl sm:text-5xl font-bold text-gray-900">
                        {plan.price}
                      </span>
                      {plan.name !== "Free Forever" && (
                        <span className="text-xs sm:text-sm text-gray-500 font-medium">
                          ({getPerUserPrice(plan.price, users)}/user)
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1 sm:mt-2 font-medium text-xs sm:text-base">
                      {plan.period}
                    </p>
                  </div>

                  {/* CTA Button */}
                  <a
                    href={plan.buttonLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg transition-all duration-200 ${plan.highlight
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105"
                      : plan.buttonVariant === "outline"
                        ? "border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                        : "bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg hover:scale-105"
                      }`}
                  >
                    {plan.buttonText}
                  </a>
                </div>

                {/* Additional Info */}
                <div className="text-center mb-4 sm:mb-6 space-y-1 sm:space-y-2">
                  <p className="text-xs sm:text-sm text-gray-600">
                    Runs fully locally & with Popular Text Generation Models.
                  </p>
                  {plan.name !== "Free Forever" && (
                    <Link href="/ai-cost-calculators" target="_blank" className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium">
                      API Cost calculator →
                    </Link>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="font-semibold text-gray-900 text-base sm:text-lg mb-2 sm:mb-4">What's included:</h4>
                  <ul className="space-y-2 sm:space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 sm:gap-3">
                        <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-xs sm:text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                    {plan.unavailableFeatures &&
                      plan.unavailableFeatures.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 sm:gap-3">
                          <XIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-500 text-xs sm:text-sm leading-relaxed line-through">{feature}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
