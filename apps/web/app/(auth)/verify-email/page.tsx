'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import { CheckCircle, X, Loader2 } from 'lucide-react';
import { PageBackground } from "../_components/auth-background";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email address...');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Please request a new verification email.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/email-verification?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Email verified successfully!');
          
          // Redirect after 2 seconds for better UX
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
        } else {
          setStatus('error');
          setMessage(data.error || 'An unknown error occurred while verifying your email.');
        }

      } catch (error) {
        console.error('Error verifying email:', error);
        setStatus('error');
        setMessage('An error occurred while verifying your email. Please try again later.');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <PageBackground />
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-center mb-8">
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
            {status === 'loading' && (
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
              </div>
            )}
            
            {status === 'success' && (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            )}
            
            {status === 'error' && (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <X className="h-10 w-10 text-red-600" />
              </div>
            )}
            
            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              Email Verification
            </h1>
            
            <p className="text-gray-600 mb-8">
              {message}
            </p>
            
            {status === 'success' && (
              <div className="flex items-center justify-center w-full space-x-1">
                <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                <span className="text-gray-500">Redirecting to dashboard...</span>
              </div>
            )}
            
            {status === 'error' && (
              <div className="space-y-4">
                <Link href="/login">
                  <Button 
                    className="bg-black hover:bg-gray-800 text-white rounded-lg transition-all duration-200"
                  >
                    Back to Login
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}