import React, { Suspense } from 'react';
import { Metadata } from "next";
import { redirect } from 'next/navigation';
import UserInfoForm from './_components/redeem-form';
import LoadingSpinner from './_components/appsumo-loader';
import { validateRequest } from '@/lib/auth';
import LicenseConfirmation from './_components/license-confirmation-server';

export const metadata: Metadata = {
  title: "AppSumo Redemption | Activate Your Olly Social AI-Powered Comments Tool",
  description: "Redeem your AppSumo code and activate Olly Social's AI-powered comment generation tool for all social media channels. Streamline your social media engagement today!",
  keywords: "AppSumo redemption, Olly Social, AI comments, social media tool, AppSumo deal",
  alternates: { canonical: "/appsumo" },
  openGraph: {
    title: "Activate Your Olly Social AppSumo Deal - AI-Powered Social Media Comments",
    description: "Redeem your AppSumo purchase and start generating AI-powered comments across all your social media channels with Olly Social. Enhance your online engagement effortlessly!",
    url: "https://www.olly.social/appsumo",
    siteName: "Olly Social",
    images: [
      {
        url: "https://www.olly.social/features/twitter-main.png",
        width: 1200,
        height: 630,
        alt: "Olly Social AppSumo Redemption",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Redeem Your Olly Social AppSumo Deal - AI Comment Generator",
    description: "Activate your AppSumo purchase of Olly Social and start crafting AI-powered comments for all your social media channels. Boost your engagement now!",
    images: ["https://www.olly.social/features/twitter-main.png"],
  },
};

async function getAccessToken(code: string) {
  const params = new URLSearchParams({
    client_id: process.env.APPSUMO_CLIENT_ID!,
    client_secret: process.env.APPSUMO_CLIENT_SECRET!,
    code: code,
    redirect_uri: 'https://www.olly.social/appsumo/',
    grant_type: 'authorization_code',
  });

  const response = await fetch('https://appsumo.com/openid/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    throw new Error(`Failed to fetch access token: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function getLicense(accessToken: string) {
  const response = await fetch(`https://appsumo.com/openid/license_key/?access_token=${accessToken}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch license');
  }

  return await response.json();
}

// async function getAccessToken(code: string) {
//   // For testing
//   return {
//     access_token: "test_access_token_123",
//     token_type: "Bearer",
//     expires_in: 3600
//   };
// }

// async function getLicense(accessToken: string) {
//   // For testing
//   return {
//     license_key: "TEST-APPSUMO-123",
//     status: "ACTIVE", 
//     scopes: ["premium"],
//     accessToken: accessToken
//   };
// }

async function LicenseDataFetcher({ code, user }: { code: string; user: any }) {
  let licenseData = null;

  try {
    const tokenData = await getAccessToken(code);
    licenseData = await getLicense(tokenData.access_token);
    licenseData = {
      ...licenseData,
      accessToken: tokenData.access_token
    };
  } catch (error) {
    console.error('Error fetching license data:', error);
    // redirect('/error-page');
  }

  if (user && licenseData) {
    return <LicenseConfirmation user={user} licenseData={licenseData} />;
  }

  return <UserInfoForm initialLicenseData={licenseData} isLoggedIn={!!user} />;
}

export default async function UserInfoPage(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
  }
) {
  const searchParams = await props.searchParams;
  const code = searchParams.code as string | undefined;
  const { user } = await validateRequest();
  const isLoggedIn = !!user;

  if (!code) {
    return (
      <div className="container mx-auto py-12">
        <UserInfoForm initialLicenseData={null} isLoggedIn={isLoggedIn} />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <Suspense fallback={<LoadingSpinner />}>
        <LicenseDataFetcher code={code} user={user} />
      </Suspense>
    </div>
  );
}