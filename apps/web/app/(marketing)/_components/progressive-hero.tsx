'use client';

import dynamic from 'next/dynamic';
import StaticHeroSection from './static-hero';
import { useDelayedHydration } from './use-delayed-hydration';

// Dynamically import the animated hero with no SSR
const AnimatedHeroSection = dynamic(() => import('./new/hero'), {
  ssr: false,
  loading: () => <StaticHeroSection />
});

export default function ProgressiveHeroSection() {
  // Wait for browser to be idle before loading animations
  const isReadyForAnimations = useDelayedHydration(50);

  // Show static hero first, then switch to animated version when ready
  if (!isReadyForAnimations) {
    return <StaticHeroSection />;
  }

  return <AnimatedHeroSection />;
}