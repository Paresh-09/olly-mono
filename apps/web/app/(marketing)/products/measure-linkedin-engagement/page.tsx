import { Suspense } from "react";
import { ReviewSkeleton } from "../../_components/reviews/review-skeleton";

import { ReviewsSection } from "../../_components/reviews/reviews-section";

import { Metadata } from "next";

import { Heading } from "../../_components/heading";
import { Testimonials } from "../../_components/testimonials";
import { FeaturesAutomation, FeaturesUnsubscribe } from "../../_components/features";
import { Pricing } from "../../_components/pricing-2";
import FAQs from "../../_components/faq-section";
import { CTA } from "../../_components/cta";

export const metadata: Metadata = {
  title: "How to Measure LinkedIn Engagement | Olly.social",
  description:
    "Olly Social Media Sidekick is a Chrome extension that helps you measure LinkedIn engagement. It provides insights into your LinkedIn posts, including views, likes, comments, and shares. With Olly, you can track your LinkedIn engagement and optimize your content strategy to drive better results. Get started with Olly today and take your LinkedIn game to the next level. Just select the LinkedIn post you want to measure and let Olly do the rest.",
  alternates: { canonical: "/measure-linkedin-engagement" },
};

export default function AIChromeExtension() {
  return (
    <>
      <Heading
        title="How to Measure LinkedIn Engagement?"
        subtitle="Olly Social Media Sidekick is a Chrome extension that helps you measure LinkedIn engagement. It provides insights into your LinkedIn posts, including views, likes, comments, and shares. With Olly, you can track your LinkedIn engagement and optimize your content strategy to drive better results. Get started with Olly today and take your LinkedIn game to the next level. Just select the LinkedIn post you want to measure and let Olly do the rest."
        image="/step_main.gif"
      />
      <Testimonials />
      <FeaturesUnsubscribe />
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
