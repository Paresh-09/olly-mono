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
  title: "YouTube Channel Audit | Olly.social",
  description:
    "Olly's YouTube Channel Audit provides comprehensive analysis of your channel's performance, engagement, and growth opportunities. Perfect for YouTubers, content creators, and video marketers looking to optimize their strategy. Get detailed analytics, content performance metrics, and growth recommendations.",
  alternates: { canonical: "/products/youtube-audit" },
};

export default function YouTubeAudit() {
  return (
    <>
      <Heading
        title="YouTube Channel Audit"
        subtitle="Olly's YouTube Channel Audit provides comprehensive analysis of your channel's performance, engagement, and growth opportunities. Perfect for YouTubers, content creators, and video marketers looking to optimize their strategy."
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
      <CTA customLink="https://olly.social/tools/youtube-audit" customText="Try YouTube Channel Audit" />
    </>
  );
} 