import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { BenefitsList } from "../_components/mini-tools/benefits-list";
import { PregnancyTracker } from "../_components/mini-tools/pregnancy-tracker";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Pregnancy Tracker | Week by Week Pregnancy Calculator",
  description:
    "Free online tool to track your pregnancy progress week by week, calculate important dates, and see baby size comparisons.",
  keywords:
    "pregnancy tracker, due date calculator, pregnancy week by week, pregnancy timeline, baby size calculator",
  openGraph: {
    title: "Pregnancy Tracker | Week by Week Pregnancy Calculator",
    description:
      "Track your pregnancy journey with our free online pregnancy calculator and week-by-week guide.",
    type: "website",
  },
};

const UsageGuide = () => {
  return (
    <div className="mt-12 prose max-w-none">
      <h2 className="text-2xl font-bold mb-4">
        How to Use the Pregnancy Tracker
      </h2>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-3">Getting Started</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Go to the Settings tab</li>
            <li>Enter your Last Menstrual Period (LMP) date</li>
            <li>Click "Save Date" to store your information</li>
            <li>Return to the Overview tab to see your progress</li>
          </ol>
          <p className="mt-2 text-sm text-gray-600">
            Your LMP date is the first day of your most recent period, which is
            used to calculate your due date.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3">Tracking Your Progress</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Check the Overview tab for current week and baby size</li>
            <li>View the Timeline tab to see upcoming milestones</li>
            <li>Visit the Important Dates tab for key appointments</li>
            <li>Return regularly to see your progress update</li>
          </ol>
          <p className="mt-2 text-sm text-gray-600">
            The tracker automatically updates based on the current date.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-3">Tips for Best Results</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Enter your LMP date as accurately as possible</li>
          <li>Sign in to save your data between sessions</li>
          <li>
            Consult with your healthcare provider for personalized medical
            advice
          </li>
          <li>
            Use the timeline as a general guide – every pregnancy is unique
          </li>
        </ul>
      </div>
    </div>
  );
};

const benefits = [
  {
    title: "Accurate Due Date",
    description:
      "Calculate your estimated due date based on your last menstrual period",
  },
  {
    title: "Week-by-Week Tracking",
    description:
      "Follow your pregnancy progress with detailed weekly information",
  },
  {
    title: "Baby Size Comparisons",
    description:
      "Visualize your baby's growth with fruit and vegetable comparisons",
  },
];

export default function PregnancyTrackerPage() {
  return (
    <ToolPageLayout
      title="Pregnancy Tracker"
      description="Track your pregnancy journey week by week"
    >
      <PregnancyTracker />
      <BenefitsList benefits={benefits} />
      <UsageGuide />
      <ToolReviewsSection
        productSlug="pregnancy-tracker"
        title="letterhead-creator"
      />
    </ToolPageLayout>
  );
}
