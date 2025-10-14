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
  title: "Social Media Chrome Extension | Olly.social",
  description:
    "Revolutionize your social media management with Olly.social's Social Media Chrome Extension. Designed to optimize your social media browsing and interaction, this extension provides quick access to key features like post scheduling, analytics, and automated commenting across multiple platforms. It's the perfect tool for digital marketers, social media managers, and content creators looking to streamline their workflow and enhance their online presence.",
  alternates: { canonical: "/social-media-chrome-extension" },
};

export default function SocialMediaChromeExtension() {
  return (
    <>
      <Heading
        title="Social Media Chrome Extension"
        subtitle="Elevate your social media experience with Olly.social's Chrome Extension, offering seamless management and enhanced engagement across your favorite platforms."
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
