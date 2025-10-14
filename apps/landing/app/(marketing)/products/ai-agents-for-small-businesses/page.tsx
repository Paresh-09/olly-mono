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
  title: "AI Agents for Small Businesses | Olly.social",
  description:
    "Olly's AI Agents for Small Businesses provide an affordable suite of tools designed specifically for small business operations. These intelligent agents automate customer service, local marketing, inventory management, and business analytics. Perfect for small business owners looking to compete with larger companies by leveraging AI to enhance efficiency and customer experience without expanding staff.",
  alternates: { canonical: "/products/ai-agents-for-small-businesses" },
};

export default function AIAgentsForSmallBusinesses() {
  return (
    <>
      <Heading
        title="AI Agents for Small Businesses"
        subtitle="Olly's AI Agents for Small Businesses provide an affordable suite of tools designed specifically for small business operations. These intelligent agents automate customer service, local marketing, inventory management, and business analytics."
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