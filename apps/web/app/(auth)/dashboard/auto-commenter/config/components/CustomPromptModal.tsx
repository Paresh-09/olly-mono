import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Label } from "@repo/ui/components/ui/label";
import { Save, X } from "lucide-react";

interface PromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (prompt: { id: string; title: string; text: string }) => void;
  initialPrompt?: { id: string; title: string; text: string } | null;
  isEditing: boolean;
  platform?: string;
}

const PromptModal: React.FC<PromptModalProps> = ({
  open,
  onOpenChange,
  onSave,
  initialPrompt,
  isEditing,
  platform = "",
}) => {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<{ title?: string; text?: string }>({});

  // Reset form when modal opens/closes or initialPrompt changes
  useEffect(() => {
    if (open) {
      if (initialPrompt) {
        setTitle(initialPrompt.title);
        setText(initialPrompt.text);
      } else {
        setTitle("");
        setText("");
      }
      setErrors({});
    }
  }, [open, initialPrompt]);

  const validateForm = () => {
    const newErrors: { title?: string; text?: string } = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!text.trim()) {
      newErrors.text = "Prompt text is required";
    } else if (text.trim().length < 10) {
      newErrors.text = "Prompt must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const promptId = initialPrompt?.id || `prompt-${Date.now()}`;
    
    onSave({
      id: promptId,
      title: title.trim(),
      text: text.trim(),
    });

    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit" : "Create"} Custom Prompt
            {platform && ` for ${platform}`}
          </DialogTitle>
          <DialogDescription>
            Create a custom prompt that will be used to generate automated comments
            {platform && ` on ${platform}`}. Make sure it's specific and relevant to your engagement goals.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="prompt-title">Prompt Title</Label>
            <Input
              id="prompt-title"
              placeholder="Enter a descriptive title for your prompt"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt-text">Prompt Instructions</Label>
            <Textarea
              id="prompt-text"
              placeholder={`Enter your custom prompt instructions${platform ? ` for ${platform}` : ""}...`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={`min-h-[120px] resize-none ${errors.text ? "border-red-500" : ""}`}
              rows={6}
            />
            {errors.text && (
              <p className="text-sm text-red-500">{errors.text}</p>
            )}
            <p className="text-sm text-gray-500">
              Character count: {text.length} (minimum 10 required)
            </p>
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Tips for effective prompts:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Be specific about the tone and style you want</li>
              <li>• Include instructions for engagement goals</li>
              <li>• Mention your expertise or industry if relevant</li>
              <li>• Keep it concise but comprehensive</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="mr-2"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!title.trim() || !text.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? "Update" : "Create"} Prompt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PromptModal;