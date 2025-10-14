import React from "react";
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
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Badge } from "@repo/ui/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { PLATFORM_CONFIG } from "../utils";

interface License {
  id: string;
  key: string;
  name: string;
  status: string;
}

interface PlatformSelectorProps {
  control: Control<FormValues>;
  availableLicenses: License[];
  isLoadingLicenses: boolean;
}

export default function PlatformSelector({
  control,
  availableLicenses,
  isLoadingLicenses,
}: PlatformSelectorProps) {
  const hasAvailableLicenses =
    !isLoadingLicenses && availableLicenses.length > 0;

  return (
    <FormField
      control={control}
      name="enabledPlatforms"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Enabled Platforms</FormLabel>
          <div className="space-y-3">
            {Object.entries(PLATFORM_CONFIG).map(([key, config]) => {
              const IconComponent = config.icon;
              const isSelected = field.value?.includes(key as any) || false;

              return (
                <div
                  key={key}
                  className={`relative flex items-center space-x-3 rounded-lg border p-3 transition-all ${
                    isSelected
                      ? "border-blue-200 bg-blue-50 shadow-sm"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  } ${!hasAvailableLicenses ? "opacity-50" : ""}`}
                >
                  <FormControl>
                    <Checkbox
                      checked={isSelected}
                      disabled={!hasAvailableLicenses}
                      onCheckedChange={(checked) => {
                        const currentPlatforms = field.value || [];
                        if (checked) {
                          // Add platform if checked
                          if (!currentPlatforms.includes(key as any)) {
                            field.onChange([...currentPlatforms, key]);
                          }
                        } else {
                          // Remove platform if unchecked
                          field.onChange(
                            currentPlatforms.filter((p) => p !== key),
                          );
                        }
                      }}
                    />
                  </FormControl>

                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <label
                          htmlFor={key}
                          className="text-sm font-medium text-gray-900 cursor-pointer"
                        >
                          {config.name}
                        </label>
                        {isSelected && (
                          <Badge variant="secondary" className="text-xs">
                            Enabled
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {config.description}
                      </p>
                    </div>
                  </div>

                  {!hasAvailableLicenses && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                      <div className="flex items-center space-x-1 text-amber-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-xs font-medium">
                          License Required
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <FormDescription>
            {!hasAvailableLicenses ? (
              <span className="text-amber-600">
                Select which platforms to enable for automation. A valid license
                is required to use platform features.
              </span>
            ) : (
              "Select which platforms to enable for automation. You can configure each platform's settings in the Platforms tab."
            )}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

