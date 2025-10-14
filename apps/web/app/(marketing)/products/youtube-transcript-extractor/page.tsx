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
  title: "YouTube Transcript Extractor | Olly.social",
  description:
    "Olly's YouTube Transcript Extractor helps you extract and search through YouTube video transcripts with ease. Perfect for researchers, content creators, students, and journalists who need to analyze video content. Extract transcripts in multiple formats, search through content, and navigate videos using timestamps.",
  alternates: { canonical: "/products/youtube-transcript-extractor" },
};

export default function YouTubeTranscriptExtractor() {
  return (
    <>
      <Heading
        title="YouTube Transcript Extractor"
        subtitle="Olly's YouTube Transcript Extractor helps you extract and search through YouTube video transcripts with ease. Perfect for researchers, content creators, students, and journalists who need to analyze video content."
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
      <CTA customLink="https://olly.social/tools/youtube-transcript-extractor" customText="Try YouTube Transcript Extractor" />
    </>
  );
} 