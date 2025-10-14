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
  title: "YouTube Chapters Generator | Olly.social",
  description:
    "Olly's YouTube Chapters Generator creates professional chapter markers and timestamps for your videos. Perfect for YouTubers, video creators, and content marketers looking to enhance viewer experience. Generate chapters with automatic timestamp detection, custom naming, and format validation.",
  alternates: { canonical: "/products/youtube-chapters-generator" },
};

export default function YouTubeChaptersGenerator() {
  return (
    <>
      <Heading
        title="YouTube Chapters Generator"
        subtitle="Olly's YouTube Chapters Generator creates professional chapter markers and timestamps for your videos. Perfect for YouTubers, video creators, and content marketers looking to enhance viewer experience."
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
      <CTA customLink="https://olly.social/tools/youtube-chapters-generator" customText="Try YouTube Chapters Generator" />
    </>
  );
} 