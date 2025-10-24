// Updated BrandVoiceToggle.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Control } from "react-hook-form";
import { FormValues } from "../page";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@repo/ui/components/ui/form";
import { Switch } from "@repo/ui/components/ui/switch";
import { Button } from "@repo/ui/components/ui/button";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Interface for license type
interface License {
  id: string;
  key: string;
  name: string;
  status: string;
}

interface BrandVoiceToggleProps {
  control: Control<FormValues>;
  isLoadingLicenses: boolean;
  availableLicenses: License[];
  brandVoiceData: any;
  isBrandVoiceLoading: boolean;
  brandVoiceError: string | null;
}

export default function BrandVoiceToggle({ 
  control, 
  availableLicenses, 
  isLoadingLicenses,
  brandVoiceData,
  isBrandVoiceLoading,
  brandVoiceError
}: BrandVoiceToggleProps) {
  const router = useRouter();
  const [hasBrandVoice, setHasBrandVoice] = useState<boolean>(false);
  
  // Function to get license by ID - still needed for navigation
  const getLicenseById = useCallback((id: string): License | undefined => {
    return availableLicenses.find(license => license.id === id);
  }, [availableLicenses]);
  
  // Update hasBrandVoice when brandVoiceData changes
  useEffect(() => {
    if (brandVoiceData) {
      const hasDefinedBrandVoice = brandVoiceData && 
        (brandVoiceData.brandVoice || brandVoiceData.brandPersonality);
      
      setHasBrandVoice(!!hasDefinedBrandVoice);
    }
  }, [brandVoiceData]);
  
  const navigateToBrandVoicePage = useCallback(() => {
    // Only navigate if we have licenses available
    if (availableLicenses && availableLicenses.length > 0) {
      // Get the license using first license's ID
      const license = getLicenseById(availableLicenses[0].id);
      
      if (!license) {
        console.error("License not found");
        return;
      }
      
      // Use the license key for the URL
      router.push(`/dashboard/brand/train/${license.key}`);
    } else {
      console.error("No licenses available to navigate to brand voice page");
    }
  }, [availableLicenses, getLicenseById, router]);

  // Show loading state when checking for brand voice or when licenses are loading
  if (isBrandVoiceLoading || isLoadingLicenses) {
    return (
      <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
        <div className="space-y-0.5">
          <FormLabel>Use Brand Voice</FormLabel>
          <FormDescription>
            Checking brand voice settings...
          </FormDescription>
        </div>
        <FormControl>
          <Loader2 className="h-4 w-4 animate-spin" />
        </FormControl>
      </FormItem>
    );
  }
  
  // Show error state if an error occurred
  if (brandVoiceError) {
    return (
      <FormItem className="flex flex-col space-y-3 rounded-md border p-4 border-red-200 bg-red-50">
        <div className="space-y-0.5">
          <FormLabel>Brand Voice</FormLabel>
          <FormDescription className="text-red-700">
            Error: {brandVoiceError}. Please try again later.
          </FormDescription>
        </div>
      </FormItem>
    );
  }
  
  // Show error state if no licenses are available
  if (!availableLicenses || availableLicenses.length === 0) {
    return (
      <FormItem className="flex flex-col space-y-3 rounded-md border p-4">
        <div className="space-y-0.5">
          <FormLabel>Brand Voice</FormLabel>
          <FormDescription>
            You need a valid license to use brand voice features.
          </FormDescription>
        </div>
      </FormItem>
    );
  }

  // Show creation option if no brand voice exists
  if (hasBrandVoice === false) {
    return (
      <FormItem className="flex flex-col space-y-3 rounded-md border p-4">
        <div className="space-y-0.5">
          <FormLabel>Brand Voice</FormLabel>
          <FormDescription>
            You haven't set up your brand voice yet. Creating a brand voice profile will help the AI generate content that matches your brand's personality and style.
          </FormDescription>
        </div>
        <Button 
          type="button" 
          onClick={navigateToBrandVoicePage}
          className="w-full sm:w-auto self-start mt-2"
        >
          Create Brand Voice Profile
        </Button>
      </FormItem>
    );
  }

  // Show toggle if brand voice exists
  return (
    <FormField
      control={control as any}
      name="useBrandVoice"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
          <div className="space-y-0.5">
            <FormLabel>
              Use Brand Voice
            </FormLabel>
            <FormDescription>
              Automate comments using your brand's voice and style. 
              <Button 
                type="button" 
                onClick={navigateToBrandVoicePage} 
                variant="link" 
                className="h-auto p-0 text-xs ml-1"
              >
                Edit Brand Voice
              </Button>
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}