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
  title: "Instagram Fake Follower Checker | Olly.social",
  description:
    "Olly's Instagram Fake Follower Checker helps you identify fake followers on your Instagram account. Perfect for influencers, brands, and social media managers who want to ensure authentic engagement. Check follower authenticity with real-time verification, detailed analysis, and customizable filters.",
  alternates: { canonical: "/products/fake-follower-check" },
};

export default function FakeFollowerCheck() {
  return (
    <>
      <Heading
        title="Instagram Fake Follower Checker"
        subtitle="Olly's Instagram Fake Follower Checker helps you identify fake followers on your Instagram account. Perfect for influencers, brands, and social media managers who want to ensure authentic engagement."
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
      <CTA customLink="https://olly.social/tools/fake-follower-check" customText="Try Fake Follower Checker" />
    </>
  );
} 