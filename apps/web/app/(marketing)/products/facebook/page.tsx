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
  title: "Facebook Auto Commenter | Olly.social",
  description:
    "Olly's Facebook Auto Commenter helps you automatically generate and post engaging comments on Facebook content. Perfect for businesses, community managers, and social media professionals looking to maintain an active presence on Facebook. Save time while building meaningful engagement through consistent, intelligent commenting that drives visibility and community growth.",
  alternates: { canonical: "/products/facebook" },
};

export default function FacebookAutoCommenter() {
  return (
    <>
      <Heading
        title="Facebook Auto Commenter"
        subtitle="Olly's Facebook Auto Commenter helps you automatically generate and post engaging comments on Facebook content. Perfect for businesses, community managers, and social media professionals looking to maintain an active presence."
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