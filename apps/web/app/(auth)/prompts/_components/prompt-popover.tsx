// app/prompts/_components/prompt-popover.tsx
import { Button } from "@repo/ui/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/components/ui/dialog";
import { Prompt } from "@repo/db";
import { ChevronUp, ChevronDown, Copy, Lock } from "lucide-react";
import { Portal } from "@radix-ui/react-portal";
import { useEffect, useState } from "react";
import { Badge } from "@repo/ui/components/ui/badge";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";

interface ExtendedPrompt extends Prompt {
  isUnlocked?: boolean;
  hasUpvoted?: boolean;
}

interface PromptPopoverProps {
  prompt: ExtendedPrompt | null;
  onUpvote: (promptId: string) => void;
  onCopy: (text: string) => void;
  onClose: () => void;
  onUnlock: (promptId: string) => Promise<void>;
}

export const PromptPopover: React.FC<PromptPopoverProps> = ({
  prompt,
  onUpvote,
  onCopy,
  onClose,
  onUnlock,
}) => {
  const [isUnlocking, setIsUnlocking] = useState(false);

  if (!prompt) return null;

  const handleUnlock = async () => {
    setIsUnlocking(true);
    try {
      await onUnlock(prompt.id);
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <Portal>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-medium">
                {prompt.title || "Untitled"}
              </DialogTitle>
              <div className="flex items-center gap-2">
                {prompt.isPremium && (
                  <Badge variant="outline" className="text-xs font-normal py-0.5 border-blue-200 bg-blue-50">
                    Premium
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs font-normal">
                  {prompt.category}
                </Badge>
              </div>
            </div>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <div className="px-6 py-4 space-y-4">
              {prompt.isPremium && !prompt.isUnlocked ? (
                <div className="text-center py-8">
                  <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    This is a premium prompt that requires {prompt.creditCost} credits to unlock
                  </p>
                  <Button
                    onClick={handleUnlock}
                    disabled={isUnlocking}
                    className="w-full"
                  >
                    {isUnlocking ? "Unlocking..." : `Unlock for ${prompt.creditCost} credits`}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {prompt.text}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {prompt.contributor
                          ? `Contributed by ${prompt.contributor}`
                          : "Contributed by Olly Team"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => onUpvote(prompt.id)}
                        variant="ghost"
                        size="sm"
                        className={`h-8 px-2 flex items-center gap-1 ${prompt.hasUpvoted ? 'text-blue-600 bg-blue-50' : ''}`}
                      >
                        {prompt.hasUpvoted ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronUp className="h-4 w-4" />
                        )}
                        <span className="text-xs">{prompt.upvotes}</span>
                      </Button>
                      {(!prompt.isPremium || prompt.isUnlocked) && (
                        <Button
                          onClick={() => onCopy(prompt.text)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </Portal>
  );
};