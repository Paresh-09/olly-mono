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
  title: "AI Agent for Social Media | Olly.social",
  description:
    "Olly's AI Agent for Social Media is your comprehensive solution for managing social media presence. This intelligent agent automates content creation, comment generation, engagement analysis, and trend monitoring across all major platforms. Perfect for social media managers, influencers, and businesses looking to streamline their social media operations while maximizing impact and audience growth.",
  alternates: { canonical: "/products/ai-agent-for-social-media" },
};

export default function AIAgentForSocialMedia() {
  return (
    <>
      <Heading
        title="AI Agent for Social Media"
        subtitle="Olly's AI Agent for Social Media is your comprehensive solution for managing social media presence. This intelligent agent automates content creation, comment generation, engagement analysis, and trend monitoring across all major platforms."
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