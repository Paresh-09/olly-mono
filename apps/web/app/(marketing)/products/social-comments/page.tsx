import { Suspense } from "react";
import { ReviewSkeleton } from "../../_components/reviews/review-skeleton";

import { ReviewsSection } from "../../_components/reviews/reviews-section";

import { Metadata } from "next";
// import { LogoCloud } from "@/app/(landing)/home/LogoCloud";

import { Heading } from "../../_components/heading";
import { Testimonials } from "../../_components/testimonials";
import { FeaturesAutomation } from "../../_components/features";
import { Pricing } from "../../_components/pricing-2";
import FAQs from "../../_components/faq-section";
import { CTA } from "../../_components/cta";

export const metadata: Metadata = {
  title: "Social Comments Automation | Olly.social",
  description:
    "Elevate your social media strategy with Olly.social's Social Comments Automation tool. Designed to effortlessly generate engaging, relevant comments across your social media channels, Olly enhances interaction and builds community. Ideal for influencers, marketers, and brands, our tool uses AI to provide timely, context-aware comments, ensuring your online presence is vibrant and engaging. Streamline your engagement process, save time, and maintain a consistent voice across platforms with Olly.",
  alternates: { canonical: "/social-comments" },
};

export default function SocialComments() {
  return (
    <>
      <Heading
        title="Social Comments Automation"
        subtitle="Revolutionize your engagement with Olly.social's automated comment generation. Boost your social media presence with AI-powered, contextually relevant comments."
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