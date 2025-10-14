"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/components/ui/button';
import {
  MessageCircle,
  Bot,
  Sparkles,
  Hash,
  MessageSquare,
  Monitor,
  Zap,
  Target,
  BarChart,
  Star,
} from 'lucide-react';
import { Badge } from "@repo/ui/components/ui/badge";
import { cn } from '@/lib/utils';

const features = [
  {
    id: 1,
    title: "AI Assistant",
    icon: <Bot className="w-12 h-12 text-teal-500" />,
    description: "Select any text to get instant AI-powered engagement suggestions",
    detail: "Smart text analysis and response generation",
    comingSoon: false
  },
  {
    id: 2,
    title: "Quick Comments",
    icon: <MessageCircle className="w-12 h-12 text-teal-500" />,
    description: "Generate engaging comments with one click using AI",
    detail: "Instant professional responses",
    comingSoon: false
  },
  {
    id: 3,
    title: "Auto Commenting",
    icon: <Hash className="w-12 h-12 text-teal-500" />,
    description: "Scale your engagement with AI-powered auto commenting",
    detail: "Automated engagement at scale",
    comingSoon: false
  },
  {
    id: 4,
    title: "AI Tasks",
    icon: <Sparkles className="w-12 h-12 text-teal-500" />,
    description: "Transform web content into engaging social media posts",
    detail: "Content transformation made easy",
    comingSoon: true
  },
  {
    id: 5,
    title: "Comment Monitoring",
    icon: <MessageSquare className="w-12 h-12 text-teal-500" />,
    description: "Monitor comments and automate Instagram DM responses",
    detail: "Never miss an opportunity",
    comingSoon: true
  },
  {
    id: 6,
    title: "Desktop Agent",
    icon: <Monitor className="w-12 h-12 text-teal-500" />,
    description: "Full social media automation from your desktop",
    detail: "Complete automation suite",
    comingSoon: true
  }
];

export function HowItWorks() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 md:py-24 bg-transparent from-slate-50 via-white to-teal-50">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="font-cal text-base leading-7 text-teal-600 bg-teal-50 inline-block px-4 py-1.5 rounded-full mb-6">
            How it works
          </h2>
          <p className="text-4xl md:text-6xl font-cal mb-6 text-gray-900">
            Features that{' '}
            <span className="text-teal-600 relative">
              deliver
              <svg
                className="absolute -bottom-2 left-0 w-full h-2"
                viewBox="0 0 200 12"
              >
                <path
                  d="M2 6c50-3 100-3 150 0"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-teal-400"
                />
              </svg>
            </span>{' '}
            results
          </p>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Ground-breaking features to help you get the most out of social media.
            <span className="block mt-2 text-2xl font-semibold text-teal-600">
              See them in action.
            </span>
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-8 items-center">
          {/* Left - Available Features */}
          <div className="lg:col-span-1 space-y-6">
            {features.slice(0, 3).map((feature, index) => (
              <div
                key={feature.id}
                className={cn(
                  "bg-white rounded-2xl p-6 shadow-lg border border-gray-100 cursor-pointer transition-all duration-300 hover:shadow-xl",
                  current === index && "ring-2 ring-teal-500 border-teal-200 bg-teal-50"
                )}
                onClick={() => setCurrent(index)}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-lg",
                    current === index ? "bg-teal-500 text-white" : "bg-teal-100 text-teal-600"
                  )}>
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {feature.detail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Center - Dynamic Content */}
          <div className="lg:col-span-1 relative">
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl p-8 text-white shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="text-center"
                >
                  <div className="text-6xl mb-4">
                    {features[current].icon}
                  </div>
                  <div className="text-2xl font-cal mb-3">
                    {features[current].title}
                  </div>
                  <div className="text-lg opacity-90 mb-6">
                    {features[current].description}
                  </div>

                  {/* Status Badge */}
                  {features[current].comingSoon ? (
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      Coming Soon
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      Available Now
                    </Badge>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Progress Indicators */}
              <div className="flex justify-center mt-6 space-x-2">
                {features.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-8 rounded-full transition-all duration-300 cursor-pointer ${index === current
                      ? 'bg-white'
                      : 'bg-white/30'
                      }`}
                    onClick={() => setCurrent(index)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right - Coming Soon Features */}
          <div className="lg:col-span-1 space-y-6">
            {features.slice(3).map((feature, index) => (
              <div
                key={feature.id}
                className={cn(
                  "bg-white rounded-2xl p-6 shadow-lg border border-gray-100 cursor-pointer transition-all duration-300 hover:shadow-xl relative",
                  current === index + 3 && "ring-2 ring-teal-500 border-teal-200 bg-teal-50"
                )}
                onClick={() => setCurrent(index + 3)}
              >
                <Badge variant="secondary" className="absolute top-4 right-4 bg-blue-100 text-blue-800">
                  Coming Soon
                </Badge>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-lg",
                    current === index + 3 ? "bg-teal-500 text-white" : "bg-teal-100 text-teal-600"
                  )}>
                    {index === 0 && <Sparkles className="w-6 h-6" />}
                    {index === 1 && <MessageSquare className="w-6 h-6" />}
                    {index === 2 && <Monitor className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {feature.detail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Demo Section */}

      </div>
    </section>
  );
}
