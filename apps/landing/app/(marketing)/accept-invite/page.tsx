'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@repo/ui/components/ui/card";
import Link from 'next/link';

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'unauthenticated'>('loading');
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid invitation link');
      return;
    }

    const processInvitation = async () => {
      try {
        const response = await fetch('/api/orgs/accept-invite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.status === 401) {
          setStatus('unauthenticated');
          setMessage('Please log in to accept the invitation');
        } else if (response.ok) {
          setStatus('success');
          setMessage(data.success);
        } else {
          setStatus('error');
          setMessage(data.error);
        }
      } catch (error) {
        setStatus('error');
        setMessage('An unexpected error occurred');
      }
    };

    processInvitation();
  }, [token]);

  const handleLogin = () => {
    router.push(`/login?redirect=${encodeURIComponent(`/accept-invite?token=${token}`)}`);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Organization Invitation</CardTitle>
          <CardDescription>Processing your invitation to join an organization</CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <Alert>
              <AlertDescription>Processing your invitation...</AlertDescription>
            </Alert>
          )}
          {status === 'success' && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          {status === 'error' && (
            <Alert variant="destructive">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          {status === 'unauthenticated' && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {status === 'unauthenticated' ? (
            <Button onClick={handleLogin}>Log In</Button>
          ) : (
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}