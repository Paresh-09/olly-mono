"use client";

import React, { useState } from 'react';
import { MessageSquare, Sparkles, TrendingUp, Users, Heart, Megaphone } from 'lucide-react';
import { Button } from '@repo/ui/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface UseCase {
  id: string;
  icon: React.ReactNode;
  title: string;
  image: string;
  featureImage: string;
}

const useCases: UseCase[] = [
  {
    id: 'commenting',
    icon: <MessageSquare className="w-4 h-4" />,
    title: 'AI Commenting',
    image: '/use-cases/commenting.png',
    featureImage: '/use-cases/commenting-feature.png'
  },
  {
    id: 'posts',
    icon: <Sparkles className="w-4 h-4" />,
    title: 'Post Creation',
    image: '/use-cases/posts.png',
    featureImage: '/use-cases/posts-feature.png'
  },
  {
    id: 'viral',
    icon: <TrendingUp className="w-4 h-4" />,
    title: 'Viral Scores',
    image: '/use-cases/viral.png',
    featureImage: '/use-cases/viral-feature.png'
  },
  {
    id: 'influencers',
    icon: <Users className="w-4 h-4" />,
    title: 'Find Influencers',
    image: '/use-cases/influencers.png',
    featureImage: '/use-cases/influencers-feature.png'
  },
  {
    id: 'engagement',
    icon: <Heart className="w-4 h-4" />,
    title: 'Engagement',
    image: '/use-cases/engagement.png',
    featureImage: '/use-cases/engagement-feature.png'
  },
  {
    id: 'marketing',
    icon: <Megaphone className="w-4 h-4" />,
    title: 'Marketing',
    image: '/use-cases/marketing.png',
    featureImage: '/use-cases/marketing-feature.png'
  }
];

export const UseCaseSelector = () => {
  const [hoveredCase, setHoveredCase] = useState<string>('commenting');

  return (
    <div className="w-full max-w-6xl mx-auto relative">
      {/* Main Image Display */}
      <div className="relative h-[600px] rounded-2xl overflow-hidden">
        <AnimatePresence>
          {useCases.map((useCase) => (
            <motion.div
              key={useCase.id}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: hoveredCase === useCase.id ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={useCase.image}
                alt={useCase.title}
                className="w-full h-full object-contain blur-[2px]"
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Use Cases Menu */}
        <div className="absolute top-6 right-6 w-[250px]">
          {useCases.map((useCase) => (
            <motion.div
              key={useCase.id}
              className={`
                relative p-2.5 rounded-lg cursor-pointer transition-all mb-1
                ${hoveredCase === useCase.id
                  ? 'bg-white/80 backdrop-blur-sm shadow-sm'
                  : 'hover:bg-white/50 hover:backdrop-blur-sm'
                }
              `}
              onMouseEnter={() => setHoveredCase(useCase.id)}
              whileHover={{ x: 4 }}
            >
              <div className="flex items-center gap-3">
                <div className={`
                  p-1.5 rounded-md bg-white/80
                  ${hoveredCase === useCase.id ? 'text-blue-500' : 'text-gray-600'}
                `}>
                  {useCase.icon}
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {useCase.title}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature Highlight and CTA */}
        <div className="absolute bottom-8 left-8 flex flex-col items-start gap-6">
          {/* Feature Image */}
          <AnimatePresence mode="wait">
            <motion.div
              key={hoveredCase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl overflow-hidden"
            >
              <img
                src={useCases.find(c => c.id === hoveredCase)?.featureImage}
                alt={`${useCases.find(c => c.id === hoveredCase)?.title} feature`}
                className="max-w-[400px] rounded-xl"
                style={{ height: 'auto' }}
              />
            </motion.div>
          </AnimatePresence>

          {/* CTA Button */}
          <Button
            size="lg"
            variant="default"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UseCaseSelector; 