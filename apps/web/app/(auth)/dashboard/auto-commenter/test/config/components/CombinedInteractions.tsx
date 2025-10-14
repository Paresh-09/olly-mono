import React, { useState } from "react";
import {
  Control,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { FormValues } from "../page";
import { MAX_LIKES, MAX_COMMENTS } from "../utils";
import {
  AlertCircle,
  Info,
  ThumbsUp,
  MessageSquare,
  Plus,
  Pencil,
  Trash2,
  Hash,
} from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
// import { toast } from "sonner";
import { useToast } from "@repo/ui/hooks/use-toast";import { Toaster } from "@repo/ui/components/ui/toaster";
import KeywordModal from "./KeywordModal";
import InteractionLimitBar from "./InteractionLimitBar";

// Maximum number of keywords allowed
const MAX_KEYWORDS = 3;

interface CombinedInteractionsProps {
  control: Control<FormValues>;
  getValues: UseFormGetValues<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  register: UseFormRegister<FormValues>;
  watch: UseFormWatch<FormValues>;
}

export default function CombinedInteractions({
  control,
  getValues,
  setValue,
  register,
  watch,
}: CombinedInteractionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  // Get current values for calculations
  const keywordTargets = watch("keywordTargets") || [];
  const feedInteractions = watch("feedInteractions") || {
    numLikes: 0,
    numComments: 0,
  };

  // Calculate totals
  const keywordLikes = keywordTargets.reduce(
    (sum, target) => sum + (target.numLikes || 0),
    0,
  );

  const keywordComments = keywordTargets.reduce(
    (sum, target) => sum + (target.numComments || 0),
    0,
  );

  const totalLikes = feedInteractions.numLikes + keywordLikes;
  const totalComments = feedInteractions.numComments + keywordComments;

  // Calculate remaining
  const remainingLikes = MAX_LIKES - totalLikes;
  const remainingComments = MAX_COMMENTS - totalComments;

  // Calculate remaining for feed
  const remainingFeedLikes = MAX_LIKES - keywordLikes;
  const remainingFeedComments = MAX_COMMENTS - keywordComments;

  // Open modal to add a new keyword
  const openAddModal = () => {
    // Check if we've reached the maximum number of keywords
    if (keywordTargets.length >= MAX_KEYWORDS && !isEditing) {

      toast({
        title: "Limit Exceeded",
        description: `You can only add up to ${MAX_KEYWORDS} keyword targets.`,
        variant: "destructive", // You can use "default" for success
      });
      return;
    }

    // Check engagement limits
    if (totalLikes >= MAX_LIKES && totalComments >= MAX_COMMENTS) {

      toast({
        title: "Limit Exceeded",
        description: `You've reached the maximum limit of ${MAX_LIKES} likes and ${MAX_COMMENTS} comments.`,
        variant: "destructive",
      });
      return;
    }

    setEditingIndex(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  // Open modal to edit an existing keyword
  const openEditModal = (index: number) => {
    setEditingIndex(index);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // Remove a keyword target
  const removeKeywordTarget = (index: number) => {
    const currentTargets = getValues("keywordTargets");
    setValue(
      "keywordTargets",
      currentTargets.filter((_, i) => i !== index),
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      },
    );

    toast({
      title: "Keyword target removed successfully",
      variant: "default", // You can use "default" for success
    });

  };

  // Calculate remaining limits for the modal
  const getRemainingLimits = (editIndex: number | null) => {
    let remainingLikes = MAX_LIKES - feedInteractions.numLikes;
    let remainingComments = MAX_COMMENTS - feedInteractions.numComments;

    keywordTargets.forEach((target, i) => {
      // Skip the target being edited if we're editing
      if (editIndex !== null && i === editIndex) return;

      remainingLikes -= target.numLikes || 0;
      remainingComments -= target.numComments || 0;
    });

    return {
      remainingLikes: Math.max(0, remainingLikes),
      remainingComments: Math.max(0, remainingComments),
    };
  };

  // Handle saving keyword
  const handleSaveKeyword = (keyword: {
    keyword: string;
    numLikes: number;
    numComments: number;
  }) => {
    const currentTargets = getValues("keywordTargets");
    const currentFeedInteractions = getValues("feedInteractions");

    // Check keyword limit if adding a new keyword
    if (!isEditing && currentTargets.length >= MAX_KEYWORDS) {


      toast({
        title: "Limit Exceeded",
        description: `You can only add up to ${MAX_KEYWORDS} keyword targets.`,
        variant: "destructive", // You can use "default" for success
      });
      return;
    }

    // Calculate what the new totals would be
    let newTotalLikes = currentFeedInteractions.numLikes;
    let newTotalComments = currentFeedInteractions.numComments;

    currentTargets.forEach((target, i) => {
      // Skip the target being edited if we're editing
      if (isEditing && editingIndex === i) return;

      newTotalLikes += target.numLikes || 0;
      newTotalComments += target.numComments || 0;
    });

    // Add the new/edited target's values
    newTotalLikes += keyword.numLikes || 0;
    newTotalComments += keyword.numComments || 0;

    // Check if the new totals would exceed limits
    if (newTotalLikes > MAX_LIKES) {

      toast({
        title: "Limit Exceeded",
        description: `You can only have ${MAX_LIKES} total likes across all interactions.`,
        variant: "destructive", // You can use "default" for success
      });
      return;
    }

    if (newTotalComments > MAX_COMMENTS) {


      toast({
        title: "Limit Exceeded",
        description: `You can only have ${MAX_COMMENTS} total comments across all interactions.`,
        variant: "destructive", // You can use "default" for success
      });
      return;
    }

    if (isEditing && editingIndex !== null) {
      // Update existing keyword
      const updatedTargets = [...currentTargets];
      updatedTargets[editingIndex] = keyword;
      setValue("keywordTargets", updatedTargets, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      toast({
        title: "Keyword target updated successfully",
        variant: "default", // You can use "default" for success
      });
    } else {
      // Add new keyword
      setValue("keywordTargets", [...currentTargets, keyword], {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      toast({
        title: "Keyword target added successfully",
        variant: "default", // You can use "default" for success
      });
    }

    // Close the modal
    setIsModalOpen(false);
  };

  // Get limits for the current edit or new addition
  const limits = getRemainingLimits(editingIndex);

  return (
    <div className="space-y-6">
      {/* Engagement Limits Section */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">
            Overall Engagement Limits
            <span className="ml-2 text-xs text-gray-500 font-normal">
              (Maximum {MAX_LIKES} likes and {MAX_COMMENTS} comments in total)
            </span>
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-3 bg-white">
                <p className="text-xs">
                  Feed interactions and keyword targeting share the same limit
                  of {MAX_LIKES} likes and {MAX_COMMENTS} comments.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <ThumbsUp className="h-4 w-4 text-blue-500" />
            <div className="flex-1">
              <InteractionLimitBar
                current={totalLikes}
                max={MAX_LIKES}
                type="likes"
                available={remainingLikes}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-green-500" />
            <div className="flex-1">
              <InteractionLimitBar
                current={totalComments}
                max={MAX_COMMENTS}
                type="comments"
                available={remainingComments}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Feed Interactions Section */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium mb-3">Feed Interactions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="feedInteractions.numLikes"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel className="flex items-center text-sm">
                    <ThumbsUp className="h-4 w-4 text-blue-500 mr-1.5" />
                    Likes
                  </FormLabel>
                  <span className="text-xs text-gray-500">
                    Max: {remainingFeedLikes}
                  </span>
                </div>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max={remainingFeedLikes}
                    {...field}
                    disabled={remainingFeedLikes <= 0}
                    onChange={(e) => {
                      const newValue = Math.min(
                        Math.max(0, Number(e.target.value) || 0),
                        remainingFeedLikes,
                      );
                      field.onChange(newValue);
                    }}
                    className="h-9"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="feedInteractions.numComments"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel className="flex items-center text-sm">
                    <MessageSquare className="h-4 w-4 text-green-500 mr-1.5" />
                    Comments
                  </FormLabel>
                  <span className="text-xs text-gray-500">
                    Max: {remainingFeedComments}
                  </span>
                </div>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max={remainingFeedComments}
                    {...field}
                    disabled={remainingFeedComments <= 0}
                    onChange={(e) => {
                      const newValue = Math.min(
                        Math.max(0, Number(e.target.value) || 0),
                        remainingFeedComments,
                      );
                      field.onChange(newValue);
                    }}
                    className="h-9"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Keyword Targeting Section */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium">
            Keyword Targeting
            <span className="ml-2 text-xs text-gray-500 font-normal">
              (Maximum {MAX_KEYWORDS} keywords)
            </span>
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openAddModal}
            className="h-8"
            disabled={
              (keywordTargets.length >= MAX_KEYWORDS) ||
              (totalLikes >= MAX_LIKES && totalComments >= MAX_COMMENTS)
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Keyword
          </Button>
        </div>

        {keywordTargets.length > 0 ? (
          <div className="space-y-2">
            {keywordTargets.map((target, index) => (
              <div
                key={`keyword-${index}`}
                className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                    <Hash className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{target.keyword}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className="text-xs bg-blue-50 text-blue-700"
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" /> {target.numLikes}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs bg-green-50 text-green-700"
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />{" "}
                        {target.numComments}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => openEditModal(index)}
                  >
                    <Pencil className="h-4 w-4 text-gray-500" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500"
                    onClick={() => removeKeywordTarget(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 border rounded-md bg-gray-50">
            <p className="text-sm text-gray-500">No keyword targets</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={openAddModal}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Keyword
            </Button>
          </div>
        )}
      </div>

      {/* Keyword count indicator */}
      <div className="text-xs text-gray-500 text-right">
        {keywordTargets.length} of {MAX_KEYWORDS} keywords used
      </div>

      {/* Keyword Modal */}
      <KeywordModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSaveKeyword}
        initialKeyword={
          editingIndex !== null ? keywordTargets[editingIndex] : null
        }
        isEditing={isEditing}
        maxLikes={limits.remainingLikes}
        maxComments={limits.remainingComments}
      />
    </div>
  );
}