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
  title: "Lorem Ipsum Generator Free | Olly.social",
  description:
    "Olly's Lorem Ipsum Generator creates custom placeholder text for your designs. Perfect for designers, developers, and content creators who need placeholder content. Generate text in multiple languages with custom length options and HTML/CSS ready formats.",
  alternates: { canonical: "/products/lorem-ipsum-generator-free" },
};

export default function LoremIpsumGeneratorFree() {
  return (
    <>
      <Heading
        title="Lorem Ipsum Generator"
        subtitle="Olly's Lorem Ipsum Generator creates custom placeholder text for your designs. Perfect for designers, developers, and content creators who need placeholder content."
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
      <CTA customLink="https://olly.social/tools/lorem-ipsum-generator-free" customText="Try Lorem Ipsum Generator" />
    </>
  );
} 