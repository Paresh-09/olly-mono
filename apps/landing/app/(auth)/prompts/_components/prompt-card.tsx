"use client";

import { Button } from "@repo/ui/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Copy } from "lucide-react";
import { Prompt } from "@repo/db";
import { Badge } from "@repo/ui/components/ui/badge";
import { useState } from "react";

interface ExtendedPrompt extends Prompt {
  isUnlocked?: boolean;
  hasUpvoted?: boolean;
}

interface PromptCardProps {
  prompt: ExtendedPrompt;
  onUpvote: (promptId: string) => void;
  onCopy: (text: string) => void;
  onSelect: (prompt: ExtendedPrompt) => void;
  onUnlock: (promptId: string) => Promise<void>;
}

export const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  onUpvote,
  onCopy,
  onSelect,
  onUnlock,
}) => {
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleUnlock = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUnlocking(true);
    try {
      await onUnlock(prompt.id);
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <Card
      className="border border-gray-200 shadow-md cursor-pointer"
      onClick={() => onSelect(prompt)}
    >
      <CardHeader>
        <CardTitle className="text-l font-semibold text-gray-800">
          {prompt.title || " "}
          {prompt.isPremium && (
            <Badge variant="default" className="ml-2">
              Premium
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="mt-1 text-s text-gray-700">
        {prompt.isPremium && !prompt.isUnlocked ? (
          <div className="text-center">
            <p>Premium prompt - {prompt.creditCost} credits to unlock</p>
            <Button
              onClick={handleUnlock}
              disabled={isUnlocking}
              className="mt-2"
            >
              {isUnlocking ? "Unlocking..." : "Unlock"}
            </Button>
          </div>
        ) : (
          prompt.text.length > 200
            ? `${prompt.text.slice(0, 200)}...`
            : prompt.text
        )}
      </CardContent>
      <CardFooter className="mt-1">
        <div className="flex items-center justify-between w-full">
          <p className="text-sm text-gray-500">
            Contributed by{" "}
            {prompt.contributor
              ? prompt.contributor.length > 50
                ? `${prompt.contributor.slice(0, 50)}...`
                : prompt.contributor
              : "Olly Team"}
          </p>
          <div className="flex items-center space-x-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onUpvote(prompt.id);
              }}
              variant="ghost"
              size="sm"
              className={`h-8 px-2 flex items-center gap-1 text-gray-500 hover:text-gray-700 ${prompt.hasUpvoted ? 'text-blue-600 bg-blue-50' : ''}`}
            >
              {prompt.hasUpvoted ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
              <span className="text-sm">{prompt.upvotes}</span>
            </Button>
            {(!prompt.isPremium || prompt.isUnlocked) && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy(prompt.text);
                }}
                variant="ghost"
                className="text-gray-500 hover:text-gray-700"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};