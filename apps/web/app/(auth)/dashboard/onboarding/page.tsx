import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import OnboardingPageClient from "../../_components/onboarding-page-client";

export default async function OnboardingPage() {
  const { user } = await validateRequest();
  
  if (!user) {
    return redirect('/login');
  }

  if (user.onboardingComplete) {
    return redirect('/dashboard');
  }

  return <OnboardingPageClient />;
}