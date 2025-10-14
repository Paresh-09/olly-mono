import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Olly LinkedIn Agent: Autonomous AI for Social Media Engagement",
  description: "The Olly LinkedIn Agent automatically engages with your audience by commenting, liking, and targeting relevant content. This autonomous tool runs in your browser, requires no passwords, and helps grow your professional network with minimal effort. Set your brand voice, keywords, and let AI work for you.",
  openGraph: {
    title: "Olly LinkedIn Agent: Autonomous AI for Social Media Engagement",
    description: "The Olly LinkedIn Agent automatically engages with your audience by commenting, liking, and targeting relevant content. This autonomous tool runs in your browser, requires no passwords, and helps grow your professional network with minimal effort.",
    url: "https://www.olly.social/ai-agent-social-media",
    siteName: "Olly - Your AI-Powered Second Brain",
    images: [
      {
        url: "https://videosilvids.s3.ap-south-1.amazonaws.com/Screenshot+2024-01-15+at+1.00.33%E2%80%AFPM.png",
        width: 1200,
        height: 630,
      }
    ],
    locale: "en_US",
    type: "website",
  },
  keywords: "Olly, LinkedIn Agent, AI Social Media, Autonomous Engagement, LinkedIn Marketing, Social Media Automation, AI Commenting, Professional Network Growth, Audience Engagement, Browser Extension",
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function SocialAgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 