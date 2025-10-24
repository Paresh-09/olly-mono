import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import AnalyticsDashboard from "../_component/analytics-dashboard";

export default async function AnalyticsPage() {
  const { user } = await validateRequest();
  
  if (!user?.isSupport) {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Onboarding Analytics Dashboard</h1>
      <AnalyticsDashboard />
    </div>
  );
}