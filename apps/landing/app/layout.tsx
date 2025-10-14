import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "./(marketing)/_components/google-analytics";
import FacebookPixelScript from "./(marketing)/_components/fb-pixel-script";
import SmartlookScript from "./(marketing)/_components/smartlook-script";
import localFont from "next/font/local";
import { Suspense } from "react";
import { Toaster } from "@repo/ui/components/ui/toaster";
import { PricingProvider } from "./web/providers/pricingContext";
import { Header } from "./(marketing)/_components/navbar-1";
import dynamic from 'next/dynamic';

// Dynamically import non-critical components to improve initial load
const DynamicPreFooter = dynamic(() => import('./(marketing)/_components/pre-footer').then((mod) => ({ default: mod.PreFooter })), {
  loading: () => <div className="h-32 bg-transparent" />, // Reserve space during loading
});

const DynamicFooter = dynamic(() => import('./(marketing)/_components/footer').then((mod) => ({ default: mod.Footer })), {
  loading: () => <div className="h-24 bg-transparent" />, // Reserve space during loading
});

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
        <PricingProvider>
          <div className="flex flex-col min-h-screen relative">
            {/* Optimized fixed background with better performance - exact same as original */}
            <div
              className="fixed inset-0 -z-10"
              style={{
                contain: 'layout style paint',
                willChange: 'auto' // Only enable when needed
              }}
            >
              {/* Primary gradient overlay - static for better performance */}
              <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/50 to-white dark:from-gray-950 dark:via-gray-900/50 dark:to-gray-950">

                {/* Top gradient orb - optimized animation */}
                <div className="absolute inset-x-0 -top-40 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                  <div
                    className="gradient-orb gradient-orb-1 relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#50c4aa] to-[#9089fc] opacity-20 dark:opacity-10 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                    style={{
                      clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                      backfaceVisibility: 'hidden',
                      transformStyle: 'preserve-3d'
                    }}
                  />
                </div>

                {/* Middle gradient orb - optimized animation */}
                <div className="absolute inset-x-0 top-[25%] transform-gpu overflow-hidden blur-3xl">
                  <div
                    className="gradient-orb gradient-orb-2 relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#9089fc] to-[#50c4aa] opacity-10 dark:opacity-5 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
                    style={{
                      clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                      backfaceVisibility: 'hidden',
                      transformStyle: 'preserve-3d'
                    }}
                  />
                </div>

                {/* Bottom gradient orb - optimized animation */}
                <div className="absolute inset-x-0 top-[calc(100%-13rem)] transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
                  <div
                    className="gradient-orb gradient-orb-3 relative left-[calc(50%-3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#50c4aa] to-[#9089fc] opacity-20 dark:opacity-10 sm:left-[calc(50%-36rem)] sm:w-[72.1875rem]"
                    style={{
                      clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                      backfaceVisibility: 'hidden',
                      transformStyle: 'preserve-3d'
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Header with reserved space to prevent CLS */}
            <div className="h-16 md:h-20 relative z-50">
              <Header />
            </div>
            
            <main className="flex-grow isolate relative z-40">
              {children}
            </main>
            <DynamicPreFooter />
            <DynamicFooter />
          </div>
          
          <Suspense fallback={null}>
            <FacebookPixelScript />
            {/* <GoogleAnalytics ga_id="G-1551CR6XGX" /> */}
            {/* <SmartlookScript /> */}
          </Suspense>
          <Toaster />
        </PricingProvider>
      </body>
    </html>
  );
}
