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
  title: "Product Hunt Comment Generator | Olly.social",
  description:
    "Elevate your Product Hunt presence with Olly.social's AI-powered comment generator, specifically designed for startups, makers, and tech enthusiasts. This tool provides insightful, engaging comments to boost your products' visibility and interaction on Product Hunt. With Olly.social, streamline your community engagement, save time on crafting responses, and gain actionable insights to drive discussions that resonate with your target audience. Ideal for enhancing product launches and fostering meaningful connections within the Product Hunt community.",
  alternates: { canonical: "/product-hunt-comment-generator" },
};

export default function ProductHuntCommentGenerator() {
  return (
    <>
      <Heading
        title="Product Hunt Comment Generator"
        subtitle="Unlock the full potential of your Product Hunt submissions with Olly.social's comment generator. Designed to enhance engagement and foster community interaction, it's the ultimate tool for startups and tech innovators."
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
