import React from "react";
import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth";
import Navbar from "../_components/auth-navbar";
import LatestReleaseBar from "./_components/latest-releases";
import EmailVerificationPrompt from "./_components/email-verify";
import ChromeStoreStatusBar from "./_components/chrome-issue";
import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL("https://www.olly.social"),
  title:
    "Dashboard - Olly: AI-Powered Social Media Assistant",
  description:
    "Olly redefines social media engagement by not only creating compelling comments but also assessing virality scores and generating similar posts. This Chrome Extension serves as your personal AI assistant, optimizing your presence on platforms like LinkedIn, Twitter, Reddit, and Facebook.",
  openGraph: {
    title: "Dashboard - Olly: AI-Powered Social Media Assistant",
    description:
      "Olly redefines social media engagement by not only creating compelling comments but also assessing virality scores and generating similar posts.",
    url: "https://www.olly.social",
    siteName: "Olly - Your AI-Powered Second Brain",
    images: [
      {
        url: "https://videosilvids.s3.ap-south-1.amazonaws.com/Screenshot+2024-01-15+at+1.00.33%E2%80%AFPM.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/icon-2.png",
  },
};

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
      <LatestReleaseBar />
      {/* <ChromeStoreStatusBar /> */}
      <main className="flex-grow">{children}</main>
    </div>
  );
};