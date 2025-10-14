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
  title: "Quora Comment Generator | Olly.social",
  description:
    "Elevate your Quora engagement with Olly.social's AI Comment Generator, designed for thought leaders, experts, and curious minds active on Quora. Generate insightful, relevant comments that spark discussions, enhance your answers, and connect with your audience on a deeper level. Ideal for increasing visibility and fostering meaningful interactions, this tool helps you stand out in the vast community of Quora.",
  alternates: { canonical: "/quora-comment-generator" },
};

export default function QuoraCommentGenerator() {
  return (
    <>
      <Heading
        title="Quora Comment Generator"
        subtitle="Maximize your impact on Quora with Olly.social's AI-driven comments, crafted to engage and inspire your audience."
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