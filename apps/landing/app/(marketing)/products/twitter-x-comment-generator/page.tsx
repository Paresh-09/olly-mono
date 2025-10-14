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
  title: "Twitter/X Comment Generator | Olly.social",
  description:
    "Maximize your social media engagement with Olly.social's Twitter/X Comment Generator. Designed for influencers, brands, and social media enthusiasts, this tool is perfect for generating impactful comments on Twitter and X (formerly known as Twitter). Offering personalized, strategic comment suggestions, Olly.social enhances your social media interaction and grows your online presence. Benefit from time-efficient commenting, insights into viral content strategies, and increased follower engagement across major platforms, including Twitter, X, LinkedIn, and Facebook.",
  alternates: { canonical: "/twitter-x-comment-generator" },
};

export default function TwitterXCommentGenerator() {
  return (
    <>
      <Heading
        title="Twitter/X Comment Generator"
        subtitle="Elevate your Twitter and X presence with Olly.social's cutting-edge comment generator. Tailored for dynamic social media engagement, it's the go-to tool for creating comments that resonate."
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
