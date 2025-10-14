import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "./(marketing)/_components/google-analytics";
import FacebookPixelScript from "./(marketing)/_components/fb-pixel-script";
import SmartlookScript from "./(marketing)/_components/smartlook-script";
import localFont from "next/font/local";
// const inter = Inter({ subsets: ['latin'] })
import { Suspense } from "react";
import { Toaster } from "@repo/ui/components/ui/toaster";
import TanStackProvider from "./web/providers/TanstackProvider";
import AppProvider from "./web/providers/AppProvider";
import { PostHogProvider } from "./web/providers/PostHogProvider";

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
  metadataBase: new URL("https://www.olly.social"),
  title: "AI Agent for Social Media - Olly Social",
  description:
    "Olly is an AI agent for social media that redefines social media engagement by not only creating compelling comments but also assessing virality scores and generating similar posts. This Chrome Extension serves as your personal AI assistant, optimizing your presence on platforms like LinkedIn, Twitter, Reddit, and Facebook. With Olly, you get personalized interactions, time-saving commenting, and insights into what makes content viral. It's designed to grow your following by strategically enhancing engagement and providing content ideas that resonate with your audience.",
  keywords:
    "Olly, AI Agent for Social Media, AI Social Media Assistant, Virality Score, Content Generation, Chrome Extension, Social Media Engagement, AI, Artificial Intelligence, Smart Commenting, LinkedIn, Twitter, Reddit, Facebook, Viral Content, Online Presence, Audience Growth, Personalized Interactions, Browser Extension, Engagement Analytics, Post Generation, Trend Analysis",
  appLinks: {
    web: {
      url: "https://www.olly.social",
      should_fallback: false,
    },
  },
  generator: "Olly",
  referrer: "no-referrer-when-downgrade",
  authors: [
    {
      name: "Yash Thakker",
      url: "https://yashthakker.com",
    },
  ],
  creator: "Yash Thakker",
  publisher: "Yash Thakker",
  alternates: {
    canonical: "https://www.olly.social",
  },
  openGraph: {
    title:
      "Olly: AI-Driven Social Media Assistant & Virality Enhancer Chrome Extension",
    description:
      "Olly redefines social media engagement by not only creating compelling comments but also assessing virality scores and generating similar posts. This Chrome Extension serves as your personal AI assistant, optimizing your presence on platforms like LinkedIn, Twitter, Reddit, and Facebook. With Olly, you get personalized interactions, time-saving commenting, and insights into what makes content viral. It's designed to grow your following by strategically enhancing engagement and providing content ideas that resonate with your audience.",
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
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon-2.png",
  },
  category: "Artificial Intelligence",
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
              <Suspense fallback={null}>
                <FacebookPixelScript />
                {/* <GoogleAnalytics ga_id="G-1551CR6XGX" /> */}
                {/* <SmartlookScript /> */}
              </Suspense>
              {children}
              <Toaster />
            </PostHogProvider>
          </AppProvider>
        </TanStackProvider>
      </body>
    </html>
  );
}
