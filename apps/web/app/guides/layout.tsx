import React from "react";
import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth";
import Navbar from "../(auth)/_components/auth-navbar";
import EmailVerificationPrompt from "../(auth)/dashboard/_components/email-verify";
import LatestReleaseBar from "../(auth)/dashboard/_components/latest-releases";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {  
  const { user } = await validateRequest();
  
  if (!user) {
    redirect("/login");
  }

  if (!user.isEmailVerified) {
    return <EmailVerificationPrompt user={user} />;
  }

  return (
    <div>
      <main className="flex-grow">{children}</main>
    </div>
  );
};