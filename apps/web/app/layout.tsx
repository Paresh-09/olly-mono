import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";
import { Suspense } from "react";
import { Toaster } from "@repo/ui/components/ui/toaster";
import TanStackProvider from "../providers/TanstackProvider";
import AppProvider from "../providers/AppProvider";
import { PostHogProvider } from "../providers/PostHogProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  preload: true,
  display: "swap",
});
const calFont = localFont({
  src: "../styles/CalSans-SemiBold.woff2",
  variable: "--font-cal",
  preload: true,
  display: "swap",
});

export const metadata: Metadata = {
  title: "Olly Dashboard",
  description: "Your Olly dashboard for managing AI social media automation",
  icons: {
    icon: "/icon-2.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full notranslate" translate="no" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body
        className={`min-h-full ${inter.variable} ${calFont.variable} font-sans antialiased bg-background text-foreground`}
      >
        <TanStackProvider>
          <AppProvider>
            <PostHogProvider>
              {children}
              <Toaster />
            </PostHogProvider>
          </AppProvider>
        </TanStackProvider>
      </body>
    </html>
  );
}
