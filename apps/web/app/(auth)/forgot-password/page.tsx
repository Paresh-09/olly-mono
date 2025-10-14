import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import ForgotPasswordForm from "../_components/forgot-password";

export default async function Page() {
  const { user } = await validateRequest();
  if (user) {
    return redirect("/dashboard");
  }
  return <ForgotPasswordForm />;
}