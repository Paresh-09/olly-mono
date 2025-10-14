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
  title: "X (formerly Twitter) Comment Generator | Olly.social",
  description:
    "Maximize your engagement on X (formerly Twitter) with Olly.social's AI-powered Comment Generator. Designed for brands, influencers, and individuals keen on amplifying their digital presence, this tool crafts personalized, impactful comments to enhance your social media strategy. Perfect for engaging with your audience, boosting your posts' visibility, and fostering a dynamic online community, Olly.social offers a streamlined solution for creating comments that resonate.",
  alternates: { canonical: "/x-comment-generator" },
};

export default function XCommentGenerator() {
  return (
    <>
      <Heading
        title="X Comment Generator"
        subtitle="Elevate your presence on X with Olly.social's AI-driven comments, tailored to engage and captivate your audience effectively."
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