import { Suspense, lazy } from "react";
import HeroSection from "./(marketing)/_components/new/hero";
import LogoCloud from "./(marketing)/_components/logo-cloud";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

// Lazy load below-the-fold components
const VideoTrailer = lazy(() => import("./(marketing)/_components/video-trailer").then(m => ({ default: m.VideoTrailer })));
const ScrollingFeatures = lazy(() => import("./(marketing)/_components/scrolling-features").then(m => ({ default: m.ScrollingFeatures })));
const MidContentSection = lazy(() => import("./(marketing)/_components/mid-content"));
const Pricing = lazy(() => import("./(marketing)/_components/pricing-2").then(m => ({ default: m.Pricing })));
const CompactSalesContact = lazy(() => import("./(marketing)/contact-sales/_components/component-contact-sales").then(m => ({ default: m.CompactSalesContact })));
const PlatformGrowthSection = lazy(() => import("./(marketing)/_components/mid-cta"));
const Testimonials = lazy(() => import("./(marketing)/_components/testimonials").then(m => ({ default: m.Testimonials })));
const FAQSection = lazy(() => import("./(marketing)/_components/faq-section"));

export default function HomePage() {
  return (
    <div className="min-h-full">
      <div className="relative z-50">
        <HeroSection />
      </div>
      <div className="relative z-10">
        <LogoCloud />
      </div>
      <Suspense fallback={<div className="aspect-video w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
        <VideoTrailer />
      </Suspense>
      
      <Suspense fallback={<div className="h-96 w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
        <ScrollingFeatures />
      </Suspense>
      
      <Suspense fallback={<div className="h-80 w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
        <MidContentSection />
      </Suspense>

      <Suspense fallback={<div className="h-96 w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
        <Pricing />
      </Suspense>
      
      <Suspense fallback={<div className="h-64 w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
        <CompactSalesContact />
      </Suspense>
      
      <Suspense fallback={<div className="h-72 w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
        <PlatformGrowthSection />
      </Suspense>
      
      <Suspense fallback={<div className="h-80 w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
        <Testimonials />
      </Suspense>
      
      <Suspense fallback={<div className="h-96 w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
        <FAQSection />
      </Suspense>
    </div>
  );
}
