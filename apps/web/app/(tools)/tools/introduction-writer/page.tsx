import { Metadata } from "next";
import { IntroductionWriter } from "../_components/mini-tools/introduction-writer";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { BenefitsList } from "../_components/mini-tools/benefits-list";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Blog Introduction Generator | Free Tool for Engaging Article Intros",
  description:
    "Create engaging, SEO-optimized blog introductions that hook your readers. Our free tool generates compelling article intros that improve engagement and rankings.",
  openGraph: {
    title:
      "Blog Introduction Generator | Free Tool for Engaging Article Intros",
    description:
      "Create engaging, SEO-optimized blog introductions that hook your readers.",
    type: "website",
  },
  keywords:
    "blog introduction, article intro generator, SEO intro, hook writing, blogging tool, introduction writer, free intro generator, content creation",
};

export default function IntroductionWriterPage() {
  const toolData = toolsData["introduction-writer"];

  return (
    <ToolPageLayout
      title="Blog Introduction Generator"
      description="Create engaging blog introductions that hook your readers and nail your SEO"
    >
      <IntroductionWriter />
      <ToolFeatures tool={toolData} />
      <ToolHowToUse tool={toolData} />
      <ToolFAQ tool={toolData} />
      <ToolReviewsSection
        productSlug="introduction-writer"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
