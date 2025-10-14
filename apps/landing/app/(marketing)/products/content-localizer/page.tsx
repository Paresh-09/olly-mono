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
  title: "Content Localizer | Olly.social",
  description:
    "Olly's Content Localizer adapts your content for different regions and cultures with smart localization suggestions. Perfect for global marketers, international businesses, and content creators targeting diverse audiences. Analyze cultural sensitivity and get region-specific recommendations for your content.",
  alternates: { canonical: "/products/content-localizer" },
};

export default function ContentLocalizer() {
  return (
    <>
      <Heading
        title="Content Localizer"
        subtitle="Olly's Content Localizer adapts your content for different regions and cultures with smart localization suggestions. Perfect for global marketers, international businesses, and content creators targeting diverse audiences."
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
      <CTA customLink="https://olly.social/tools/content-localizer" customText="Try Content Localizer" />
    </>
  );
} 