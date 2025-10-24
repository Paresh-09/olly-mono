// In /app/set-password/page.tsx

import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import SetPasswordForm from "../_components/set-password";

export default async function Page() {
  const { user } = await validateRequest();
  if (user) {
    return redirect("/dashboard");
  }
  return <SetPasswordForm />;
}