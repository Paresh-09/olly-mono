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
  title: "YouTube Comment Generator | Olly.social",
  description:
    "Boost your YouTube channel's engagement with Olly.social's AI-driven YouTube Comment Generator. Ideal for YouTubers, digital marketers, and content creators, this tool automates insightful and engaging comment creation. Enhance your videos' interaction, foster a vibrant community, and save time with personalized, AI-generated comments that resonate with your audience. With Olly.social, elevate your YouTube strategy by driving more likes, comments, and subscriptions.",
  alternates: { canonical: "/youtube-comment-generator" },
};

export default function YouTubeCommentGenerator() {
  return (
    <>
      <Heading
        title="YouTube Comment Generator"
        subtitle="Revolutionize your YouTube engagement with Olly.social's AI comment generator, designed to create meaningful interactions and boost your video performance."
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
