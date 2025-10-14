import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.olly.social"),
  title: "AI & Social Media Blog - Olly Social",
  description: 
    "Explore our blog for expert insights on social media growth, AI tools, and digital marketing strategies. Discover how to leverage artificial intelligence to boost your social media presence, increase engagement, and grow your audience organically across platforms like Instagram, LinkedIn, TikTok, and more.",
  keywords: 
    "Social Media Blog, AI Marketing, Instagram Growth, LinkedIn Strategies, TikTok Growth, AI Content Tools, Social Media Tips, Digital Marketing Blog, Engagement Strategies, Audience Growth, AI Comments, Follower Growth, Social Media AI",
  openGraph: {
    title: "AI & Social Media Blog - Olly Social",
    description: 
      "Expert insights on leveraging AI for social media growth, content creation, and audience engagement. Get the latest tips, tools, and strategies to transform your social media presence.",
    url: "https://www.olly.social/blog",
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
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
} 