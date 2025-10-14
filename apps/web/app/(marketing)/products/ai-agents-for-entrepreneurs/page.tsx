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
  title: "AI Agents for Entrepreneurs | Olly.social",
  description:
    "Olly's AI Agents for Entrepreneurs provide a versatile suite of tools designed for business owners and self-starters. These intelligent agents automate networking, business development, content creation, and opportunity analysis. Perfect for entrepreneurs juggling multiple responsibilities who need AI assistance to scale their efforts and maximize their business potential.",
  alternates: { canonical: "/products/ai-agents-for-entrepreneurs" },
};

export default function AIAgentsForEntrepreneurs() {
  return (
    <>
      <Heading
        title="AI Agents for Entrepreneurs"
        subtitle="Olly's AI Agents for Entrepreneurs provide a versatile suite of tools designed for business owners and self-starters. These intelligent agents automate networking, business development, content creation, and opportunity analysis."
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