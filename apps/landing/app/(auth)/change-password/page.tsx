import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChangePasswordForm from "../_components/change-password";

export default async function Page() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect("/login");
  }
  return <ChangePasswordForm />;
} 