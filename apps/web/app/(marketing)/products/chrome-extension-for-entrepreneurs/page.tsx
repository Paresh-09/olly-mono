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
  title: "Chrome Extension for Entrepreneurs | Olly.social",
  description:
    "Olly's Chrome Extension for Entrepreneurs is your all-in-one browser tool for business growth. This powerful extension provides instant access to AI-powered market research, competitor analysis, networking tools, and content creation capabilities. Perfect for busy entrepreneurs who need to maximize their online presence and business development activities while managing multiple priorities.",
  alternates: { canonical: "/products/chrome-extension-for-entrepreneurs" },
};

export default function ChromeExtensionForEntrepreneurs() {
  return (
    <>
      <Heading
        title="Chrome Extension for Entrepreneurs"
        subtitle="Olly's Chrome Extension for Entrepreneurs is your all-in-one browser tool for business growth. This powerful extension provides instant access to AI-powered market research, competitor analysis, networking tools, and content creation capabilities."
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