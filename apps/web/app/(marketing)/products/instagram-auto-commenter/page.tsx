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
    "Automate your Instagram engagement with Olly.social's Instagram Auto Commenter. This powerful tool uses AI to generate and post comments that resonate with your audience, enhancing your presence and engagement on Instagram. Perfect for influencers, brands, and social media managers, it streamlines the process of maintaining active, meaningful interactions with followers, ensuring your content achieves maximum visibility and engagement.",
  alternates: { canonical: "/instagram-auto-commenter" },
};

export default function InstagramAutoCommenter() {
  return (
    <>
      <Heading
        title="Instagram Auto Commenter"
        subtitle="Boost your Instagram engagement effortlessly with Olly.social's AI-powered auto commenter. Engage with your audience authentically, without spending hours online."
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
