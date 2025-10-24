'use client';

import { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { ActionResult, Form } from "@/lib/form";
import { forgotPassword } from "@/lib/actions";
import { useToast } from "@repo/ui/hooks/use-toast";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { PageBackground } from "./auth-background";

export default function ForgotPasswordForm() {
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
      const result = await forgotPassword(prevState, formData);
      if (result.success) {
        setSuccess(result.success);
        toast({
          title: "Reset link sent",
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
              Reset Your Password
            </h1>
            <p className="text-gray-600">
              Enter your email address below and we'll send you a link to reset your password.
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
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Quick Support</h3>
                <p className="text-gray-600 text-sm">
                  Get help with your account from our support team
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
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Secure Process</h3>
                <p className="text-gray-600 text-sm">
                  Our password reset process is secure and encrypted
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel with form */}
        <div className="md:w-1/2 md:max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
            <p className="text-gray-500 mt-1">We'll email you a reset link</p>
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
                  Send Reset Link
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