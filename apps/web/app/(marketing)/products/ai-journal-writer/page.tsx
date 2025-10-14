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
  title: "AI Journal Writer | Olly.social",
  description:
    "Olly's AI Journal Writer helps you create meaningful journal entries with AI assistance. Perfect for personal growth, self-reflection, and maintaining a consistent journaling practice. Generate thoughtful prompts, expand on ideas, and develop a deeper understanding of your thoughts and experiences.",
  alternates: { canonical: "/products/ai-journal-writer" },
};

export default function AIJournalWriter() {
  return (
    <>
      <Heading
        title="AI Journal Writer"
        subtitle="Olly's AI Journal Writer helps you create meaningful journal entries with AI assistance. Perfect for personal growth, self-reflection, and maintaining a consistent journaling practice."
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
      <CTA customLink="https://olly.social/dashboard/daily-vlog" customText="Try AI Journal Writer" />
    </>
  );
} 