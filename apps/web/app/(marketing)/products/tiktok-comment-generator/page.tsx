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
  title: "TikTok Comment Generator | Olly.social",
  description:
    "Elevate your TikTok content with Olly.social's AI Comment Generator. Tailored for TikTok creators and marketers, this tool generates engaging, personalized comments to enhance your videos' visibility and engagement. It's perfect for anyone looking to boost their TikTok presence, offering a streamlined approach to creating comments that resonate with your target audience and foster a dynamic TikTok community.",
  alternates: { canonical: "/tiktok-comment-generator" },
};

export default function TikTokCommentGenerator() {
  return (
    <>
      <Heading
        title="TikTok Comment Generator"
        subtitle="Transform your TikTok strategy with Olly.social's AI-driven comments, designed to captivate and engage your audience."
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

      <CTA />
    </>
  );
}