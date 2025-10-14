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
  title: "AI Agents for Founders | Olly.social",
  description:
    "Olly's AI Agents for Founders provide a comprehensive suite of tools designed specifically for startup founders and business leaders. These intelligent agents automate investor outreach, market research, competitive analysis, and strategic planning. Perfect for busy founders who need to maximize their impact while managing limited resources and time constraints.",
  alternates: { canonical: "/products/ai-agents-for-founders" },
};

export default function AIAgentsForFounders() {
  return (
    <>
      <Heading
        title="AI Agents for Founders"
        subtitle="Olly's AI Agents for Founders provide a comprehensive suite of tools designed specifically for startup founders and business leaders. These intelligent agents automate investor outreach, market research, competitive analysis, and strategic planning."
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