import React, { useState, useEffect } from "react";
import { Control } from "react-hook-form";
import { FormValues } from "../page";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Button } from "@repo/ui/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface License {
  id: string;
  key: string;
  name: string;
  status: string;
}

interface LicenseSelectorProps {
  control: Control<FormValues>;
  isLoadingLicenses: boolean;
  availableLicenses: License[];
}

export default function LicenseSelector({
  control,
  isLoadingLicenses,
  availableLicenses,
}: LicenseSelectorProps) {
  const [copied, setCopied] = useState(false);
  
  // Find the license by id
  const getLicenseById = (id: string): License | undefined => {
    return availableLicenses.find(license => license.id === id);
  };
  
  // Copy the license key to clipboard
  const copyLicenseKey = (licenseId: string | undefined) => {
    if (!licenseId) return;
    
    const license = getLicenseById(licenseId);
    if (!license) return;
    
    navigator.clipboard.writeText(license.key)
      .then(() => {
        setCopied(true);
        toast.success("License key copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error("Failed to copy license key:", err);
        toast.error("Failed to copy license key");
      });
  };

  return (
    <FormField
      control={control}
      name="licenseKey"
      render={({ field }) => {
        
        useEffect(() => {
          if (!isLoadingLicenses && availableLicenses.length > 0 && !field.value) {
         
            field.onChange(availableLicenses[0].id);
          }
        }, [isLoadingLicenses, availableLicenses, field]);
        
        return (
          <FormItem>
            <FormLabel>License Key</FormLabel>
            <div className="flex gap-2 items-start">
              <div className="flex-1">
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoadingLicenses || availableLicenses.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoadingLicenses
                            ? "Loading licenses..."
                            : availableLicenses.length === 0
                              ? "No licenses available"
                              : "Select a license key"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableLicenses.length === 0 && !isLoadingLicenses ? (
                      <SelectItem value="no-licenses" disabled>
                        No licenses available
                      </SelectItem>
                    ) : (
                      availableLicenses.map((license) => (
                        <SelectItem key={license.id} value={license.id}>
                          <div className="flex flex-col">
                            <span>{license.name || license.key}</span>
                            {license.name && license.key && (
                              <span className="text-xs text-muted-foreground">
                                {license.key}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => field.value && copyLicenseKey(field.value)}
                disabled={!field.value || isLoadingLicenses}
                title="Copy license key"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <FormDescription>
              {availableLicenses.length === 0 && !isLoadingLicenses ? (
                <div className="text-yellow-600">
                  Auto-commenter is currently restricted to paid users only. You can get a license from{" "}
                  <Link href="/plans" className="underline font-medium">
                    the plans page
                  </Link>{" "}
                  to setup.
                </div>
              ) : (
                <>
                  Select the license to use for this configuration.
                  {field.value && (
                    <span className="ml-1">
                      You can copy the license key with the button above.
                    </span>
                  )}
                </>
              )}
            </FormDescription>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}