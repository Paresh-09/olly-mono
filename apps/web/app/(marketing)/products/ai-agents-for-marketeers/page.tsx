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
  title: "AI Agents for Marketers | Olly.social",
  description:
    "Olly's AI Agents for Marketers provide a suite of intelligent tools designed specifically for marketing professionals. These agents automate campaign creation, content generation, audience analysis, and performance tracking. Perfect for marketing teams, agencies, and brand managers looking to enhance their marketing strategies with AI-powered insights and automation.",
  alternates: { canonical: "/products/ai-agents-for-marketeers" },
};

export default function AIAgentsForMarketeers() {
  return (
    <>
      <Heading
        title="AI Agents for Marketers"
        subtitle="Olly's AI Agents for Marketers provide a suite of intelligent tools designed specifically for marketing professionals. These agents automate campaign creation, content generation, audience analysis, and performance tracking."
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