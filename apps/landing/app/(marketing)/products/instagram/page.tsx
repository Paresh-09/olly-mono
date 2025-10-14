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
  title: "Instagram Auto Commenter | Olly.social",
  description:
    "Olly's Instagram Auto Commenter helps you automatically generate and post engaging comments on Instagram content. Perfect for influencers, brands, and social media managers looking to maintain an active presence on Instagram. Save time while building meaningful engagement through consistent, intelligent commenting that drives visibility and audience growth.",
  alternates: { canonical: "/products/instagram" },
};

export default function InstagramAutoCommenter() {
  return (
    <>
      <Heading
        title="Instagram Auto Commenter"
        subtitle="Olly's Instagram Auto Commenter helps you automatically generate and post engaging comments on Instagram content. Perfect for influencers, brands, and social media managers looking to maintain an active presence."
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