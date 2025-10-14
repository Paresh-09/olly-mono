import { Metadata } from 'next';
import { validateRequest } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ClientDealsPage from './_components/client-deals-page';

export const metadata: Metadata = {
  title: "Redeem Your Olly Code | Activate AI-Powered Social Media Tools",
  description: "Login or create an account to redeem your Olly code and unlock AI-powered social media tools.",
  alternates: {
    canonical: "/redeem",
  },
  keywords: "Olly code redemption, license key, AI comment generator, Reddit summarizer, social media tools, promotional code, software activation, AI-powered tools, digital marketing, content creation, social media management, code activation, Olly license",
  openGraph: {
    title: "Redeem Your Olly Code | Unlock AI Social Media Tools",
    description: "Login or create an account to redeem your Olly promotional code and gain access to our AI-powered tools.",
    url: "https://www.olly.social/redeem",
    siteName: "Olly Social",
    images: [
      {
        url: "https://www.olly.social/features/twitter-main.png",
        width: 1200,
        height: 630,
        alt: "Olly Code Redemption",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Redeem Your Olly Code | Get Your AI Social Media Assistant",
    description: "Login or create an account to redeem your Olly code and start boosting your social media engagement now!",
    images: ["https://www.olly.social/features/twitter-main.png"],
  },
};

export default async function RedeemPage() {
  const { user } = await validateRequest();

  // If user is already logged in, redirect them to the dashboard redeem page
  if (user?.id) {
    return redirect('/dashboard/redeem');
  }

  // For unauthenticated users, show the login/signup prompt
  return <ClientDealsPage />;
}