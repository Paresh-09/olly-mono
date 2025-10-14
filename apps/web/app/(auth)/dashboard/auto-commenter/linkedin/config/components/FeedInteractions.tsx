import React from "react";
import { Control, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { FormValues } from "../page";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { AlertCircle, Info, ThumbsUp, MessageSquare } from "lucide-react";
import { MAX_COMMENTS, MAX_LIKES } from "../utils";
import InteractionLimitBar from "./InteractionLimitBar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";

interface FeedInteractionsProps {
  control: Control<FormValues>;
  watch: UseFormWatch<FormValues>;
  setValue: UseFormSetValue<FormValues>;
}

export default function FeedInteractions({
  control,
  watch,
  setValue,
}: FeedInteractionsProps) {
  // Get current values for calculations
  const keywordTargets = watch("keywordTargets") || [];
  const feedInteractions = watch("feedInteractions") || {
    numLikes: 0,
    numComments: 0,
  };

  // Calculate totals from keyword targets
  const keywordLikes = keywordTargets.reduce(
    (sum, target) => sum + (target.numLikes || 0),
    0,
  );
  const keywordComments = keywordTargets.reduce(
    (sum, target) => sum + (target.numComments || 0),
    0,
  );

  // Calculate remaining interactions
  const remainingLikes = MAX_LIKES - keywordLikes;
  const remainingComments = MAX_COMMENTS - keywordComments;

  // Calculate total interactions
  const totalLikes = feedInteractions.numLikes + keywordLikes;
  const totalComments = feedInteractions.numComments + keywordComments;

  // Calculate available total
  const availableLikes = MAX_LIKES - totalLikes;
  const availableComments = MAX_COMMENTS - totalComments;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Feed Interactions</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    These are interactions that will happen on your main feed,
                    sharing the same 15 likes/15 comments limit with keyword
                    targeting.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="border-b pb-3 mb-4">
            <div className="flex flex-col space-y-1 mb-2">
              <h4 className="text-sm font-medium">Overall Engagement Limits</h4>
              <p className="text-xs text-gray-500">
                Maximum {MAX_LIKES} likes and {MAX_COMMENTS} comments total
                (feed + keywords)
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
                  Current Allocation:
                </h5>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex justify-between text-xs">
                  <span>Feed likes:</span>
                  <span className="font-medium">
                    {feedInteractions.numLikes}
                  </span>
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

          {(totalLikes >= MAX_LIKES || totalComments >= MAX_COMMENTS) && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-2 mb-4 flex items-start">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 mr-1.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                {totalLikes >= MAX_LIKES && totalComments >= MAX_COMMENTS
                  ? "You've reached the maximum limits for both likes and comments. Reduce keyword targeting to enable feed interactions."
                  : totalLikes >= MAX_LIKES
                    ? "You've reached the maximum likes limit. Reduce keyword targeting to enable feed likes."
                    : "You've reached the maximum comments limit. Reduce keyword targeting to enable feed comments."}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="feedInteractions.numLikes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <ThumbsUp className="h-4 w-4 text-blue-500 mr-1.5" />
                    Number of Likes
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max={remainingLikes}
                      {...field}
                      disabled={remainingLikes <= 0}
                      onChange={(e) => {
                        const newValue = Math.min(
                          Math.max(0, Number(e.target.value) || 0),
                          remainingLikes,
                        );
                        field.onChange(newValue);
                      }}
                    />
                  </FormControl>
                  <FormDescription className="flex items-center text-xs">
                    {remainingLikes <= 0 ? (
                      <span className="text-red-500 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        No likes available, reduce keyword likes
                      </span>
                    ) : (
                      <span>
                        Available:{" "}
                        <span className="font-medium">{remainingLikes}</span> of{" "}
                        {MAX_LIKES} total likes
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="feedInteractions.numComments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <MessageSquare className="h-4 w-4 text-green-500 mr-1.5" />
                    Number of Comments
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max={remainingComments}
                      {...field}
                      disabled={remainingComments <= 0}
                      onChange={(e) => {
                        const newValue = Math.min(
                          Math.max(0, Number(e.target.value) || 0),
                          remainingComments,
                        );
                        field.onChange(newValue);
                      }}
                    />
                  </FormControl>
                  <FormDescription className="flex items-center text-xs">
                    {remainingComments <= 0 ? (
                      <span className="text-red-500 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        No comments available, reduce keyword comments
                      </span>
                    ) : (
                      <span>
                        Available:{" "}
                        <span className="font-medium">{remainingComments}</span>{" "}
                        of {MAX_COMMENTS} total comments
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
