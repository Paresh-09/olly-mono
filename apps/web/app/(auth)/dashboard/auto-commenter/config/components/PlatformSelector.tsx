import React from "react";
import { Control } from "react-hook-form";
import { FormValues } from "../page";
import {
  FormField,
  FormItem,
  FormMessage,
} from "@repo/ui/components/ui/form";
import { CheckCircle2, AlertCircle } from "lucide-react";
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(PLATFORM_CONFIG).map(([key, config]) => {
              const IconComponent = config.icon;
              const isSelected = field.value?.includes(key as any) || false;
              const isDisabled = !hasAvailableLicenses;

              return (
                <div
                  key={key}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (isDisabled) return;
                    const current = field.value || [];
                    const updated = isSelected
                      ? current.filter((p) => p !== key)
                      : [...current, key];
                    field.onChange(updated);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (isDisabled) return;
                      const current = field.value || [];
                      const updated = isSelected
                        ? current.filter((p) => p !== key)
                        : [...current, key];
                      field.onChange(updated);
                    }
                  }}
                  className={`
                    relative flex items-center justify-center p-4 rounded-lg border transition-all
                    ${isSelected ? "bg-green-100 border-green-500" : "bg-white border-gray-300 hover:bg-gray-100"}
                    ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-sm"}
                  `}
                >
                  {/* Icon */}
                  <IconComponent
                    className={`
                      h-6 w-6 transition-colors
                      ${isSelected ? "text-green-600" : "text-gray-500 group-hover:text-black"}
                    `}
                  />

                  {/* Checkmark overlay */}
                  {isSelected && (
                    <CheckCircle2 className="absolute top-1 right-1 h-4 w-4 text-green-600" />
                  )}

                  {/* Disabled overlay */}
                  {!hasAvailableLicenses && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
