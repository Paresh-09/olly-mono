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
  title: "TikTok Profile Audit | Olly.social",
  description:
    "Olly's TikTok Profile Audit analyzes your TikTok profile's performance and provides viral growth strategies. Perfect for TikTok creators, influencers, and brands looking to maximize their impact on the platform. Get viral potential analysis, content performance metrics, and trend alignment scores.",
  alternates: { canonical: "/products/tiktok-audit" },
};

export default function TikTokAudit() {
  return (
    <>
      <Heading
        title="TikTok Profile Audit"
        subtitle="Olly's TikTok Profile Audit analyzes your TikTok profile's performance and provides viral growth strategies. Perfect for TikTok creators, influencers, and brands looking to maximize their impact on the platform."
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
      <CTA customLink="https://olly.social/tools/tiktok-audit" customText="Try TikTok Profile Audit" />
    </>
  );
} 