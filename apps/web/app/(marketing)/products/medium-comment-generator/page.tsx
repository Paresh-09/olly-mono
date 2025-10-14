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
  title: "Medium Comment Generator | Olly.social",
  description:
    "Elevate your Medium writing with Olly.social's AI-powered Comment Generator, designed for authors, bloggers, and thought leaders on Medium. This tool creates thoughtful, engaging comments that foster community discussion and enhance reader engagement. Perfect for anyone looking to amplify their Medium presence, it provides a seamless way to generate meaningful interactions and build a loyal readership.",
  alternates: { canonical: "/medium-comment-generator" },
};

export default function MediumCommentGenerator() {
  return (
    <>
      <Heading
        title="Medium Comment Generator"
        subtitle="Transform your Medium engagement with Olly.social's AI, crafting comments that inspire discussion and deepen reader connections."
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