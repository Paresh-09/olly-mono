// In /components/SetPasswordForm.tsx

'use client'

import { useState } from 'react';
import Link from 'next/link';
import Image from "next/image";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { ActionResult, Form } from "@/lib/form";
import { initiateSetPassword } from "@/lib/actions";
import { useToast } from "@repo/ui/hooks/use-toast";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { PageBackground } from "./auth-background";

export default function SetPasswordForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formTouched, setFormTouched] = useState({
    email: false,
  });

  const handleSubmit = async (prevState: any, formData: FormData): Promise<ActionResult> => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await initiateSetPassword(prevState, formData);
      if (result.success) {
        setSuccess(result.success);
        toast({
          title: "Success",
          description: result.success,
        });
        return { success: result.success };
      } else if (result.error) {
        setError(result.error);
        return { error: result.error };
      }
      setError("An unexpected error occurred");
      return { error: "An unexpected error occurred" };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setIsLoading(false);
    }
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
              Set Your Password
            </h1>
            <p className="text-gray-600">
              Create a password for your account to access all features.
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
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                  <line x1="9" y1="9" x2="9.01" y2="9"></line>
                  <line x1="15" y1="9" x2="15.01" y2="9"></line>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Easy Setup</h3>
                <p className="text-gray-600 text-sm">
                  Set your password in just a few simple steps
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
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Complete Access</h3>
                <p className="text-gray-600 text-sm">
                  Get full access to your account and all features
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel with form */}
        <div className="md:w-1/2 md:max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Set Password</h2>
            <p className="text-gray-500 mt-1">Enter your email to set a password for your account</p>
          </div>

          {(error || success) && (
            <Alert 
              variant={error ? "destructive" : "default"}
              className="mb-6"
            >
              <AlertDescription>
                {error || success}
              </AlertDescription>
            </Alert>
          )}

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

              <Button
                className={`w-full h-12 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-all duration-200 relative overflow-hidden ${
                  isLoading ? "opacity-90" : ""
                } active:scale-[0.99]`}
                type="submit"
                disabled={isLoading}
              >
                <span
                  className={`flex items-center justify-center ${isLoading ? "invisible" : "visible"}`}
                >
                  Send Password Setup Instructions
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

          <div className="mt-6 flex justify-center">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-800 inline-flex items-center"
            >
              <ArrowLeft className="mr-2 h-3 w-3" />
              Back to sign in
            </Link>
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