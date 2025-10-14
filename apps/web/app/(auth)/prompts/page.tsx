// app/prompts/page.tsx
"use client"

import { Prompt } from "@repo/db";
import axios from "axios";
import { useState, useEffect } from "react";
import { PromptSearch } from "./_components/prompt-search";
import { PromptPopover } from "./_components/prompt-popover";
import { useToast } from "@repo/ui/hooks/use-toast";import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@repo/ui/components/ui/alert-dialog";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { ChevronUp, ChevronDown, Copy, Lock } from "lucide-react";

interface ExtendedPrompt extends Prompt {
  isUnlocked?: boolean;
  hasUpvoted?: boolean;
}

const PromptsPage = () => {
  const [prompts, setPrompts] = useState<ExtendedPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<ExtendedPrompt | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUnlockError, setShowUnlockError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/prompts/search?search=${searchTerm}`);
        setPrompts(response.data);
      } catch (error) {
        console.error("Error fetching prompts:", error);
        toast({
          title: "Error",
          description: "Failed to fetch prompts",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrompts();
  }, [searchTerm]);

  const handleUpvote = async (promptId: string) => {
    try {
      const prompt = prompts.find(p => p.id === promptId);
      if (!prompt) return;

      if (prompt.hasUpvoted) {
        // Remove upvote
        await axios.post(`/api/prompts/${promptId}/downvote`);
        toast({
          title: "Success",
          description: "Removed upvote",
        });
      } else {
        // Add upvote
        await axios.post(`/api/prompts/${promptId}/upvote`);
        toast({
          title: "Success",
          description: "Upvoted prompt",
        });
      }
      
      // Refresh prompts
      const response = await axios.get(`/api/prompts/search?search=${searchTerm}`);
      setPrompts(response.data);
    } catch (error: any) {
      console.error("Error toggling upvote:", error);
      toast({
        title: "Error",
        description: error.response?.data || "Failed to toggle upvote",
        variant: "destructive",
      });
    }
  };

  const handleUnlock = async (promptId: string) => {
    try {
      await axios.post(`/api/prompts/${promptId}/unlock`);
      toast({
        title: "Success",
        description: "Prompt unlocked successfully",
      });
      // Update local state to reflect unlocked status
      setPrompts(prevPrompts => 
        prevPrompts.map(prompt => 
          prompt.id === promptId 
            ? { ...prompt, isUnlocked: true }
            : prompt
        )
      );
      // Close the popover after successful unlock
      setSelectedPrompt(null);
    } catch (error: any) {
      console.error("Error unlocking prompt:", error);
      if (error.response?.status === 400) {
        setShowUnlockError(true);
      } else {
        toast({
          title: "Error",
          description: error.response?.data || "Failed to unlock prompt",
          variant: "destructive",
        });
      }
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Success",
      description: "Prompt copied to clipboard",
    });
  };

  const handleSelectPrompt = (prompt: ExtendedPrompt) => {
    setSelectedPrompt(prompt);
  };

  const handleClosePopover = () => {
    setSelectedPrompt(null);
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-medium">Prompt Templates</h2>
        <div className="w-full sm:w-[300px]">
          <PromptSearch onSearch={(term) => setSearchTerm(term)} />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted/50 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : prompts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            No prompts found. Check back soon for more templates!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              className="group flex items-start justify-between p-3 rounded-lg bg-white border border-border hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => handleSelectPrompt(prompt)}
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium truncate">
                    {prompt.title || "Untitled"}
                  </h3>
                  {prompt.isPremium && (
                    <Badge variant="outline" className="text-xs font-normal py-0.5 border-blue-200 bg-blue-50">
                      Premium
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {prompt.isPremium && !prompt.isUnlocked
                    ? "Premium prompt - Click to unlock"
                    : prompt.text}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="font-normal">
                    {prompt.category}
                  </Badge>
                  <span>•</span>
                  <span>
                    {prompt.contributor
                      ? `By ${prompt.contributor}`
                      : "By Olly Team"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpvote(prompt.id);
                  }}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(prompt.text);
                    }}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
                {prompt.isPremium && !prompt.isUnlocked && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnlock(prompt.id);
                    }}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Lock className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <PromptPopover
        prompt={selectedPrompt}
        onUpvote={handleUpvote}
        onCopy={handleCopy}
        onClose={handleClosePopover}
        onUnlock={handleUnlock}
      />

      <AlertDialog open={showUnlockError} onOpenChange={setShowUnlockError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Insufficient Credits</AlertDialogTitle>
            <AlertDialogDescription>
              You don&apos;t have enough credits to unlock this premium prompt. 
              Please purchase more credits to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PromptsPage;