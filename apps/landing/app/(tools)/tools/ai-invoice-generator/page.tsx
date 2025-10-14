import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { AIInvoiceGenerator } from "../_components/mini-tools/ai-invoice-generator";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "AI Invoice Generator | Professional Business Invoices",
  description:
    "Generate professional business invoices with AI assistance. Create customized invoices with your company branding and automatic calculations.",
  keywords:
    "invoice generator, business invoice, AI invoice, professional invoice, invoice template, custom invoice, business billing, automated invoice",
};

export default function AIInvoiceGeneratorPage() {
  const toolData = toolsData["ai-invoice-generator"];

  return (
    <ToolPageLayout
      title="AI Invoice Generator"
      description="Create professional business invoices with AI assistance and automatic calculations"
    >
      <AIInvoiceGenerator />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="ai-invoice-generator"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
