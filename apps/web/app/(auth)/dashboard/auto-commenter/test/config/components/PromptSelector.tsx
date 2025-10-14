"use client";
import React, { useState } from "react";
import {
  Control,
  UseFormRegister,
  UseFormGetValues,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
import { Label } from "@repo/ui/components/ui/label";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { PencilLine } from "lucide-react";
import { FormValues } from "../page";
import PromptModal from "./CustomPromptModal";

interface PromptSelectorProps {
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  getValues: UseFormGetValues<FormValues>;
  watch: UseFormWatch<FormValues>;
  platform: string; // Add platform prop
  defaultPrompts: any[];
}

const PromptSelector: React.FC<PromptSelectorProps> = ({
  control,
  register,
  setValue,
  getValues,
  watch,
  platform, // Add platform prop
  defaultPrompts,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get platform-specific prompt data
  const getCurrentPlatformPrompts = () => {
    if (platform === "LINKEDIN") {
      const promptMode = watch("linkedinPromptMode") || "automatic";
      const customPrompts = watch("linkedinCustomPrompts") || [];
      return { promptMode, customPrompts };
    } else {
      const platformSettings = watch("platformSettings") || {};
      const settings = platformSettings[platform] || {};
      return {
        promptMode: settings.promptMode || "automatic",
        customPrompts: settings.customPrompts || [],
      };
    }
  };

  const updatePlatformPrompts = (promptMode: string, customPrompts: any[]) => {
    if (platform === "LINKEDIN") {
      setValue("linkedinPromptMode", promptMode as any);
      setValue("linkedinCustomPrompts", customPrompts);
      if (customPrompts.length > 0) {
        setValue("linkedinSelectedCustomPromptId", customPrompts[0].id);
      }
    } else {
      const currentPlatformSettings = getValues("platformSettings") || {};
      const currentSettings = currentPlatformSettings[platform] || {};
      
      setValue("platformSettings", {
        ...currentPlatformSettings,
        [platform]: {
          ...currentSettings,
          promptMode: promptMode as any,
          customPrompts,
          selectedCustomPromptId: customPrompts.length > 0 ? customPrompts[0].id : "",
        },
      });
    }
  };

  const { promptMode, customPrompts } = getCurrentPlatformPrompts();
  const customPrompt = customPrompts.length > 0 ? customPrompts[0] : null;

  const handleSavePrompt = (prompt: { id: string; title: string; text: string }) => {
    updatePlatformPrompts(promptMode, [prompt]);
  };

  const handlePromptModeChange = (newMode: string) => {
    updatePlatformPrompts(newMode, customPrompts);
  };

  return (
    <div className="space-y-4">
      <FormItem className="space-y-3">
        <FormLabel>AI Prompt Selection for {platform}</FormLabel>
        <FormControl>
          <RadioGroup
            onValueChange={handlePromptModeChange}
            value={promptMode}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="automatic" id={`${platform}-r1`} />
              <Label htmlFor={`${platform}-r1`}>Use Best AI Prompts (Automatic)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id={`${platform}-r2`} />
              <Label htmlFor={`${platform}-r2`}>Use Custom Prompt</Label>
            </div>
          </RadioGroup>
        </FormControl>
        <FormMessage />
      </FormItem>

      {promptMode === "custom" && (
        <div className="space-y-4 border rounded-md p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Custom Prompt for {platform}</h4>
          </div>

          {customPrompt ? (
            <Card className="border border-blue-500 ring-1 ring-blue-500">
              <CardContent className="p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">
                      {customPrompt.title}
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                      {customPrompt.text}
                    </p>
                  </div>
                  <div className="flex ml-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7"
                      onClick={() => setIsModalOpen(true)}
                    >
                      <PencilLine className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-6 border rounded-md bg-gray-100">
              <p className="text-sm text-gray-500">No custom prompt set for {platform}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setIsModalOpen(true)}
              >
                Create Custom Prompt
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Prompt Modal */}
      <PromptModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSavePrompt}
        initialPrompt={customPrompt}
        isEditing={!!customPrompt}
        platform={platform}
      />
    </div>
  );
};

export default PromptSelector;