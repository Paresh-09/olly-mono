"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { ActionResult, Form } from "@/lib/form";
import { signup } from "@/lib/actions";
import { useToast } from "@repo/ui/hooks/use-toast";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { CheckCircle2, Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";
import GoogleOAuthButton from "./google-oauth-button";
import { PageBackground } from "./auth-background";
import { PostHogUser } from "@/app/lib/posthog-utils";
import posthog from "posthog-js";
import { useSearchParams } from "next/navigation";

export default function SignupForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callback");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);
  const [formTouched, setFormTouched] = useState({
    email: false,
    username: false,
    password: false,
    confirmPassword: false,
  });

  useEffect(() => {
    if (password || confirmPassword) {
      setPasswordMatch(password === confirmPassword);
    } else {
      setPasswordMatch(null);
    }
  }, [password, confirmPassword]);

  // Add function to validate and format email
  const validateAndFormatEmail = (email: string) => {
    // Convert email to lowercase
    return email.toLowerCase();
  };

  // Add function to validate and format username
  const validateAndFormatUsername = (username: string) => {
    // Convert username to lowercase
    return username.toLowerCase();
  };

  const handleSubmit = async (
    prevState: any,
    formData: FormData,
  ): Promise<ActionResult> => {
    setIsLoading(true);
    setError(null);

    // Get and format the email
    const emailInput = formData.get("email") as string;
    const formattedEmail = validateAndFormatEmail(emailInput);

    // Get and format the username
    const usernameInput = formData.get("username") as string;
    const formattedUsername = usernameInput ? validateAndFormatUsername(usernameInput) : null;

    // Replace the email and username in formData with the lowercase versions
    const updatedFormData = new FormData();

    // Get all form entries without using for...of iterator
    const entries = Array.from(formData.entries());
    entries.forEach(([key, value]) => {
      if (key === "email") {
        updatedFormData.append(key, formattedEmail);
      } else if (key === "username" && formattedUsername) {
        updatedFormData.append(key, formattedUsername);
      } else {
        updatedFormData.append(key, value);
      }
    });

    // Validate passwords match
    const submittedPassword = updatedFormData.get("password") as string;
    const submittedConfirmPassword = updatedFormData.get(
      "confirmPassword",
    ) as string;

    if (submittedPassword !== submittedConfirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return { error: "Passwords don't match" };
    }

    try {
      const result = await signup(prevState, updatedFormData);
      if (result.success) {
        // Track successful signup
        if (result.userId) {
          // Identify user in PostHog, keeping the same anonymous ID
          // but adding the user ID as a property (handled by the identify function)
          PostHogUser.identify(result.userId, {
            $set: {
              is_authenticated: true,
              is_anonymous: false,
              signup_method: "email",
              signup_date: new Date().toISOString(),
              is_new_user: true,
              onboarding_complete: false,
              email_domain: formattedEmail.split("@")[1],
              // user_id is automatically added by the identify function
            },
          });

          // Capture an explicit signup event for better funnel tracking
          posthog.capture("user_signup", {
            $set: {
              signup_date: new Date().toISOString(),
              // user_id is automatically included in events after identify
            },
            signup_method: "email",
            email_domain: formattedEmail.split("@")[1],
          });
        }

        toast({
          title: result.success,
          description: "Redirecting you...",
        });

        // Check for callback URL
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
      } else if (
        result.error ===
        "Account already exists, please check your email for password reset."
      ) {
        // Track existing user

        setIsExistingUser(true);
        toast({
          title: "Existing Account",
          description: "A password reset link has been sent to your email.",
        });
        return { error: result.error };
      } else if (result.error) {
        // Track signup error

        setError(result.error);
        return { error: result.error };
      }

      setError("An unexpected error occurred");
      return { error: "An unexpected error occurred" };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";

      // Track exception
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
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
              Start Growing Your Social Presence Today
            </h1>
            <p className="text-gray-600">
              Join thousands of creators leveraging AI to optimize their social
              media strategy.
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">
              What you'll get:
            </h3>
            <div className="space-y-5">
              <div className="flex items-start">
                <div className="flex-shrink-0 text-green-500 mr-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Free Forever Plan
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Get started with our basic features at no cost
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 text-green-500 mr-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Virality Scores
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Predict content performance before you post
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 text-green-500 mr-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Auto Engagement
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Increase your reach with smart automated engagement
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 text-green-500 mr-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Performance Insights
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Analyze what works and optimize your strategy
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 text-green-500 mr-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Customizable Dashboard
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Your data, your way - personalize your analytics view
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel with signup form */}
        <div className="md:w-1/2 md:max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              {isExistingUser ? "Create a password" : "Create an account"}
            </h2>
            <p className="text-gray-500 mt-1">
              {isExistingUser
                ? "Set a password for your existing account"
                : "Join Olly to unlock your social growth potential"}
            </p>
          </div>

          <div className="mb-6">
            <GoogleOAuthButton />
          </div>

          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute border-t border-gray-200 w-full"></div>
            <span className="relative px-4 bg-white text-sm text-gray-500">
              OR CONTINUE WITH EMAIL
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

              {!isExistingUser && (
                <div className="space-y-2">
                  <Input
                    id="username"
                    name="username"
                    placeholder="Choose a username"
                    className={`h-12 w-full rounded-lg border ${formTouched.username ? "border-blue-400" : "border-gray-300"} px-4 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
                    onFocus={() =>
                      setFormTouched((prev) => ({ ...prev, username: true }))
                    }
                    onBlur={(e) =>
                      e.target.value === "" &&
                      setFormTouched((prev) => ({ ...prev, username: false }))
                    }
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`h-12 w-full rounded-lg border ${formTouched.password ? "border-blue-400" : "border-gray-300"} px-4 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 pr-10`}
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
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`h-12 w-full rounded-lg border ${passwordMatch === false
                        ? "border-red-400"
                        : formTouched.confirmPassword
                          ? "border-blue-400"
                          : "border-gray-300"
                      } px-4 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 pr-10`}
                    onFocus={() =>
                      setFormTouched((prev) => ({
                        ...prev,
                        confirmPassword: true,
                      }))
                    }
                    onBlur={(e) =>
                      e.target.value === "" &&
                      setFormTouched((prev) => ({
                        ...prev,
                        confirmPassword: false,
                      }))
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showConfirmPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
                {passwordMatch !== null && confirmPassword && (
                  <p
                    className={`text-sm mt-1 ${passwordMatch ? "text-green-500" : "text-red-500"} flex items-center`}
                  >
                    {passwordMatch ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Passwords match
                      </>
                    ) : (
                      "Passwords do not match"
                    )}
                  </p>
                )}
              </div>

              <Button
                className={`w-full h-12 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-all duration-200 relative overflow-hidden ${isLoading ? "opacity-90" : ""
                  } active:scale-[0.99] ${(!passwordMatch && confirmPassword) || isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                type="submit"
                disabled={isLoading}
              >
                <span
                  className={`flex items-center justify-center ${isLoading ? "invisible" : "visible"}`}
                >
                  {isExistingUser ? "Set Password" : "Create Account"}
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

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href={callbackUrl ? `/login?callback=${encodeURIComponent(callbackUrl)}` : "/login"}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-8 text-center text-xs text-gray-500">
            <p>
              By signing up, you agree to our{" "}
              <Link href="/terms" className="text-gray-700 hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-gray-700 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
