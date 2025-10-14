import { Suspense } from "react";
import { ReviewSkeleton } from "../../_components/reviews/review-skeleton";

import { ReviewsSection } from "../../_components/reviews/reviews-section";

import { Metadata } from "next";
// import { LogoCloud } from "@/app/(landing)/home/LogoCloud";

import { Heading } from "../../_components/heading";
import { Testimonials } from "../../_components/testimonials";
import { FeaturesAutomation } from "../../_components/features";
import { Pricing } from "../../_components/pricing-2";
import FAQs from "../../_components/faq-section";
import { CTA } from "../../_components/cta";

export const metadata: Metadata = {
  title: "Bluesky Comment Generator Online | Olly.social",
  description:
    "Olly, your AI-Powered Social Media Assistant to Generated Comments, Posts, Viral Scores for Your Bluesky social media posts. Try Olly's AI Comment Generator for free. Answer things like: What is Bluesky? How to use Bluesky? Bluesky AI and so on.",
  alternates: { canonical: "/bluesky-comment-generator" },
};

export default function BlueskyCommentGenerator() {
  return (
    <>
      <Heading
        title="Bluesky Comment Generator"
        subtitle="Olly, your AI-Powered Social Media Assistant to Generated Comments, Posts, Viral Scores for Your Bluesky social media posts. Try Olly's AI Comment Generator for free."
        image="/step_main.gif"
      />
      {/* <LogoCloud /> */}
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
