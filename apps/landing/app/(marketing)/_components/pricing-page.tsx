"use client"

import React, { useState } from "react";
import { CheckIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { Tag } from "@/components/Tag";
import { cva } from "class-variance-authority";
import { usePricing } from "@/app/web/providers/pricingContext";
import { Slider } from "@repo/ui/components/ui/slider";
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
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "premium";
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
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        premium: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0 hover:opacity-90",
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
  }
)

export function PricingPageComponent() {
  const [lifetimeUsers, setLifetimeUsers] = useState(1);
  const { buyNowProps } = usePricing();
  const [users, setUsers] = useState(1);

  const getLifetimePrice = (users: number): string => {
    switch (users) {
      case 1: return buyNowProps.price || '$49.99';
      case 5: return buyNowProps.teamPrice || '$199';
      case 10: return buyNowProps.agencyPrice || '$299';
      case 20: return buyNowProps.companyPrice || '$499';
      default: return buyNowProps.price || '$49.99';
    }
  };

  const getMonthlyPrice = (users: number): string => {
    switch (users) {
      case 1: return buyNowProps.monthlyPrice || '$9.99';
      case 5: return buyNowProps.teamMonthlyPrice || '$39';
      case 10: return buyNowProps.agencyMonthlyPrice || '$59';
      case 20: return buyNowProps.companyMonthlyPrice || '$99';
      default: return buyNowProps.monthlyPrice || '$9.99';
    }
  };

  const getPerUserPrice = (price: string, users: number): string => {
    const numericPrice = parseFloat(price.replace('$', ''));
    return `$${(numericPrice / users).toFixed(2)}`;
  };

  const getLifetimeUrl = (users: number): string => {
    switch (users) {
      case 1: return buyNowProps.url || '#';
      case 5: return buyNowProps.teamUrl || '#';
      case 10: return buyNowProps.agencyUrl || '#';
      case 20: return buyNowProps.companyUrl || '#';
      default: return buyNowProps.url || '#';
    }
  };

  const getMonthlyUrl = (users: number): string => {
    switch (users) {
      case 1: return buyNowProps.monthlyUrl || '#';
      case 5: return buyNowProps.teamMonthlyUrl || '#';
      case 10: return buyNowProps.agencyMonthlyUrl || '#';
      case 20: return buyNowProps.companyMonthlyUrl || '#';
      default: return buyNowProps.monthlyUrl || '#';
    }
  };

  const handleSliderChange = (value: number[]) => {
    const nearestValue = [1, 5, 10, 20].reduce((prev, curr) =>
      Math.abs(curr - value[0]) < Math.abs(prev - value[0]) ? curr : prev
    );
    setUsers(nearestValue);
  };

  const plans: Plan[] = [
    {
      name: "Lifetime",
      description: "Unlimited access to all features, forever.",
      price: getLifetimePrice(users),
      period: `up to ${users} User${users > 1 ? 's' : ''} / Lifetime`,
      features: pricingFeatures,
      tag: { color: "green", text: "Most Loved ❤️" },
      buttonText: "Get Lifetime Access",
      buttonVariant: "premium",
      buttonLink: getLifetimeUrl(users),
      highlight: true,
    },
    // {
    //   name: "Monthly",
    //   description: "Unlimited access to all features, billed monthly.",
    //   price: getMonthlyPrice(users),
    //   period: `Per Month (${users} User${users > 1 ? 's' : ''})`,
    //   features: pricingFeatures,
    //   tag: { color: "white", text: "Flexible" },
    //   buttonText: "Subscribe Now",
    //   buttonVariant: "premium",
    //   buttonLink: getMonthlyUrl(users),
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
        "Founder Support"
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
      buttonLink: "https://chromewebstore.google.com/detail/olly-social-media-sidekic/ofjpapfmglfjdhmadpegoeifocomaeje",
    }
  ];

  return (
    <div id="pricing" className="relative mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center lg:max-w-4xl">
        <h2 className="font-cal text-base leading-7 text-blue-600">Pricing</h2>
        <p className="mt-2 font-cal text-3xl text-gray-900 sm:text-5xl">
          Choose the plan that fits your needs.
        </p>
        {/* <p className="mt-6 text-base leading-8 text-gray-600 sm:text-lg">
          Get access to <span className="font-bold">Quality</span> and{" "}
          <span className="font-bold">Quantity</span> with our flexible pricing options.
        </p> */}
      </div>

      <div className="mt-8 mb-8">
        <p className="text-center text-sm font-medium mb-4">Select number of users 🤗</p>
        <Slider
          defaultValue={[users]}
          max={20}
          step={1}
          onValueChange={handleSliderChange}
          className="w-full max-w-md mx-auto"
        />
        <div className="flex justify-between mt-2 text-sm text-gray-600 max-w-md mx-auto">
          <span>1</span>
          <span>5</span>
          <span>10</span>
          <span>20</span>
        </div>
      </div>

      <div className="bg-white py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2 mx-auto max-w-4xl">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-3xl bg-white p-6 shadow-md ${plan.highlight ? "shadow-lg shadow-teal-600" : ""
                  }`}
              >
                <div className="flex items-center">
                  <h3 className="font-cal text-xl text-gray-900 sm:text-2xl">
                    {plan.name}
                  </h3>
                  {plan.tag && (
                    <div className="ml-4">
                      <Tag color={plan.tag.color}>{plan.tag.text}</Tag>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
                <p className="mt-4 text-sm leading-6 text-gray-600">
                  Runs fully locally & with Popular Text Generation Models.
                </p>
                {plan.name !== "Free Forever" && (
                  <p className="text-xs text-blue-500 mt-2">
                    <Link href="/ai-cost-calculators" target="_blank">
                      API Cost calculator
                    </Link>
                  </p>
                )}
                <div className="mt-5">
                  <p className="text-3xl font-extrabold text-gray-900">
                    {plan.price}
                    {plan.name !== "Free Forever" && (
                      <span className="ml-2 text-xs font-normal text-gray-500">
                        ({getPerUserPrice(plan.price, users)}/user)
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-500">
                    {plan.period}
                  </p>
                </div>
                <ul
                  role="list"
                  className="mt-6 space-y-3 text-sm leading-6 text-gray-600"
                >
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex gap-x-2">
                      <CheckIcon
                        className="h-5 w-5 flex-none text-blue-600"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                  {plan.unavailableFeatures &&
                    plan.unavailableFeatures.map((feature, idx) => (
                      <li key={idx} className="flex gap-x-2">
                        <XIcon
                          className="h-5 w-5 flex-none text-red-600"
                          aria-hidden="true"
                        />
                        {feature}
                      </li>
                    ))}
                </ul>
                <a
                  href={plan.buttonLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${buttonVariants({ variant: plan.buttonVariant, size: "lg" })} mt-8 w-full`}
                >
                  {plan.buttonText}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}