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
  title: "Influencer Search | Olly.social",
  description:
    "Olly's Influencer Search helps you find and analyze social media influencers in your niche. Perfect for brands, marketers, and PR professionals looking to connect with relevant content creators. Discover influencers with engagement rate calculations, audience demographics, and contact information.",
  alternates: { canonical: "/products/influencer-search" },
};

export default function InfluencerSearch() {
  return (
    <>
      <Heading
        title="Influencer Search"
        subtitle="Olly's Influencer Search helps you find and analyze social media influencers in your niche. Perfect for brands, marketers, and PR professionals looking to connect with relevant content creators."
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
      <CTA customLink="https://olly.social/tools/influencer-search" customText="Try Influencer Search" />
    </>
  );
} 