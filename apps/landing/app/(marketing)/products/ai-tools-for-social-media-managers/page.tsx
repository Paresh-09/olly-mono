import { Suspense } from "react";
import { ReviewSkeleton } from "../../_components/reviews/review-skeleton";

import { ReviewsSection } from "../../_components/reviews/reviews-section";

import { Metadata } from "next";

import { Heading } from "../../_components/heading";
import { Testimonials } from "../../_components/testimonials";
import { FeaturesAutomation, FeaturesUnsubscribe } from "../../_components/features";
import { Pricing } from "../../_components/pricing-2";
import FAQs from "../../_components/faq-section";
import { CTA } from "../../_components/cta";

export const metadata: Metadata = {
  title: "AI Post Generator | Olly.social",
  description:
    "Revolutionize your content creation process with Olly.social's AI Post Generator. This dynamic tool uses artificial intelligence to craft engaging, relevant, and customized social media posts in seconds. Designed for marketers, influencers, and businesses looking to elevate their social media presence, our AI Post Generator streamlines content production, allowing you to focus on strategy and engagement. Enhance your social media content with AI-powered precision and creativity.",
  alternates: { canonical: "/ai-post-generator" },
};

export default function AIPostGenerator() {
  return (
    <>
      <Heading
        title="AI Post Generator"
        subtitle="Transform your social media content with Olly.social's AI Post Generator for LinkedIn, Facebook, Twitter, Instagram, X, Bluesky, Product Hunt, Quora, Medium, Reddit, YouTube, TikTok, Snapchat, Pinterest, and more. Leverage AI to create engaging, relevant, and customized posts in seconds, tailored to your audience and platform of choice. Designed for marketers, influencers, and businesses, our AI Post Generator streamlines content production, allowing you to focus on strategy and engagement. Enhance your social media content with AI-powered precision and creativity."
        image="/step_main.gif" 
      />
      <Testimonials />
      <FeaturesUnsubscribe />
      <Suspense>
        <Pricing />
      </Suspense>
      <FAQs />
      <Suspense fallback={<ReviewSkeleton />}>
        <ReviewsSection />
      </Suspense>

      <CTA />
    </>
  );
}
