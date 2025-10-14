import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { PomodoroTimer } from "../_components/mini-tools/pomodoro-timer";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Pomodoro Timer | Boost Productivity with Focus Sessions",
  description:
    "Enhance your productivity with a customizable Pomodoro Timer. Manage work and break intervals to maximize focus and efficiency.",
  keywords:
    "pomodoro timer, productivity timer, focus sessions, time management, work intervals",
};

export default function PomodoroTimerPage() {
  const toolData = toolsData["pomodoro-timer"];

  return (
    <ToolPageLayout
      title="Pomodoro Timer"
      description="Boost your productivity with structured work and break intervals"
    >
      <PomodoroTimer />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="pomodoro-timer"
        title="letterhead-creator"
      />
    </ToolPageLayout>
  );
}
