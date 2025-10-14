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
  title: "Hacker News/Y Combinator Comment Generator | Olly.social",
  description:
    "Unlock the power of AI for your startup discussions with Olly.social's Hacker News/Y Combinator Comment Generator. Designed for innovators, tech enthusiasts, and entrepreneurs, this tool generates engaging, insightful comments to elevate your presence on Hacker News and Y Combinator. Facilitate meaningful conversations, automate feedback collection, and engage with the tech community effectively. Olly.social helps you save time while contributing valuable insights, fostering a vibrant discussion culture in tech-centric forums.",
  alternates: { canonical: "/hacker-news-ycombinator-comment-generator" },
};

export default function HackerNewsYCombinatorCommentGenerator() {
  return (
    <>
      <Heading
        title="Hacker News/Y Combinator Comment Generator"
        subtitle="Elevate your tech discussions with Olly.social's AI comment generator, tailored for the vibrant Hacker News and Y Combinator communities. Engage, automate, and innovate."
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
