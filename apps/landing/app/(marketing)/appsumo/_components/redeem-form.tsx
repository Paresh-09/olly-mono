"use client";

import React, { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import { Label } from '@repo/ui/components/ui/label';
import { useToast } from '@repo/ui/hooks/use-toast';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

interface LicenseData {
  license_key: string;
  status: string;
  scopes: string[];
  accessToken?: string;
}

interface UserFormData {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}

const createSchema = (isLoggedIn: boolean) => {
  const baseSchema = {
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email({ message: "Invalid email address." }),
  };

  if (!isLoggedIn) {
    return z.object({
      ...baseSchema,
      password: z.string().min(8, { message: "Password must be at least 8 characters" }),
      confirmPassword: z.string()
    }).refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });
  }

  return z.object(baseSchema);
};

interface UserInfoFormProps {
  initialLicenseData: LicenseData | null;
  isLoggedIn: boolean;
}

export default function UserInfoForm({ initialLicenseData, isLoggedIn }: UserInfoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<UserFormData>({
    resolver: zodResolver(createSchema(isLoggedIn))
  });

  // Always call useWatch, but only use the values when needed
  const password = useWatch({ control, name: "password" });
  const confirmPassword = useWatch({ control, name: "confirmPassword" });

  useEffect(() => {
    if (!isLoggedIn && (password || confirmPassword)) {
      setPasswordMatch(password === confirmPassword);
    }
  }, [password, confirmPassword, isLoggedIn]);

  const onSubmit = async (data: UserFormData) => {
    if (!initialLicenseData) {
      toast({
        title: "Activation Error",
        description: "No license key detected. Please try again or contact support.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/appsumo-redeem-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          licenseKey: initialLicenseData.license_key,
          accessToken: initialLicenseData?.accessToken,
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || "Failed to activate license");
      }

      if (responseData.alreadyActivated) {
        toast({
          title: "License Already Activated",
          description: responseData.message,
          variant: "default",
          duration: 7000,
        });
        router.push('/onboarding');
        return;
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

  const renderPasswordFields = () => {
    if (isLoggedIn) return null;

    return (
      <>
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              {...register("password")} 
              className="w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password?.message as string}</p>}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input 
              id="confirmPassword" 
              type={showConfirmPassword ? "text" : "password"} 
              {...register("confirmPassword")} 
              className="w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword?.message as string}</p>
          )}
          {passwordMatch !== null && confirmPassword && (
            <p className={`text-sm mt-1 ${passwordMatch ? 'text-green-500' : 'text-red-500'}`}>
              {passwordMatch ? 'Passwords match ✓' : 'Passwords do not match'}
            </p>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-center mb-4">
        <Image
          src="/tacos-appsumo-black.png"
          alt="AppSumo Logo"
          width={24}
          height={24}
        />
        <h2 className="text-2xl font-bold ml-2">Welcome Sumoling! 👋</h2>
      </div>
      <p className="mb-6 text-center text-gray-600">Please enter your details to generate your key.</p>
      {initialLicenseData ? (
        <div className="mb-6 p-4 bg-green-100 rounded-md">
          <p className="text-green-800 font-semibold">Your license key is ready to activate. Please fill the details below and we will generate a unique key for you.</p>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-yellow-100 rounded-md">
          <p className="text-yellow-800">Not a valid code. Please follow the AppSumo activation <Link className='text-blue-700' target='_blank' href={"https://appsumo.com/account/products/"}>Link</Link> or <Link className='text-blue-700' target='_blank' href={"https://appsumo.com/products/olly/"}>Buy a License</Link> via AppSumo. Something not right? Write to support@explainx.ai.</p>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" type="text" {...register("name")} />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name?.message as string}</p>}
        </div>
        
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email?.message as string}</p>}
        </div>

        {renderPasswordFields()}

        <Button type="submit" className="w-full" disabled={isSubmitting || !initialLicenseData}>
          {isSubmitting ? "Activating..." : "Activate License"}
        </Button>
      </form>
    </div>
  );
}