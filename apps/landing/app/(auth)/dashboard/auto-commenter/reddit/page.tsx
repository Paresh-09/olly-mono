import { validateRequest } from "@/lib/auth";
import RedditLogin from "./_components/reddit-connect";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await validateRequest();

  if (session.user?.isBetaTester === false) {
    return redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Welcome</h1>
        <p className="text-gray-600">Connect your Reddit account to continue</p>
        <RedditLogin />
      </div>
    </div>
  );
}
