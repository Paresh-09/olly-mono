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
  title: "Chrome Extension for Marketers | Olly.social",
  description:
    "Olly's Chrome Extension for Marketers enhances your marketing workflow directly in your browser. This powerful tool provides instant access to AI-powered content analysis, audience insights, and campaign performance metrics. Perfect for marketing professionals who need quick access to data and creative tools while browsing competitor sites, social platforms, or managing campaigns.",
  alternates: { canonical: "/products/chrome-extension-for-marketeers" },
};

export default function ChromeExtensionForMarketeers() {
  return (
    <>
      <Heading
        title="Chrome Extension for Marketers"
        subtitle="Olly's Chrome Extension for Marketers enhances your marketing workflow directly in your browser. This powerful tool provides instant access to AI-powered content analysis, audience insights, and campaign performance metrics."
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