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
  title: "AI Agents for Productivity | Olly.social",
  description:
    "Olly's AI Agents for Productivity provide a comprehensive suite of tools designed to enhance personal and team efficiency. These intelligent agents automate task management, scheduling, email handling, and workflow optimization. Perfect for professionals, teams, and organizations looking to save time and increase output through AI-powered productivity solutions.",
  alternates: { canonical: "/products/ai-agents-for-productivity" },
};

export default function AIAgentsForProductivity() {
  return (
    <>
      <Heading
        title="AI Agents for Productivity"
        subtitle="Olly's AI Agents for Productivity provide a comprehensive suite of tools designed to enhance personal and team efficiency. These intelligent agents automate task management, scheduling, email handling, and workflow optimization."
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