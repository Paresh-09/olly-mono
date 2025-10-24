import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import ResetPasswordForm from "../_components/reset-password";

export default async function Page(props: { searchParams: Promise<{ token: string }> }) {
  const searchParams = await props.searchParams;
  const { user } = await validateRequest();
  if (user) {
    return redirect("/dashboard");
  }

  const { token } = searchParams;
  if (!token) {
    return redirect("/forgot-password");
  }

  return <ResetPasswordForm token={token} />;
}