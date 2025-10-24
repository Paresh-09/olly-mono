"use client"

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import { Label } from '@repo/ui/components/ui/label';
import { useToast } from '@repo/ui/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/ui/dialog';
import Image from 'next/image';
import { Check, Copy, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RedeemData {
  redeemCode: string;
  licenseKey: string;
  status: 'claimed' | 'unclaimed';
}

interface RedeemFormUserInfoProps {
  initialRedeemCode: string;
  vendor: string;
}

const schema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters long" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

type UserFormData = z.infer<typeof schema>;

export default function RedeemFormUserInfo({ initialRedeemCode, vendor }: RedeemFormUserInfoProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [redeemData, setRedeemData] = useState<RedeemData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const fetchRedeemData = async () => {
      try {
        const response = await fetch("/api/redeem-code", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code: initialRedeemCode }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch redeem code data");
        }

        const data = await response.json();
        setRedeemData(data.data);
      } catch (error) {
        console.error("Error fetching redeem data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch redeem code data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRedeemData();
  }, [initialRedeemCode, toast]);

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/redeem-license", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          redeemCode: redeemData?.redeemCode,
          licenseKey: redeemData?.licenseKey,
          vendor,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to activate license");
      }

      router.push('/onboarding');
    } catch (error) {
      console.error("Error activating license:", error);
      toast({
        title: "Activation Error",
        description: error instanceof Error ? error.message : "An error occurred. Please try again later.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!redeemData) {
    return <div>Invalid redeem code. Please try again.</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-center mb-4">
        <Image
          src="/icon-2.png"
          alt="Olly Logo"
          width={24}
          height={24}
        />
        <h2 className="text-2xl font-bold ml-2">Sign Up</h2>
      </div>
      <p className="mb-6 text-center text-gray-600">Please enter your details to activate your license and create an account.</p>
      {redeemData.status === 'unclaimed' ? (
        <div className="mb-6 p-4 bg-green-100 rounded-md">
          <p className="text-green-800 font-semibold">Your license key is ready to activate. Please fill in the details below.</p>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-yellow-100 rounded-md">
          <p className="text-yellow-800">This code has already been claimed. If you believe this is an error, please contact support.</p>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name" className="block mb-1">Name</Label>
          <Input id="name" type="text" {...register("name")} className="w-full" />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="email" className="block mb-1">Email</Label>
          <Input id="email" type="email" {...register("email")} className="w-full" />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="username" className="block mb-1">Username</Label>
          <Input id="username" type="text" {...register("username")} className="w-full" />
          {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
        </div>
        <div>
          <Label htmlFor="password" className="block mb-1">Password</Label>
          <Input id="password" type="password" {...register("password")} className="w-full" />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting || redeemData.status !== 'unclaimed'}>
          {isSubmitting ? "Activating..." : "Activate License and Sign Up"}
        </Button>
      </form>
    </div>
  );
}