import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { BenefitsList } from "../_components/mini-tools/benefits-list";
import { ProductivityCalendar } from "../_components/mini-tools/productivity-calendar";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Productivity Calendar | Time Blocking & Work Focus Tool",
  description:
    "Free online tool to efficiently block time, track dates, and organize your work schedule more effectively than Google Calendar.",
  keywords:
    "productivity calendar, time blocking, work calendar, calendar alternative, time management, work scheduler",
  openGraph: {
    title: "Productivity Calendar | Time Blocking & Work Focus Tool",
    description:
      "Efficiently organize your work schedule with simple time blocking and tracking",
    type: "website",
  },
};

const UsageGuide = () => {
  return (
    <div className="mt-12 prose max-w-none">
      <h2 className="text-2xl font-bold mb-4">
        How to Use the Productivity Calendar
      </h2>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-3">Time Blocking</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Go to the Weekly View tab</li>
            <li>Click on any time slot to create a new block</li>
            <li>
              Enter the task name, duration, and optionally set it as recurring
            </li>
            <li>
              Use color-coding to visually categorize different types of work
            </li>
          </ol>
          <p className="mt-2 text-sm text-gray-600">
            Time blocking helps you allocate focused time for specific tasks,
            reducing context switching.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3">
            Managing Projects & Deadlines
          </h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Switch to the Projects tab to see all active projects</li>
            <li>
              Add new projects with deadlines, priorities, and estimated work
              hours
            </li>
            <li>
              Use the smart scheduling feature to automatically block time
            </li>
            <li>View progress and time spent on each project</li>
          </ol>
          <p className="mt-2 text-sm text-gray-600">
            The tool automatically suggests optimal time blocks based on your
            working hours and priorities.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-3">
          Pro Tips for Maximum Productivity
        </h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Set your productive hours in Settings to optimize automatic
            scheduling
          </li>
          <li>
            Use the Focus Mode to block distractions during scheduled work
            blocks
          </li>
          <li>
            Review your productivity stats weekly to identify improvement areas
          </li>
          <li>
            Integrate with your task management system using the available
            plugins
          </li>
        </ul>
      </div>
    </div>
  );
};

const benefits = [
  {
    title: "Simplified Time Blocking",
    description:
      "Create and manage work blocks with minimal clicks, color-code by project or energy level",
  },
  {
    title: "Smart Project Planning",
    description:
      "Set deadlines and let the calendar suggest optimal time blocks based on your working style",
  },
  {
    title: "Productivity Analytics",
    description:
      "Track time spent on different types of work and measure your focus sessions effectiveness",
  },
];

export default function ProductivityCalendarPage() {
  return (
    <ToolPageLayout
      title="Productivity Calendar"
      description="A work-focused calendar alternative for effective time blocking"
    >
      <ProductivityCalendar />
      <BenefitsList benefits={benefits} />
      <UsageGuide />
      <ToolReviewsSection
        productSlug="productivity-calendar"
        title="letterhead-creator"
      />
    </ToolPageLayout>
  );
}
