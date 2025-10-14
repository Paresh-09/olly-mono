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
  title: "Instagram Profile Audit | Olly.social",
  description:
    "Olly's Instagram Profile Audit analyzes your Instagram profile's performance and provides actionable insights for growth. Perfect for influencers, brands, and social media managers looking to optimize their Instagram strategy. Get engagement analysis, hashtag effectiveness, and content strategy insights.",
  alternates: { canonical: "/products/instagram-audit" },
};

export default function InstagramAudit() {
  return (
    <>
      <Heading
        title="Instagram Profile Audit"
        subtitle="Olly's Instagram Profile Audit analyzes your Instagram profile's performance and provides actionable insights for growth. Perfect for influencers, brands, and social media managers looking to optimize their Instagram strategy."
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
      <CTA customLink="https://olly.social/tools/instagram-audit" customText="Try Instagram Profile Audit" />
    </>
  );
} 