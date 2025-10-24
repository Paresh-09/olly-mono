import React, { useEffect, useState, useMemo } from "react";
import {
  Save,
  Hash,
  Users,
  AlertCircle,
  ThumbsUp,
  MessageSquare,
  Info,
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
import { Slider } from "@repo/ui/components/ui/slider";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { MAX_COMMENTS, MAX_LIKES } from "../utils";
import { useToast } from "@repo/ui/hooks/use-toast";import { Toaster } from "@repo/ui/components/ui/toaster";

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
  // New props for Reddit support
  isReddit?: boolean;
  placeholder?: string;
  label?: string;
}

export default function KeywordModal({
  open,
  onOpenChange,
  onSave,
  initialKeyword = null,
  isEditing,
  maxLikes = MAX_LIKES,
  maxComments = MAX_COMMENTS,
  isReddit = false,
  placeholder = "#sales",
  label = "Keyword/Hashtag",
}: KeywordModalProps) {
  const [keyword, setKeyword] = useState("");
  const [numLikes, setNumLikes] = useState(0);
  const [numComments, setNumComments] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  // Calculate effective max values using useMemo to prevent recalculation on every render
  const effectiveMaxLikes = useMemo(() => {
    return isEditing && initialKeyword
      ? maxLikes + initialKeyword.numLikes
      : maxLikes;
  }, [isEditing, initialKeyword, maxLikes]);

  const effectiveMaxComments = useMemo(() => {
    return isEditing && initialKeyword
      ? maxComments + initialKeyword.numComments
      : maxComments;
  }, [isEditing, initialKeyword, maxComments]);



  // Load initial values when modal opens
  useEffect(() => {
    if (open && initialKeyword) {
      console.log("Loading initial values:", initialKeyword);
      setKeyword(initialKeyword.keyword);
      setNumLikes(initialKeyword.numLikes);
      setNumComments(initialKeyword.numComments);
      setHasChanges(false);
    } else if (open && !initialKeyword) {
      // Default values for new keyword - ensure they don't exceed limits
      console.log("Setting default values for new keyword");
      if (isReddit) {
        setKeyword(""); // Start empty for subreddits
      } else {
        setKeyword(""); // Start empty for keywords, user can add # if desired
      }
      setNumLikes(Math.min(5, maxLikes));
      setNumComments(Math.min(3, maxComments));
      setHasChanges(false);
    }
  }, [open, initialKeyword, maxLikes, maxComments, isReddit]);

  // Check for changes to enable save button
  useEffect(() => {
    if (!open) return;

    if (initialKeyword) {
      // Check if values have changed from initial values
      const changed =
        keyword !== initialKeyword.keyword ||
        numLikes !== initialKeyword.numLikes ||
        numComments !== initialKeyword.numComments;
      setHasChanges(changed);
    } else {
      // For new keywords, check if required fields are filled
      setHasChanges(keyword.trim() !== "");
    }
  }, [keyword, numLikes, numComments, initialKeyword, open]);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (isReddit) {
      // For Reddit, remove any r/ prefix and forward slashes
      let cleanValue = value;
      if (cleanValue.startsWith("r/")) {
        cleanValue = cleanValue.substring(2);
      }
      cleanValue = cleanValue.replace(/\//g, "");
      setKeyword(cleanValue);
    } else {
      // For other platforms, do not force a hashtag, let user decide
      setKeyword(value);
    }
  };

  const handleNumLikesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    // Ensure value doesn't exceed the available limit
    setNumLikes(Math.min(value, effectiveMaxLikes));

    // Show toast if user tries to exceed limit
    if (value > effectiveMaxLikes) {
      toast({
        title: "Limit Exceeded",
        description: `You can only allocate ${effectiveMaxLikes} likes (out of ${MAX_LIKES} total)`,
        variant: "destructive",
      });
    }
  };

  const handleNumLikesSliderChange = (value: number[]) => {
    setNumLikes(value[0]);
  };

  const handleNumCommentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    // Ensure value doesn't exceed the available limit
    setNumComments(Math.min(value, effectiveMaxComments));

    // Show toast if user tries to exceed limit
    if (value > effectiveMaxComments) {
      toast({
        title: "Limit Exceeded",
        description: `You can only allocate ${effectiveMaxComments} comments (out of ${MAX_COMMENTS} total)`,
        variant: "destructive",
      });
    }
  };

  const handleNumCommentsSliderChange = (value: number[]) => {
    setNumComments(value[0]);
  };

  const handleSave = () => {
    // Validate
    if (!keyword.trim()) {
      toast({
        title: `Please enter a ${isReddit ? "subreddit" : "keyword"}`,
        variant: "destructive",
      });
      return;
    }

    // Validate against limits
    if (numLikes > effectiveMaxLikes) {
      toast({
        title: `You can only allocate ${effectiveMaxLikes} likes (out of ${MAX_LIKES} total)`,
        variant: "destructive",
      });
      return;
    }

    const trimmedKeyword = keyword.trim();

    if (isReddit) {
      // Reddit-specific validation
      if (!/^[a-zA-Z0-9_]+$/.test(trimmedKeyword)) {
        toast({
          title:
            "Subreddit name can only contain letters, numbers, and underscores",
          variant: "destructive",
        });
        return;
      }

      if (trimmedKeyword.length < 2) {
        toast({
          title: "Subreddit name must be at least 2 characters",
          variant: "destructive",
        });
        return;
      }

      if (trimmedKeyword.length > 21) {
        toast({
          title: "Subreddit name cannot exceed 21 characters",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Keyword-specific validation
      if (trimmedKeyword.includes(" ")) {
        toast({
          title:
            "Only single words are allowed. Please enter one word or hashtag.",
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
    }

    if (numComments > effectiveMaxComments) {
      toast({
        title: `You can only allocate ${effectiveMaxComments} comments (out of ${MAX_COMMENTS} total)`,
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
      title: `${isEditing ? "Updated" : "Added"} ${isReddit ? "subreddit" : "keyword"} "${keyword}"`,
      variant: "default",
    });
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

  // Check if we have any available interactions
  const hasAvailableInteractions = maxLikes > 0 || maxComments > 0;

  return (
    <Dialog open={open} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            {isReddit ? (
              <Users className="h-5 w-5 text-orange-600" />
            ) : (
              <Hash className="h-5 w-5 text-blue-600" />
            )}
            {isEditing ? "Edit" : "Add"} {isReddit ? "Subreddit" : "Keyword"}{" "}
            Target
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={handleCloseModal}>
            {/* <X className="h-4 w-4" /> */}
          </Button>
        </DialogHeader>

        <DialogDescription>
          {isReddit
            ? `Configure targeting for a specific Reddit community. Enter the subreddit name without the 'r/' prefix.`
            : `Specify a hashtag or keyword for the automation to target, sharing the same limit of ${MAX_LIKES} likes and ${MAX_COMMENTS} comments with feed interactions.`}
        </DialogDescription>

        {!hasAvailableInteractions && !isEditing && (
          <Alert className="mt-2 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              You've reached the maximum limit of {MAX_LIKES} likes and{" "}
              {MAX_COMMENTS} comments. Reduce interactions in feed or other
              {isReddit ? " subreddits" : " keywords"} before adding more.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="keyword" className="text-sm">
              {label}
            </Label>
            {isReddit ? (
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
                  r/
                </div>
                <Input
                  id="keyword"
                  placeholder={placeholder}
                  value={keyword}
                  onChange={handleKeywordChange}
                  className="pl-8 h-9"
                  maxLength={21}
                />
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Hash className="h-4 w-4" />
                </div>
                <Input
                  id="keyword"
                  placeholder={placeholder}
                  value={keyword}
                  onChange={handleKeywordChange}
                  className="pl-9 h-9"
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {isReddit
                ? "Examples: technology, programming, AskReddit, datascience"
                : "Add # before words to target hashtags (e.g., #sales)"}
            </p>
          </div>

          {/* Engagement allocation section with badges */}
          <div className="flex justify-between items-center border-t border-b py-2 my-2">
            <div className="flex items-center">
              <span className="text-sm font-medium">Engagement Allocation</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-400 ml-1 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      All {isReddit ? "subreddits" : "keywords"} and feed
                      interactions share the same total limit of {MAX_LIKES}{" "}
                      likes and {MAX_COMMENTS} comments.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex space-x-2">
              <Badge
                variant="outline"
                className="text-xs bg-blue-50 border-blue-200 text-blue-700"
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                <span>{numLikes}</span>
              </Badge>
              <Badge
                variant="outline"
                className="text-xs bg-green-50 border-green-200 text-green-700"
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                <span>{numComments}</span>
              </Badge>
            </div>
          </div>

          {/* Preview */}
          {keyword && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium mb-1">Preview:</p>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                {isReddit ? (
                  <Users className="h-4 w-4" />
                ) : (
                  <Hash className="h-4 w-4" />
                )}
                <span className="font-medium">
                  {isReddit ? `r/${keyword}` : keyword}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3 text-blue-500" />
                  {numLikes}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3 text-green-500" />
                  {numComments}
                </span>
              </div>
            </div>
          )}

          {/* Likes slider and input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="numLikes" className="text-sm flex items-center">
                <ThumbsUp className="h-4 w-4 text-blue-500 mr-1.5" />
                Number of Likes
              </Label>
            </div>

            <span className="text-xs text-gray-500">
              {isEditing && initialKeyword ? (
                <>
                  Max: {effectiveMaxLikes} available (currently using{" "}
                  {initialKeyword.numLikes})
                </>
              ) : (
                <>
                  Max: {effectiveMaxLikes} of {MAX_LIKES} total
                </>
              )}
            </span>

            {effectiveMaxLikes === 0 ? (
              <div className="bg-red-50 text-red-600 text-xs p-2 rounded-md flex items-center">
                <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                No likes available. Reduce likes from feed or other{" "}
                {isReddit ? "subreddits" : "keywords"}.
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Slider
                  id="likesSlider"
                  value={[numLikes]}
                  min={0}
                  max={effectiveMaxLikes}
                  step={1}
                  className="flex-1"
                  onValueChange={handleNumLikesSliderChange}
                  disabled={effectiveMaxLikes === 0}
                />
                <Input
                  id="numLikes"
                  type="number"
                  min="0"
                  max={effectiveMaxLikes}
                  value={numLikes}
                  onChange={handleNumLikesChange}
                  className="w-16 h-8"
                  disabled={effectiveMaxLikes === 0}
                />
              </div>
            )}
          </div>

          {/* Comments slider and input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label
                htmlFor="numComments"
                className="text-sm flex items-center"
              >
                <MessageSquare className="h-4 w-4 text-green-500 mr-1.5" />
                Number of Comments
              </Label>
              <span className="text-xs text-gray-500">
                Max: {effectiveMaxComments} of {MAX_COMMENTS} total
              </span>
            </div>

            {effectiveMaxComments === 0 ? (
              <div className="bg-red-50 text-red-600 text-xs p-2 rounded-md flex items-center">
                <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                No comments available. Reduce comments from feed or other
                {isReddit ? " subreddits" : " keywords"}.
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Slider
                  id="commentsSlider"
                  value={[numComments]}
                  min={0}
                  max={effectiveMaxComments}
                  step={1}
                  className="flex-1"
                  onValueChange={handleNumCommentsSliderChange}
                  disabled={effectiveMaxComments === 0}
                />
                <Input
                  id="numComments"
                  type="number"
                  min="0"
                  max={effectiveMaxComments}
                  value={numComments}
                  onChange={handleNumCommentsChange}
                  className="w-16 h-8"
                  disabled={effectiveMaxComments === 0}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between mt-4">
          <div className="text-xs text-muted-foreground flex items-center">
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
            {isEditing ? "Update" : "Add"} {isReddit ? "Subreddit" : "Keyword"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
