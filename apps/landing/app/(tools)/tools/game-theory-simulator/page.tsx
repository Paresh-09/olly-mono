import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import GameTheorySimulator from "../_components/game-theory/simulator";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Game Theory Simulator | Test Strategies in Interactive Scenarios",
  description:
    "Create, test, and analyze game theory scenarios with different strategies. Visualize outcomes in Prisoner's Dilemma, Chicken Game, Stag Hunt, and custom scenarios.",
  keywords:
    "game theory, prisoner's dilemma, tit for tat, strategy simulation, cooperation vs defection, nash equilibrium, chicken game, stag hunt, behavioral economics",
};

export default function GameTheorySimulatorPage() {
  const toolData = toolsData["game-theory-simulator"];

  return (
    <ToolPageLayout
      title="Game Theory Simulator"
      description="Create and analyze strategic interactions between agents with different behaviors"
    >
      <GameTheorySimulator />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="game-theory-simulator"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
