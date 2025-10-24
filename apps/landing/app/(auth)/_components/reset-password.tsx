'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { ActionResult, Form } from "@/lib/form";
import { resetPassword } from "@/lib/actions";
import { useToast } from "@repo/ui/hooks/use-toast";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { Loader2, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { PageBackground } from "./auth-background";

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formTouched, setFormTouched] = useState({
    password: false,
    confirmPassword: false,
  });

  const handleSubmit = async (prevState: any, formData: FormData): Promise<ActionResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await resetPassword(prevState, formData);
      if (result.success) {
        toast({
          title: "Password reset successful",
          description: result.success,
        });
        router.push('/login');
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
              Create New Password
            </h1>
            <p className="text-gray-600">
              Create a strong password for your account to keep it secure.
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
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Secure Account</h3>
                <p className="text-gray-600 text-sm">
                  Create a strong password to protect your account
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
                <h3 className="font-semibold text-gray-800">Protected Data</h3>
                <p className="text-gray-600 text-sm">
                  Your data is encrypted and secure with us
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel with form */}
        <div className="md:w-1/2 md:max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
            <p className="text-gray-500 mt-1">Enter your new password below</p>
          </div>

          {error && (
            <Alert 
              variant="destructive"
              className="mb-6"
            >
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Form action={handleSubmit}>
            <input type="hidden" name="token" value={token} />
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="New password"
                    className={`h-12 w-full rounded-lg border ${formTouched.password ? "border-blue-400" : "border-gray-300"} px-4 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
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
                    placeholder="Confirm new password"
                    className={`h-12 w-full rounded-lg border ${formTouched.confirmPassword ? "border-blue-400" : "border-gray-300"} px-4 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
                    onFocus={() =>
                      setFormTouched((prev) => ({ ...prev, confirmPassword: true }))
                    }
                    onBlur={(e) =>
                      e.target.value === "" &&
                      setFormTouched((prev) => ({ ...prev, confirmPassword: false }))
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
                  Reset Password
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