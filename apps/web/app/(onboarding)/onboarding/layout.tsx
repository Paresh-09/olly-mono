import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL("https://www.olly.social"),
  title:
    "Get Started with Olly: AI-Powered Social Media Assistant",
  description:
    "Olly redefines social media engagement by not only creating compelling comments but also assessing virality scores and generating similar posts. This Chrome Extension serves as your personal AI assistant, optimizing your presence on platforms like LinkedIn, Twitter, Reddit, and Facebook.",
  openGraph: {
    title: "Get Started with Olly: AI-Powered Social Media Assistant",
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

const OnboardingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      {children}
    </div>
  )
}
export default OnboardingLayout
