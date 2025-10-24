import React, { useState, useEffect } from "react";
import {
  Control,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { FormValues } from "../page";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Pencil,
  Trash2,
  Plus,
  Hash,
  AlertCircle,
  Info,
  ThumbsUp,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { MAX_LIKES, MAX_COMMENTS } from "../utils";
import KeywordModal from "./KeywordModal";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import InteractionLimitBar from "./InteractionLimitBar";

interface KeywordTarget {
  keyword: string;
  numLikes: number;
  numComments: number;
}

interface KeywordTargetsProps {
  control: Control<FormValues>;
  getValues: UseFormGetValues<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  register: UseFormRegister<FormValues>;
  watch: UseFormWatch<FormValues>;
}

export default function KeywordTargets({
  control,
  getValues,
  setValue,
  register,
  watch,
}: KeywordTargetsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLimitReached, setIsLimitReached] = useState(false);

  // Get current values for calculations
  const keywordTargets = watch("keywordTargets") || [];
  const feedInteractions = watch("feedInteractions") || {
    numLikes: 0,
    numComments: 0,
  };

  // Calculate totals
  const totalLikes =
    feedInteractions.numLikes +
    keywordTargets.reduce((sum, target) => sum + (target.numLikes || 0), 0);

  const totalComments =
    feedInteractions.numComments +
    keywordTargets.reduce((sum, target) => sum + (target.numComments || 0), 0);

  // Calculate keyword-only totals
  const keywordLikes = keywordTargets.reduce(
    (sum, target) => sum + (target.numLikes || 0),
    0,
  );

  const keywordComments = keywordTargets.reduce(
    (sum, target) => sum + (target.numComments || 0),
    0,
  );

  // Calculate available
  const availableLikes = MAX_LIKES - totalLikes;
  const availableComments = MAX_COMMENTS - totalComments;

  // Check if limits are reached
  useEffect(() => {
    setIsLimitReached(totalLikes >= MAX_LIKES && totalComments >= MAX_COMMENTS);
  }, [totalLikes, totalComments]);

  // Add or update a keyword target
  const handleSaveKeyword = (keyword: KeywordTarget) => {
    const currentTargets = getValues("keywordTargets");
    const currentFeedInteractions = getValues("feedInteractions");

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
      toast.error(
        `You can only have ${MAX_LIKES} total likes across all interactions.`,
      );
      return;
    }

    if (newTotalComments > MAX_COMMENTS) {
      toast.error(
        `You can only have ${MAX_COMMENTS} total comments across all interactions.`,
      );
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
    } else {
      // Add new keyword
      setValue("keywordTargets", [...currentTargets, keyword], {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
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
  };

  // Open modal to add a new keyword
  const openAddModal = () => {
    // Check if we have room for more interactions
    if (totalLikes >= MAX_LIKES && totalComments >= MAX_COMMENTS) {
      toast.error(
        `You've reached the maximum limit of ${MAX_LIKES} likes and ${MAX_COMMENTS} comments.`,
      );
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

  // Get limits for the current edit or new addition
  const limits = getRemainingLimits(editingIndex);

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Keyword Targeting</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Target specific keywords or hashtags for automated engagement,
                  sharing the same 15 likes/15 comments limit with feed
                  interactions.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Specify hashtags and keywords for the automation to target
        </p>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="border-b pb-3 mb-4">
          <div className="flex flex-col space-y-1 mb-2">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">Keyword Usage</h4>
              <div className="flex gap-2 items-center">
                <span className="text-xs text-gray-500">
                  {keywordTargets.length} keywords
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Combined with feed interactions (15 likes, 15 comments total)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-blue-500" />
              <div className="flex-1">
                <InteractionLimitBar
                  current={totalLikes}
                  max={MAX_LIKES}
                  type="likes"
                  available={availableLikes}
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
                  available={availableComments}
                />
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex justify-between items-center">
              <h5 className="text-xs font-medium text-gray-500">
                Allocation Breakdown:
              </h5>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="flex justify-between text-xs">
                <span>Feed likes:</span>
                <span className="font-medium">{feedInteractions.numLikes}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Feed comments:</span>
                <span className="font-medium">
                  {feedInteractions.numComments}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Keyword likes:</span>
                <span className="font-medium">{keywordLikes}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Keyword comments:</span>
                <span className="font-medium">{keywordComments}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-medium">Targeted Keywords</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openAddModal}
            className="h-8"
            disabled={isLimitReached}
          >
            {isLimitReached ? (
              <>
                <AlertCircle className="h-4 w-4 mr-1.5" /> Limit Reached
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1.5" /> Add Keyword
              </>
            )}
          </Button>
        </div>

        {keywordTargets.length > 0 ? (
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {keywordTargets.map((target, index) => (
              <div
                key={`keyword-${index}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                    <Hash className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate max-w-full">
                      {(target.keyword?.replace(/^#/, "")) || `Keyword ${index + 1}`}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge
                        variant="outline"
                        className="text-xs font-normal px-1.5 py-0 h-5 bg-blue-50 border-blue-200 text-blue-700"
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" /> {target.numLikes}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs font-normal px-1.5 py-0 h-5 bg-green-50 border-green-200 text-green-700"
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />{" "}
                        {target.numComments}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-3 sm:mt-0 justify-end">
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
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => removeKeywordTarget(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border border-dashed rounded-md bg-gray-50">
            <Hash className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-1">No keyword targets</p>
            <p className="text-xs text-gray-400 mb-3">
              Add keywords to target specific content
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-1"
              onClick={openAddModal}
              disabled={isLimitReached}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Keyword
            </Button>
          </div>
        )}

        {/* Display warning if near limits */}
        {!isLimitReached &&
          (totalLikes > MAX_LIKES * 0.8 ||
            totalComments > MAX_COMMENTS * 0.8) && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-md p-2.5 flex items-start">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                {availableLikes <= 3 && availableComments <= 3
                  ? `You have only ${availableLikes} likes and ${availableComments} comments remaining from your total limit`
                  : availableLikes <= 3
                    ? `You have only ${availableLikes} likes remaining from your total limit of ${MAX_LIKES}`
                    : `You have only ${availableComments} comments remaining from your total limit of ${MAX_COMMENTS}`}
              </p>
            </div>
          )}

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
      </CardContent>
    </Card>
  );
}

