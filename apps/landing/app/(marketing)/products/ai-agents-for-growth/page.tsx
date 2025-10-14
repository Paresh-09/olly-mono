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
  title: "AI Agents for Growth | Olly.social",
  description:
    "Olly's AI Agents for Growth provide a comprehensive suite of tools designed to accelerate business growth. These intelligent agents automate lead generation, customer acquisition, retention strategies, and growth analytics. Perfect for growth hackers, startups, and businesses looking to scale rapidly through AI-powered growth strategies and automation.",
  alternates: { canonical: "/products/ai-agents-for-growth" },
};

export default function AIAgentsForGrowth() {
  return (
    <>
      <Heading
        title="AI Agents for Growth"
        subtitle="Olly's AI Agents for Growth provide a comprehensive suite of tools designed to accelerate business growth. These intelligent agents automate lead generation, customer acquisition, retention strategies, and growth analytics."
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