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
  title: "Pomodoro Timer | Olly.social",
  description:
    "Olly's Pomodoro Timer helps you boost productivity with structured work and break intervals. Perfect for students, professionals, and anyone looking to improve focus and time management. Set customizable work and break durations, track sessions, and enhance your productivity.",
  alternates: { canonical: "/products/pomodoro-timer" },
};

export default function PomodoroTimer() {
  return (
    <>
      <Heading
        title="Pomodoro Timer"
        subtitle="Olly's Pomodoro Timer helps you boost productivity with structured work and break intervals. Perfect for students, professionals, and anyone looking to improve focus and time management."
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
      <CTA customLink="https://olly.social/tools/pomodoro-timer" customText="Try Pomodoro Timer" />
    </>
  );
}
