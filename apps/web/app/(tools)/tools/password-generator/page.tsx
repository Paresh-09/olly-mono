import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { PasswordGenerator } from "../_components/mini-tools/password-generator";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Secure Password Generator | Create Strong Passwords",
  description:
    "Generate secure, random passwords with custom length and characters. Create strong passwords for better online security.",
  keywords:
    "password generator, strong password creator, secure password generator, random password tool",
};

export default function PasswordGeneratorPage() {
  const toolData = toolsData["password-generator"];

  return (
    <ToolPageLayout
      title="Password Generator"
      description="Create secure, customizable passwords instantly"
    >
      <PasswordGenerator />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="password-generator"
        title="letterhead-creator"
      />
    </ToolPageLayout>
  );
}
