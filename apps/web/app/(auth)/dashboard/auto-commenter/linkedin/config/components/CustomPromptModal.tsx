"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { X, Save, AlertCircle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";

interface PromptData {
  id: string;
  title: string;
  text: string;
}

interface PromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (prompt: PromptData) => void;
  initialPrompt: PromptData | null;
  isEditing: boolean;
}

export default function PromptModal({
  open,
  onOpenChange,
  onSave,
  initialPrompt,
  isEditing,
}: PromptModalProps) {
  const [promptTitle, setPromptTitle] = useState("");
  const [promptText, setPromptText] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Reset form when modal opens with new data
  useEffect(() => {
    if (open) {
      if (initialPrompt && isEditing) {
        setPromptTitle(initialPrompt.title);
        setPromptText(initialPrompt.text);
      } else {
        // Clear for new prompt
        setPromptTitle("");
        setPromptText("");
      }
      setHasChanges(false);
    }
  }, [open, initialPrompt, isEditing]);

  // Check for changes to enable save button
  useEffect(() => {
    if (!open) return;

    if (initialPrompt) {
      // Check if values have changed from initial values
      const changed =
        promptTitle !== initialPrompt.title ||
        promptText !== initialPrompt.text;
      setHasChanges(changed);
    } else {
      // For new prompts, check if required fields are filled
      setHasChanges(
        promptTitle.trim() !== "" && promptText.trim().length >= 10,
      );
    }
  }, [promptTitle, promptText, initialPrompt, open]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPromptTitle(e.target.value);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptText(e.target.value);
  };

  const handleSave = () => {
    // Validate
    if (!promptTitle.trim()) {
      toast.error("Please enter a title for your prompt");
      return;
    }

    if (!promptText.trim()) {
      toast.error("Please enter prompt text");
      return;
    }

    if (promptText.trim().length < 10) {
      toast.error("Prompt text must be at least 10 characters");
      return;
    }

    // Save the prompt
    onSave({
      id: initialPrompt?.id || uuidv4(),
      title: promptTitle.trim(),
      text: promptText.trim(),
    });

    toast.success(`${isEditing ? "Updated" : "Set"} custom prompt`);

    // Close the modal
    onOpenChange(false);
  };

  // Check for unsaved changes when closing modal
  const handleCloseModal = () => {
    if (hasChanges) {
      if (window.confirm("You have unsaved changes. Save before closing?")) {
        handleSave();
      }
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>
            {isEditing ? "Edit Custom Prompt" : "Create Custom Prompt"}
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={handleCloseModal}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <DialogDescription>
          Create a custom prompt to guide AI-generated responses for LinkedIn
          interactions.
        </DialogDescription>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="prompt-title" className="text-sm">
              Title
            </Label>
            <Input
              id="prompt-title"
              placeholder="Enter a descriptive title"
              value={promptTitle}
              onChange={handleTitleChange}
              className="h-9"
            />
            <p className="text-xs text-muted-foreground">
              A concise name to identify this prompt
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt-text" className="text-sm">
              Prompt Text
            </Label>
            <Textarea
              id="prompt-text"
              placeholder="Enter detailed instructions for the AI..."
              value={promptText}
              onChange={handleTextChange}
              className="min-h-[150px] resize-y"
            />
            <div className="flex justify-between">
              <p className="text-xs text-muted-foreground">
                Minimum 10 characters
              </p>
              <span
                className={`text-xs ${
                  promptText.length < 10
                    ? "text-red-500"
                    : "text-muted-foreground"
                }`}
              >
                {promptText.length} characters
              </span>
            </div>

            {promptText.length > 0 && promptText.length < 10 && (
              <Alert className="py-2 border-amber-200 bg-amber-50">
                <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                <AlertDescription className="text-xs text-amber-700 ml-2">
                  Prompt must be at least 10 characters
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-md p-3 mt-2">
            <h4 className="text-sm font-medium mb-1.5">Writing Tips:</h4>
            <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
              <li>Be specific about the tone and style you want</li>
              <li>
                Define the role the AI should take (expert, colleague, etc.)
              </li>
              <li>Mention specific industry terminology to include</li>
              <li>Specify how to handle questions or objections</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-end space-x-2">
          <Button type="button" variant="outline" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className={`gap-2 ${hasChanges ? "bg-blue-600 hover:bg-blue-700" : ""}`}
            disabled={
              !hasChanges ||
              !promptTitle.trim() ||
              promptText.trim().length < 10
            }
          >
            <Save className="h-4 w-4" />
            {isEditing ? "Update" : "Save"} Prompt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
