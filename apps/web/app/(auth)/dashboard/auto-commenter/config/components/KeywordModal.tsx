import React, { useEffect, useState } from "react";
import {
  Save,
  Hash,
  AlertCircle,
  ThumbsUp,
  MessageSquare,
  Info,
  Plus,
  Minus,
} from "lucide-react";
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
import { Label } from "@repo/ui/components/ui/label";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { MAX_COMMENTS, MAX_LIKES } from "../utils";
import { useToast } from "@repo/ui/hooks/use-toast";
interface KeywordTarget {
  keyword: string;
  numLikes: number;
  numComments: number;
}

interface KeywordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (keyword: KeywordTarget) => void;
  initialKeyword?: KeywordTarget | null;
  isEditing: boolean;
  maxLikes?: number;
  maxComments?: number;
}

export default function KeywordModal({
  open,
  onOpenChange,
  onSave,
  initialKeyword = null,
  isEditing,
  maxLikes = MAX_LIKES,
  maxComments = MAX_COMMENTS,
}: KeywordModalProps) {
  const [keyword, setKeyword] = useState("");
  const [numLikes, setNumLikes] = useState(0);
  const [numComments, setNumComments] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  const effectiveMaxLikes = maxLikes;
  const effectiveMaxComments = maxComments;

  // Load initial values when modal opens
  useEffect(() => {
    if (open && initialKeyword) {
      console.log("Loading initial values:", initialKeyword);
      setKeyword(initialKeyword.keyword);
      setNumLikes(initialKeyword.numLikes);
      setNumComments(initialKeyword.numComments);
      setHasChanges(false);
    } else if (open && !initialKeyword) {
      console.log("Setting default values for new keyword");
      setKeyword("");
      setNumLikes(Math.min(5, effectiveMaxLikes));
      setNumComments(Math.min(3, effectiveMaxComments));
      setHasChanges(false);
    }
  }, [open, initialKeyword, effectiveMaxLikes, effectiveMaxComments]);

  // Check for changes to enable save button
  useEffect(() => {
    if (!open) return;

    if (initialKeyword) {
      const changed =
        keyword !== initialKeyword.keyword ||
        numLikes !== initialKeyword.numLikes ||
        numComments !== initialKeyword.numComments;
      setHasChanges(changed);
    } else {
      setHasChanges(keyword.trim() !== "");
    }
  }, [keyword, numLikes, numComments, initialKeyword, open]);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value.startsWith("#") && value.length > 0) {
      setKeyword("#" + value.replace(/^#+/, ""));
    } else {
      setKeyword(value);
    }
  };

  const adjustLikes = (increment: boolean) => {
    const newValue = increment ? numLikes + 1 : numLikes - 1;
    const clampedValue = Math.max(0, Math.min(newValue, effectiveMaxLikes));

    if (newValue > effectiveMaxLikes) {
      toast({
        title: "Limit Exceeded",
        description: `You can only allocate ${effectiveMaxLikes} likes (remaining from ${MAX_LIKES} total)`,
        variant: "destructive",
      });
      return;
    }

    setNumLikes(clampedValue);
  };

  const adjustComments = (increment: boolean) => {
    const newValue = increment ? numComments + 1 : numComments - 1;
    const clampedValue = Math.max(0, Math.min(newValue, effectiveMaxComments));

    if (newValue > effectiveMaxComments) {
      toast({
        title: "Limit Exceeded",
        description: `You can only allocate ${effectiveMaxComments} comments (remaining from ${MAX_COMMENTS} total)`,
        variant: "destructive",
      });
      return;
    }

    setNumComments(clampedValue);
  };

  const handleSave = () => {
    if (!keyword.trim()) {
      toast({
        title: "Please enter a keyword",
        variant: "destructive",
      });
      return;
    }

    if (numLikes > effectiveMaxLikes) {
      toast({
        title: `You can only allocate ${effectiveMaxLikes} likes (remaining from ${MAX_LIKES} total)`,
        variant: "destructive",
      });
      return;
    }

    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword.includes(" ")) {
      toast({
        title: "Only single words are allowed. Please enter one word or hashtag.",
        variant: "destructive",
      });
      return;
    }

    if (trimmedKeyword === "#") {
      toast({
        title: "Keyword cannot be just a hashtag. Please add text after #.",
        variant: "destructive",
      });
      return;
    }

    if (numComments > effectiveMaxComments) {
      toast({
        title: `You can only allocate ${effectiveMaxComments} comments (remaining from ${MAX_COMMENTS} total)`,
        variant: "destructive",
      });
      return;
    }

    onSave({
      keyword: keyword.trim(),
      numLikes,
      numComments,
    });

    toast({
      title: `${isEditing ? "Updated" : "Added"} keyword "${keyword}"`,
      variant: "default",
    });
    onOpenChange(false);
  };

  const handleCloseModal = () => {
    if (hasChanges) {
      if (window.confirm("You have unsaved changes. Save before closing?")) {
        handleSave();
      }
    }
    onOpenChange(false);
  };

  const hasAvailableInteractions = maxLikes > 0 || maxComments > 0;

  return (
    <Dialog open={open} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-blue-600" />
            {isEditing ? "Edit" : "Add"} Keyword Target
          </DialogTitle>
          <DialogDescription>
            Specify a hashtag or keyword for the automation to target, sharing the
            same limit of {MAX_LIKES} likes and {MAX_COMMENTS} comments with feed
            interactions.
          </DialogDescription>
        </DialogHeader>

        {!hasAvailableInteractions && !isEditing && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              You've reached the maximum limit of {MAX_LIKES} likes and{" "}
              {MAX_COMMENTS} comments. Reduce interactions in feed or other
              keywords before adding more.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Keyword Input Section */}
          <div className="space-y-3">
            <Label htmlFor="keyword" className="text-sm font-medium">
              Keyword or Hashtag
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Hash className="h-4 w-4" />
              </div>
              <Input
                id="keyword"
                placeholder="sales"
                value={keyword}
                onChange={handleKeywordChange}
                className="pl-9 h-11 text-base"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Add # before words to target hashtags (e.g., #sales)
            </p>
          </div>

          {/* Engagement Cards Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-2">
                Engagement Allocation
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        All keywords and feed interactions share the same total
                        limit of {MAX_LIKES} likes and {MAX_COMMENTS} comments.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  {MAX_LIKES - maxLikes} / {MAX_LIKES} used
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Likes Card */}
              <div className={`
                relative flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all
                ${effectiveMaxLikes === 0
                  ? "bg-red-50 border-red-200 opacity-50"
                  : "bg-blue-50 border-blue-200 hover:border-blue-300"
                }
              `}>
                <div className="flex items-center gap-2 mb-3">
                  <ThumbsUp className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Likes</span>
                </div>

                {effectiveMaxLikes === 0 ? (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 mb-1">0</div>
                    <div className="text-xs text-red-600">No likes available</div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => adjustLikes(false)}
                        disabled={numLikes === 0}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="text-2xl font-bold text-blue-900 min-w-[3rem] text-center">
                        {numLikes}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => adjustLikes(true)}
                        disabled={numLikes >= effectiveMaxLikes}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-blue-600 text-center">
                      Max: {effectiveMaxLikes} available
                    </div>
                  </>
                )}
              </div>

              {/* Comments Card */}
              <div className={`
                relative flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all
                ${effectiveMaxComments === 0
                  ? "bg-red-50 border-red-200 opacity-50"
                  : "bg-green-50 border-green-200 hover:border-green-300"
                }
              `}>
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">Comments</span>
                </div>

                {effectiveMaxComments === 0 ? (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 mb-1">0</div>
                    <div className="text-xs text-red-600">No comments available</div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => adjustComments(false)}
                        disabled={numComments === 0}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="text-2xl font-bold text-green-900 min-w-[3rem] text-center">
                        {numComments}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => adjustComments(true)}
                        disabled={numComments >= effectiveMaxComments}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-green-600 text-center">
                      Max: {effectiveMaxComments} available
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between pt-6 border-t">
          <div className="text-xs text-muted-foreground">
            <span>
              Overall maximum: {MAX_LIKES} likes, {MAX_COMMENTS} comments
            </span>
          </div>
          <Button
            onClick={handleSave}
            className={`gap-2 ${hasChanges ? "bg-blue-600 hover:bg-blue-700" : ""}`}
            disabled={
              !hasChanges ||
              !keyword.trim() ||
              (!hasAvailableInteractions && !isEditing)
            }
          >
            <Save className="h-4 w-4" />
            {isEditing ? "Update" : "Add"} Keyword
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}