import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import CreateWorkshopForm from "./_components/create-workshop-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import JoinWorkshopForm from "./_components/join-workshop-form";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Workshop Group Organizer | Create and Manage Workshop Groups",
  description:
    "Easily organize workshop participants into balanced groups with automatic assignment or participant choice. Create access-protected workshops with sharable links.",
  keywords:
    "workshop groups, team formation, group organizer, workshop tool, team assignments, random assignment",
};

export default function WorkshopGroupOrganizerPage() {
  const toolData = toolsData["workshop-group-organizer"];

  return (
    <ToolPageLayout
      title="Workshop Group Organizer"
      description="Create workshops with flexible group assignment options and share with participants"
    >
      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="create">Create Workshop</TabsTrigger>
          <TabsTrigger value="join">Join Workshop</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <CreateWorkshopForm />
        </TabsContent>

        <TabsContent value="join" className="space-y-4">
          <JoinWorkshopForm />
        </TabsContent>
      </Tabs>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-12">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />

      </div>
      <ToolReviewsSection
        productSlug="workshop-group-organizer"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
