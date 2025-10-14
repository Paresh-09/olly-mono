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
  title: "AI Agent for SEO | Olly.social",
  description:
    "Olly's AI Agent for SEO is your comprehensive solution for search engine optimization. This intelligent agent automates keyword research, content optimization, backlink analysis, and performance tracking. Perfect for SEO specialists, content creators, and businesses looking to improve their search rankings and organic traffic through AI-powered optimization strategies.",
  alternates: { canonical: "/products/ai-agent-for-seo" },
};

export default function AIAgentForSEO() {
  return (
    <>
      <Heading
        title="AI Agent for SEO"
        subtitle="Olly's AI Agent for SEO is your comprehensive solution for search engine optimization. This intelligent agent automates keyword research, content optimization, backlink analysis, and performance tracking."
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