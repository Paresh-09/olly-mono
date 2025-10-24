'use client';

import React, { useState } from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { useToast } from "@repo/ui/hooks/use-toast";

interface EmailVerificationPromptProps {
  user: {
    email: string;
    id: string;
  };
}

const EmailVerificationPrompt: React.FC<EmailVerificationPromptProps> = ({ user }) => {
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      const response = await fetch('/api/auth/resend-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Verification email sent successfully",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || 'Failed to send verification email',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast({
        title: "Error",
        description: "An error occurred while sending the verification email",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full">
        <h2 className="mb-4 text-2xl font-bold text-center">Email Verification Required</h2>
        <p className="mb-6 text-center">
          Please verify your email address to access the dashboard. 
          An email will be sent to {user.email}.
        </p>
        <Button 
          onClick={handleResendVerification} 
          className="w-full"
          disabled={isResending}
        >
          {isResending ? 'Sending...' : 'Send Verification Email'}
        </Button>
      </div>
    </div>
  );
};

export default EmailVerificationPrompt;