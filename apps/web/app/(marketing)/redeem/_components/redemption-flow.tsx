"use client";

import React from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function RedemptionFlow() {
  const router = useRouter();

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Image
            src="/icon-2.png"
            alt="Olly Logo"
            width={40}
            height={40}
          />
        </div>
        <CardTitle className="text-2xl">Redeem Your Code</CardTitle>
        <CardDescription>
          To redeem your code, you need to login or create an account first.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-muted-foreground">
          After logging in, you'll be redirected to the dashboard where you can enter your redeem code.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3">
        <Button 
          className="w-full" 
          onClick={() => router.push('/login')}
        >
          Login to Redeem
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => router.push('/signup')}
        >
          Create Account
        </Button>
      </CardFooter>
    </Card>
  );
}