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
  title: "Instagram Comment Generator | Olly.social",
  description:
    "Boost your Instagram engagement with Olly.social's AI Comment Generator. Craft personalized, engaging comments that resonate with your audience and enhance your Instagram strategy. Perfect for influencers, brands, and anyone looking to increase their social media presence, this tool automates insightful comment creation, saving you time and fostering a vibrant community.",
  alternates: { canonical: "/instagram-comment-generator" },
};

export default function InstagramCommentGenerator() {
  return (
    <>
      <Heading
        title="Instagram Comment Generator"
        subtitle="Amplify your Instagram interactions with Olly.social's AI-driven solution, designed to create comments that captivate and engage."
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