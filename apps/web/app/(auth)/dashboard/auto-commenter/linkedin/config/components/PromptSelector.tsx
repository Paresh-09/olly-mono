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
  defaultPrompts: any[];
}

const PromptSelector: React.FC<PromptSelectorProps> = ({
  control,
  register,
  setValue,
  getValues,
  watch,
  defaultPrompts,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const promptMode = watch("promptMode");
  const customPrompts = watch("customPrompts") || [];

  // Always use the first prompt in the array
  const customPrompt = customPrompts.length > 0 ? customPrompts[0] : null;

  // Function to handle saving the custom prompt
  const handleSavePrompt = (prompt: {
    id: string;
    title: string;
    text: string;
  }) => {
    // Replace the entire array with just this one prompt
    setValue("customPrompts", [prompt]);

    // Also set the selectedCustomPromptId to this prompt's ID
    setValue("selectedCustomPromptId", prompt.id);
  };

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="promptMode"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>AI Prompt Selection</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="automatic" id="r1" />
                  <Label htmlFor="r1">Use Best AI Prompts (Automatic)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="r2" />
                  <Label htmlFor="r2">Use Custom Prompt</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {promptMode === "custom" && (
        <div className="space-y-4 border rounded-md p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-medium">Custom Prompt</h3>
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
              <p className="text-sm text-gray-500">No custom prompt set</p>
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
      />
    </div>
  );
};

export default PromptSelector;
