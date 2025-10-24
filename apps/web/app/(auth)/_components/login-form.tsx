"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Card, CardContent, CardFooter } from "@repo/ui/components/ui/card";
import { ActionResult, Form } from "@/lib/form";
import { login } from "@/lib/actions";
import { useToast } from "@repo/ui/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert";
import { Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";
import GoogleOAuthButton from "./google-oauth-button";
import { useSearchParams } from "next/navigation";
import { PageBackground } from "./auth-background";
import { PostHogUser } from "@/app/lib/posthog-utils"
import posthog from "posthog-js";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const isExtensionLogin =
    searchParams.get("client_id") ===
    process.env.NEXT_PUBLIC_EXTENSION_CLIENT_ID;
  const callbackUrl = searchParams.get("callback");

  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetLinkSent, setResetLinkSent] = useState(false);
  const [reactivationLinkSent, setReactivationLinkSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formTouched, setFormTouched] = useState({
    email: false,
    password: false,
  });

  const handleSubmit = async (
    prevState: any,
    formData: FormData,
  ): Promise<ActionResult> => {
    setIsLoading(true);
    setError(null);
    setResetLinkSent(false);
    setReactivationLinkSent(false);

    if (isExtensionLogin) {
      formData.append("isExtensionLogin", "true");
      formData.append("client_id", searchParams.get("client_id") || "");
    }

    try {
      const result = await login(prevState, formData);
      if (result.success) {
        toast({
          title: result.success,
          description: "Login successful.",
        });

        // Identify user in PostHog if we have a userId
        if (result.userId) {
          // Update the user's profile with authentication data
          // The anonymous ID remains as the distinct ID
          PostHogUser.identify(result.userId, {
            $set: {
              is_authenticated: true,
              login_method: "email",
              login_date: new Date().toISOString(),
              is_extension_login: !!isExtensionLogin
              // user_id is automatically added by the identify function
            }
          });

          // Capture an explicit login event
          posthog.capture('user_login', {
            $set: {
              last_login: new Date().toISOString(),
              login_method: "email",
              is_extension_login: !!isExtensionLogin
            }
          });
        }

        // Handle extension login differently
        if (result.extensionAuth && result.authCode) {
          window.location.href = `/login/extension-callback?code=${result.authCode}`;
          return { success: result.success };
        } else {
          // Normal web login flow - check for callback URL
          if (callbackUrl) {
            // Validate the callback URL to ensure it's safe
            try {
              const url = new URL(callbackUrl);
              // Only allow HTTP/HTTPS protocols
              if (url.protocol === 'http:' || url.protocol === 'https:') {
                window.location.href = callbackUrl;
              } else {
                window.location.href = "/dashboard";
              }
            } catch {
              // Invalid URL, redirect to dashboard
              window.location.href = "/dashboard";
            }
          } else {
            window.location.href = "/dashboard";
          }
          return { success: result.success };
        }
      } else if (result.error === "User exists but has no password") {
        setResetLinkSent(true);
        return {}; // Return empty object to not show error in form
      } else if (
        result.error ===
        "Account is deactivated. A reactivation link has been sent to your email."
      ) {
        setReactivationLinkSent(true);
        return {}; // Return empty object to not show error in form
      } else if (result.error) {
        setError(result.error);
        return {}; // Return empty object to not show error in form
      }

      setError("An unexpected error occurred");
      return {}; // Return empty object to not show error in form
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";

      setError(errorMessage);
      return {}; // Return empty object to not show error in form
    } finally {
      setIsLoading(false);
    }
  };

  const createSignupUrl = () => {
    const params = new URLSearchParams();

    // Copy all current search parameters (including callback)
    searchParams.forEach((value, key) => {
      params.set(key, value);
    });

    return `/signup?${params.toString()}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <PageBackground />
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-x-10">
        {/* Left panel with branding and features */}
        <div className="md:w-1/2 p-10 md:pr-16">
          <div className="flex items-center mb-10">
            <Image
              src="/icon.png"
              alt="Olly Icon"
              width={40}
              height={40}
              className="mr-3"
            />
            <span className="font-bold text-2xl text-gray-800">Olly</span>
          </div>

          <div className="space-y-4 mb-10">
            <h1 className="text-4xl font-bold text-gray-900">
              Supercharge Your Social Media Presence
            </h1>
            <p className="text-gray-600">
              Join thousands of creators using Olly to optimize their social
              media with AI-powered insights.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-600"
                >
                  <path d="M2 12h5l2-6 2.5 12 2-9 1.5 3h5"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Virality Scores</h3>
                <p className="text-gray-600 text-sm">
                  Generate virality scores for your and community posts
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 bg-green-100 p-3 rounded-lg mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-600"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Auto Engagement</h3>
                <p className="text-gray-600 text-sm">
                  Automatically like and engage with posts to increase your
                  reach
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 bg-purple-100 p-3 rounded-lg mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-purple-600"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  Content Insights
                </h3>
                <p className="text-gray-600 text-sm">
                  Get AI-powered recommendations to optimize your content
                  strategy
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel with login form */}
        <div className="md:w-1/2 md:max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
          {isExtensionLogin && (
            <Alert className="mb-6">
              <AlertTitle>Extension Authentication</AlertTitle>
              <AlertDescription>
                You're logging in to connect your Olly extension. After login,
                your extension will be automatically configured.
              </AlertDescription>
            </Alert>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-500 mt-1">Sign in to your account</p>
          </div>

          {(error || resetLinkSent || reactivationLinkSent) && (
            <Alert variant={error ? "destructive" : "default"} className="mb-6">
              <AlertDescription>
                {error ||
                  (resetLinkSent
                    ? "A password reset link has been sent to your email. Please check your inbox."
                    : "A reactivation link has been sent to your email. Please check your inbox to reactivate your account.")}
              </AlertDescription>
            </Alert>
          )}

          <div className="mb-6">
            <GoogleOAuthButton />
          </div>

          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute border-t border-gray-200 w-full"></div>
            <span className="relative px-4 bg-white text-sm text-gray-500">
              OR CONTINUE WITH
            </span>
          </div>

          <Form action={handleSubmit}>
            <div className="space-y-5">
              <div className="space-y-2">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  className={`h-12 w-full rounded-lg border ${formTouched.email ? "border-blue-400" : "border-gray-300"} px-4 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
                  autoComplete="email"
                  onFocus={() =>
                    setFormTouched((prev) => ({ ...prev, email: true }))
                  }
                  onBlur={(e) =>
                    e.target.value === "" &&
                    setFormTouched((prev) => ({ ...prev, email: false }))
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className={`h-12 w-full rounded-lg border ${formTouched.password ? "border-blue-400" : "border-gray-300"} px-4 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
                    autoComplete="current-password"
                    onFocus={() =>
                      setFormTouched((prev) => ({ ...prev, password: true }))
                    }
                    onBlur={(e) =>
                      e.target.value === "" &&
                      setFormTouched((prev) => ({ ...prev, password: false }))
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
                <div className="flex justify-end mt-1.5">
                  <Link
                    href="/reset-password"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                className={`w-full h-12 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-all duration-200 relative overflow-hidden ${isLoading ? "opacity-90" : ""
                  } active:scale-[0.99]`}
                type="submit"
                disabled={isLoading}
              >
                <span
                  className={`flex items-center justify-center ${isLoading ? "invisible" : "visible"}`}
                >
                  Continue with Email
                  {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                </span>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 relative">
                      <div className="animate-ping absolute inset-0 rounded-full bg-white opacity-75"></div>
                      <Loader2 className="h-6 w-6 animate-spin text-white relative" />
                    </div>
                  </div>
                )}
              </Button>
            </div>
          </Form>

          <div className="mt-4 flex justify-center">
            <Link
              href="/set-password"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Set or change your password
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href={createSignupUrl()}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-gray-700 hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy-policy" className="text-gray-700 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
