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
  title: "AI Agents for Sales | Olly.social",
  description:
    "Olly's AI Agents for Sales provide a comprehensive suite of tools designed to enhance sales performance. These intelligent agents automate lead qualification, outreach, follow-ups, and sales analytics. Perfect for sales teams, account executives, and businesses looking to increase conversion rates and streamline their sales processes through AI-powered automation and insights.",
  alternates: { canonical: "/products/ai-agents-for-sales" },
};

export default function AIAgentsForSales() {
  return (
    <>
      <Heading
        title="AI Agents for Sales"
        subtitle="Olly's AI Agents for Sales provide a comprehensive suite of tools designed to enhance sales performance. These intelligent agents automate lead qualification, outreach, follow-ups, and sales analytics."
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