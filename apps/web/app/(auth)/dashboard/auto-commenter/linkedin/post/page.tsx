import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LinkedInPost from "../../_components/create-linkedin-post";
import { validateRequest } from "@/lib/auth";

export default async function DashboardPage() {
  const token = (await cookies()).get("linkedin_token");
  const session = await validateRequest();

  if (!token) {
    redirect("/login");
  }

  if (session.user?.isBetaTester === false) {
    return redirect("/dashboard");
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">LinkedIn Dashboard</h1>
      <LinkedInPost />
    </div>
  );
}

