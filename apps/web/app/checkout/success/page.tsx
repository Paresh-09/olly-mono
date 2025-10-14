"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/onboarding");
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <svg className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#dcfce7" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2l4-4" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Thank you for your purchase!</h1>
        <p className="text-gray-600 mb-6">
          Your payment was successful and your account is now upgraded.<br />
          We&apos;re excited to have you on board!
        </p>
        
        <p className="text-xs text-gray-400 mt-6">
          Didn&apos;t get your confirmation email? Please check your spam folder or <a href="/support" className="underline hover:text-blue-600">contact support</a>.
        </p>
        <p className="text-sm text-blue-500 mt-4">You will be redirected to onboarding in 3 seconds...</p>
      </div>
    </div>
  );
}