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
  title: "Discord Text Formatter | Olly.social",
  description:
    "Olly's Discord Text Formatter helps you format your Discord messages with bold, italic, underline, and custom styling. Perfect for Discord server owners, moderators, and active users who want to create visually appealing messages. Format text with multiple styles and preview before sending.",
  alternates: { canonical: "/products/discord-text-formatter" },
};

export default function DiscordTextFormatter() {
  return (
    <>
      <Heading
        title="Discord Text Formatter"
        subtitle="Olly's Discord Text Formatter helps you format your Discord messages with bold, italic, underline, and custom styling. Perfect for Discord server owners, moderators, and active users who want to create visually appealing messages."
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
      <CTA customLink="https://olly.social/tools/discord-text-formatter" customText="Try Discord Text Formatter" />
    </>
  );
} 