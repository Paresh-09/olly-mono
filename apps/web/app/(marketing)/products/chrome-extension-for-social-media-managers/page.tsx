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
  title: "Chrome Extension for Social Media Managers | Olly.social",
  description:
    "Olly's Chrome Extension for Social Media Managers streamlines your workflow directly in your browser. This powerful tool provides instant access to AI-powered comment generation, content analysis, and engagement metrics across all major social platforms. Perfect for social media professionals managing multiple accounts and campaigns who need efficient, browser-integrated tools.",
  alternates: { canonical: "/products/chrome-extension-for-social-media-managers" },
};

export default function ChromeExtensionForSocialMediaManagers() {
  return (
    <>
      <Heading
        title="Chrome Extension for Social Media Managers"
        subtitle="Olly's Chrome Extension for Social Media Managers streamlines your workflow directly in your browser. This powerful tool provides instant access to AI-powered comment generation, content analysis, and engagement metrics across all major social platforms."
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