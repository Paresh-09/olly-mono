import { Suspense } from "react";
import { ReviewSkeleton } from "../../_components/reviews/review-skeleton";

import { Metadata } from "next";
// import { LogoCloud } from "@/app/(landing)/home/LogoCloud";

import { Heading } from "../../_components/heading";
import { Testimonials } from "../../_components/testimonials";
import { FeaturesAutomation } from "../../_components/features";
import { Pricing } from "../../_components/pricing-2";
import FAQs from "../../_components/faq-section";
import { CTA } from "../../_components/cta";
import { ReviewsSection } from "../../_components/reviews/reviews-section";

export const metadata: Metadata = {
  title: "AI Agent for Social Media | Olly.social",
  description:
    "Discover the power of Olly, your AI Agent tailored for social media. Olly excels in automating comment generation, analyzing virality potential, and delivering strategic insights to elevate your digital presence. Perfect for content creators, digital marketers, and businesses, this AI Agent streamlines your social media efforts with its intelligent tools, fostering dynamic engagement, optimizing content, and bolstering audience growth across various platforms.",
  alternates: { canonical: "/ai-agent" },
};

export default function AIAgent() {
  return (
    <>
      <Heading
        title="AI Agent for Social Media"
        subtitle="Harness Olly's AI capabilities to automate your social media tasks. From insightful comment generation to virality analysis, Olly is your ally in achieving remarkable digital engagement and growth."
        image="/step_main.gif"
      />
      <Testimonials />
      <FeaturesAutomation />
      <Suspense fallback={<ReviewSkeleton />}>
        <ReviewsSection />
      </Suspense>
      <Suspense>
        <Pricing />
      </Suspense>
      <FAQs />
      <CTA />
    </>
  );
}