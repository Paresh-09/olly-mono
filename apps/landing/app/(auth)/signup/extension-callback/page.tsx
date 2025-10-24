"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import { CheckCircle } from "lucide-react";
import { PageBackground } from "../../_components/auth-background";

export default function ExtensionCallback() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const onboardingCode = searchParams.get("onboarding_code");
  const redirectUrl = searchParams.get("redirect_url");
  const isExtensionLogin = searchParams.get("isExtensionLogin") === "true";

  useEffect(() => {
    const authenticateExtension = async () => {
      try {
        // Set document title for the extension to detect
        document.title = "Authentication Complete";
        
        const response = await fetch("/api/auth/extension/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
          }),
        });

        const data = await response.json();

        // If there's an onboarding code, redirect to onboarding
        if (onboardingCode) {
          window.location.href = `/onboarding?code=${onboardingCode}&isExtensionLogin=true&isConnected=true&step=1`;
          return;
        }

        // If there's a redirect URL and it's not an extension login, redirect
        if (redirectUrl && !isExtensionLogin) {
          window.location.href = redirectUrl;
        }
      } catch (error) {
        console.error("Error during authentication:", error);
      }
    };

    authenticateExtension();
  }, [code, onboardingCode, redirectUrl, isExtensionLogin]);

  // If there's an onboarding code, show a redirecting to onboarding message
  if (onboardingCode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5">
        <PageBackground />
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-center mb-6">
              <Image
                src="/icon.png"
                alt="Olly Icon"
                width={40}
                height={40}
                className="mr-3"
              />
              <span className="font-bold text-2xl text-gray-800">Olly</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-3">
                Setting Up Your Account...
              </h1>
              <p className="text-gray-600">
                Please wait while we redirect you to complete your account setup.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If it's not an extension login and there's a redirect URL, show a redirecting message
  if (!isExtensionLogin && redirectUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5">
        <PageBackground />
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-center mb-6">
              <Image
                src="/icon.png"
                alt="Olly Icon"
                width={40}
                height={40}
                className="mr-3"
              />
              <span className="font-bold text-2xl text-gray-800">Olly</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-3">
                Redirecting...
              </h1>
              <p className="text-gray-600">
                Please wait while we redirect you to your destination.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default extension success view
  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <PageBackground />
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-center mb-6">
            <Image
              src="/icon.png"
              alt="Olly Icon"
              width={40}
              height={40}
              className="mr-3"
            />
            <span className="font-bold text-2xl text-gray-800">Olly</span>
          </div>

          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              Authentication Successful
            </h1>

            <p className="text-gray-600 mb-6">
              You can close this tab and return to the Olly extension.
            </p>

            <p className="text-sm text-gray-500 mb-8">
              Your Olly extension is now configured with your account settings.
            </p>

            <Link href="/dashboard">
              <Button className="bg-black hover:bg-gray-800 text-white rounded-lg transition-all duration-200">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
