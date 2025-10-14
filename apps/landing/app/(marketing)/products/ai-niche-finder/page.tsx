import { Suspense } from "react";
import { ReviewSkeleton } from "../../_components/reviews/review-skeleton";
import { ReviewsSection } from "../../_components/reviews/reviews-section";
import { Metadata } from "next";
import { Heading } from "../../_components/heading";
import { Testimonials } from "../../_components/testimonials";
import { FeaturesAutomation } from "../../_components/features";
import { Pricing } from "../../_components/pricing-2";
import FAQs from "../../_components/faq-section";
import { CTA } from "../../_components/cta";

export const metadata: Metadata = {
  title: "AI Niche Finder | Olly.social",
  description:
    "Olly's AI Niche Finder helps you discover your perfect content creation niche using AI-powered analysis. Perfect for content creators, entrepreneurs, and marketers looking to find profitable market gaps. Get personalized niche recommendations based on your skills, interests, and market opportunities.",
  alternates: { canonical: "/products/ai-niche-finder" },
};

export default function AINicheFinder() {
  return (
    <>
      <Heading
        title="AI Niche Finder"
        subtitle="Olly's AI Niche Finder helps you discover your perfect content creation niche using AI-powered analysis. Perfect for content creators, entrepreneurs, and marketers looking to find profitable market gaps."
        image="/step_main.gif"
      />
      <Testimonials />
      <FeaturesAutomation />
      <Suspense>
        <Pricing />
      </Suspense>
      <FAQs />
      <Suspense fallback={<ReviewSkeleton />}>
        <ReviewsSection />
      </Suspense>
      <CTA customLink="https://olly.social/tools/ai-niche-finder" customText="Try AI Niche Finder" />
    </>
  );
} 