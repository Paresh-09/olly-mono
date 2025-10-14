import React, { useState } from "react";
import {
  Control,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { FormValues } from "../page";
import { MAX_LIKES, MAX_COMMENTS, PLATFORM_CONFIG } from "../utils";
import {
  Linkedin,
  Twitter,
  Facebook,
  ThumbsUp,
  MessageSquare,
  Plus,
  Pencil,
  Trash2,
  Hash,
  Settings,
  Users,
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
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { useToast } from "@repo/ui/hooks/use-toast";import KeywordModal from "./KeywordModal";
import InteractionLimitBar from "./InteractionLimitBar";
import PromptSelector from "./PromptSelector";

const MAX_KEYWORDS = 3;

// Sample custom prompt template
const SAMPLE_CUSTOM_PROMPT = {
  id: "default-prompt",
  title: "Professional Engagement",
  text: "Engage with this post in a professional manner, highlighting relevant industry insights and asking thoughtful questions that demonstrate expertise in the subject matter.",
};

interface PlatformConfigurationProps {
  control: Control<FormValues>;
  getValues: UseFormGetValues<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  register: UseFormRegister<FormValues>;
  watch: UseFormWatch<FormValues>;
  enabledPlatforms: string[];
  selectedPlatform: string;
  setSelectedPlatform: (platform: string) => void;
}

export default function PlatformConfiguration({
  control,
  getValues,
  setValue,
  register,
  watch,
  enabledPlatforms,
  selectedPlatform,
  setSelectedPlatform,
}: PlatformConfigurationProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  // Watch platform settings
  const platformSettings = watch("platformSettings") || {};

  // Get current platform settings - LinkedIn uses direct fields, others use platformSettings
  const getCurrentPlatformSettings = (platform: string) => {
    if (platform === "LINKEDIN") {
      // LinkedIn uses direct form fields
      const feedInteractions = watch("feedInteractions") || {
        numLikes: 5,
        numComments: 5,
      };
      const keywordTargets = watch("keywordTargets") || [];
      return { feedInteractions, keywordTargets };
    } else {
      // Other platforms use platformSettings JSON
      return (
        platformSettings[platform] || {
          feedInteractions: { numLikes: 5, numComments: 5 },
          keywordTargets: [],
        }
      );
    }
  };

  // Calculate platform interactions
  const calculatePlatformInteractions = (platform: string) => {
    const settings = getCurrentPlatformSettings(platform);
    const feedInteractions = settings.feedInteractions || {
      numLikes: 0,
      numComments: 0,
    };
    const keywordTargets = settings.keywordTargets || [];

    let totalLikes = feedInteractions.numLikes || 0;
    let totalComments = feedInteractions.numComments || 0;

    keywordTargets.forEach((target: any) => {
      totalLikes += target.numLikes || 0;
      totalComments += target.numComments || 0;
    });

    return { totalLikes, totalComments };
  };

  // Update platform settings - LinkedIn uses direct fields, others use platformSettings
  const updatePlatformSettings = (platform: string, newSettings: any) => {
    if (platform === "LINKEDIN") {
      // Update LinkedIn direct fields
      setValue("feedInteractions", newSettings.feedInteractions, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("keywordTargets", newSettings.keywordTargets, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    } else {
      // Update other platforms in platformSettings JSON
      const currentPlatformSettings = getValues("platformSettings") || {};
      setValue(
        "platformSettings",
        {
          ...currentPlatformSettings,
          [platform]: newSettings,
        },
        {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        },
      );
    }
  };

  // Handle keyword modal operations
  const openAddModal = (platform: string) => {
    const settings = getCurrentPlatformSettings(platform);
    const keywordTargets = settings.keywordTargets || [];

    if (keywordTargets.length >= MAX_KEYWORDS) {
      toast({
        title: "Limit Exceeded",
        description: `You can only add up to ${MAX_KEYWORDS} ${platform === "REDDIT" ? "subreddit" : "keyword"} targets per platform.`,
        variant: "destructive",
      });
      return;
    }

    const { totalLikes, totalComments } =
      calculatePlatformInteractions(platform);
    if (totalLikes >= MAX_LIKES && totalComments >= MAX_COMMENTS) {
      toast({
        title: "Limit Exceeded",
        description: `You've reached the maximum limit of ${MAX_LIKES} likes and ${MAX_COMMENTS} comments for ${platform}.`,
        variant: "destructive",
      });
      return;
    }

    setSelectedPlatform(platform);
    setEditingIndex(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (platform: string, index: number) => {
    setSelectedPlatform(platform);
    setEditingIndex(index);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const removeKeywordTarget = (platform: string, index: number) => {
    const settings = getCurrentPlatformSettings(platform);
    const updatedKeywordTargets = (settings.keywordTargets ?? []).filter(
      (_: any, i: number) => i !== index,
    );

    updatePlatformSettings(platform, {
      ...settings,
      keywordTargets: updatedKeywordTargets,
    });

    toast({
      title: `${platform === "REDDIT" ? "Subreddit" : "Keyword"} target removed successfully`,
      variant: "default",
    });
  };

  const handleSaveKeyword = (keyword: {
    keyword: string;
    numLikes: number;
    numComments: number;
  }) => {
    const settings = getCurrentPlatformSettings(selectedPlatform);
    const currentTargets = settings.keywordTargets || [];

    if (!isEditing && currentTargets.length >= MAX_KEYWORDS) {
      toast({
        title: "Limit Exceeded",
        description: `You can only add up to ${MAX_KEYWORDS} ${selectedPlatform === "REDDIT" ? "subreddit" : "keyword"} targets per platform.`,
        variant: "destructive",
      });
      return;
    }

    // NEW: Validate total allocations don't exceed limits
    const { totalLikes, totalComments } =
      calculatePlatformInteractions(selectedPlatform);

    // Calculate what the new total would be
    let newTotalLikes = totalLikes;
    let newTotalComments = totalComments;

    if (isEditing && editingIndex !== null) {
      // Subtract the old values and add the new ones
      const oldKeyword = currentTargets[editingIndex];
      newTotalLikes =
        newTotalLikes - (oldKeyword.numLikes || 0) + keyword.numLikes;
      newTotalComments =
        newTotalComments - (oldKeyword.numComments || 0) + keyword.numComments;
    } else {
      // Adding new keyword
      newTotalLikes += keyword.numLikes;
      newTotalComments += keyword.numComments;
    }

    // Check if new totals exceed limits
    if (newTotalLikes > MAX_LIKES) {
      toast({
        title: "Limit Exceeded",
        description: `Total likes would exceed ${MAX_LIKES}. Current total: ${totalLikes}, trying to add: ${keyword.numLikes}`,
        variant: "destructive",
      });
      return;
    }

    if (newTotalComments > MAX_COMMENTS) {
      toast({
        title: "Limit Exceeded",
        description: `Total comments would exceed ${MAX_COMMENTS}. Current total: ${totalComments}, trying to add: ${keyword.numComments}`,
        variant: "destructive",
      });
      return;
    }

    // Rest of the existing handleSaveKeyword logic...
    let updatedTargets;
    if (isEditing && editingIndex !== null) {
      updatedTargets = [...currentTargets];
      updatedTargets[editingIndex] = keyword;
    } else {
      updatedTargets = [...currentTargets, keyword];
    }

    updatePlatformSettings(selectedPlatform, {
      ...settings,
      keywordTargets: updatedTargets,
    });

    toast({
      title: isEditing
        ? `${selectedPlatform === "REDDIT" ? "Subreddit" : "Keyword"} target updated successfully`
        : `${selectedPlatform === "REDDIT" ? "Subreddit" : "Keyword"} target added successfully`,
      variant: "default",
    });

    setIsModalOpen(false);
  };

  // Get remaining limits for modal
  const getRemainingLimits = (platform: string, editIndex: number | null) => {
    const settings = getCurrentPlatformSettings(platform);
    const feedInteractions = settings.feedInteractions || {
      numLikes: 0,
      numComments: 0,
    };
    const keywordTargets = settings.keywordTargets || [];

    // Start with total available
    let usedLikes = feedInteractions.numLikes || 0;
    let usedComments = feedInteractions.numComments || 0;

    // Add up all keyword allocations except the one being edited
    keywordTargets.forEach((target: any, i: number) => {
      if (editIndex !== null && i === editIndex) return; // Skip the one being edited
      usedLikes += target.numLikes || 0;
      usedComments += target.numComments || 0;
    });

    return {
      remainingLikes: Math.max(0, MAX_LIKES - usedLikes),
      remainingComments: Math.max(0, MAX_COMMENTS - usedComments),
    };
  };

  // Filter enabled platforms and ensure selectedPlatform is valid
  const validEnabledPlatforms = enabledPlatforms.filter((platform) =>
    Object.keys(PLATFORM_CONFIG).includes(platform),
  );

  // Set default selected platform if current one is not enabled
  React.useEffect(() => {
    if (
      validEnabledPlatforms.length > 0 &&
      !validEnabledPlatforms.includes(selectedPlatform)
    ) {
      setSelectedPlatform(validEnabledPlatforms[0]);
    }
  }, [validEnabledPlatforms, selectedPlatform, setSelectedPlatform]);

  if (validEnabledPlatforms.length === 0) {
    return (
      <div className="text-center py-8">
        <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Platforms Enabled
        </h3>
        <p className="text-gray-500">
          Please enable at least one platform in the General tab to configure
          platform-specific settings.
        </p>
      </div>
    );
  }

  const currentSettings = getCurrentPlatformSettings(selectedPlatform);
  const { totalLikes, totalComments } =
    calculatePlatformInteractions(selectedPlatform);
  const remainingLikes = MAX_LIKES - totalLikes;
  const remainingComments = MAX_COMMENTS - totalComments;

  // Calculate remaining for feed interactions
  const keywordLikes =
    currentSettings.keywordTargets?.reduce(
      (sum: number, target: any) => sum + (target.numLikes || 0),
      0,
    ) || 0;
  const keywordComments =
    currentSettings.keywordTargets?.reduce(
      (sum: number, target: any) => sum + (target.numComments || 0),
      0,
    ) || 0;

  const remainingFeedLikes = MAX_LIKES - keywordLikes;
  const remainingFeedComments = MAX_COMMENTS - keywordComments;

  const limits = getRemainingLimits(selectedPlatform, editingIndex);

  return (
    <div className="space-y-6">
      {/* Platform Tabs */}
      <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform}>
        <div className="w-full overflow-x-auto">
          <TabsList
            className="grid w-full gap-1 h-auto p-1 min-w-max"
            style={{
              gridTemplateColumns: `repeat(${validEnabledPlatforms.length}, minmax(120px, 1fr))`,
            }}
          >
            {validEnabledPlatforms.map((platform) => {
              const config =
                PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG];
              const IconComponent = config.icon;

              return (
                <TabsTrigger
                  key={platform}
                  value={platform}
                  className={`flex items-center justify-center space-x-1 min-w-0 px-2 py-2 text-xs sm:text-sm whitespace-nowrap ${config.tabColor}`}
                >
                  <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">{config.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {validEnabledPlatforms.map((platform) => (
          <TabsContent key={platform} value={platform} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>
                    Configure{" "}
                    {
                      PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG]
                        .name
                    }
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Engagement Limits Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">
                      Engagement Limits for{" "}
                      {
                        PLATFORM_CONFIG[
                          platform as keyof typeof PLATFORM_CONFIG
                        ].name
                      }
                    </h3>
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

                {/* Feed Interactions */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-3">
                    Feed Interactions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <FormLabel className="flex items-center text-sm">
                          <ThumbsUp className="h-4 w-4 text-blue-500 mr-1.5" />
                          Likes
                        </FormLabel>
                        <span className="text-xs text-gray-500">
                          Max: {remainingFeedLikes}
                        </span>
                      </div>
                      {platform === "LINKEDIN" ? (
                        <FormField
                          control={control}
                          name="feedInteractions.numLikes"
                          render={({ field }) => (
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max={remainingFeedLikes}
                                {...field}
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
                          )}
                        />
                      ) : (
                        <Input
                          type="number"
                          min="0"
                          max={remainingFeedLikes}
                          value={
                            currentSettings.feedInteractions?.numLikes || 0
                          }
                          onChange={(e) => {
                            const newValue = Math.min(
                              Math.max(0, Number(e.target.value) || 0),
                              remainingFeedLikes,
                            );
                            updatePlatformSettings(platform, {
                              ...currentSettings,
                              feedInteractions: {
                                ...currentSettings.feedInteractions,
                                numLikes: newValue,
                              },
                            });
                          }}
                          className="h-9"
                        />
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <FormLabel className="flex items-center text-sm">
                          <MessageSquare className="h-4 w-4 text-green-500 mr-1.5" />
                          Comments
                        </FormLabel>
                        <span className="text-xs text-gray-500">
                          Max: {remainingFeedComments}
                        </span>
                      </div>
                      {platform === "LINKEDIN" ? (
                        <FormField
                          control={control}
                          name="feedInteractions.numComments"
                          render={({ field }) => (
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max={remainingFeedComments}
                                {...field}
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
                          )}
                        />
                      ) : (
                        <Input
                          type="number"
                          min="0"
                          max={remainingFeedComments}
                          value={
                            currentSettings.feedInteractions?.numComments || 0
                          }
                          onChange={(e) => {
                            const newValue = Math.min(
                              Math.max(0, Number(e.target.value) || 0),
                              remainingFeedComments,
                            );
                            updatePlatformSettings(platform, {
                              ...currentSettings,
                              feedInteractions: {
                                ...currentSettings.feedInteractions,
                                numComments: newValue,
                              },
                            });
                          }}
                          className="h-9"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Keyword/Subreddit Targeting */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium">
                      {platform === "REDDIT"
                        ? "Subreddit Targeting"
                        : "Keyword Targeting"}
                      <span className="ml-2 text-xs text-gray-500 font-normal">
                        (Maximum {MAX_KEYWORDS}{" "}
                        {platform === "REDDIT" ? "subreddits" : "keywords"})
                      </span>
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openAddModal(platform)}
                      className="h-8"
                      disabled={
                        (currentSettings.keywordTargets ? currentSettings.keywordTargets.length : 0) >= MAX_KEYWORDS ||
                        (totalLikes >= MAX_LIKES &&
                          totalComments >= MAX_COMMENTS)
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add{" "}
                      {platform === "REDDIT" ? "Subreddit" : "Keyword"}
                    </Button>
                  </div>

                  {currentSettings.keywordTargets &&
                  currentSettings.keywordTargets.length > 0 ? (
                    <div className="space-y-2">
                      {currentSettings.keywordTargets.map(
                        (target: any, index: number) => (
                          <div
                            key={`${platform}-keyword-${index}`}
                            className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                {platform === "REDDIT" ? (
                                  <Users className="h-3.5 w-3.5" />
                                ) : (
                                  <Hash className="h-3.5 w-3.5" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-sm">
                                  {platform === "REDDIT"
                                    ? `r/${target.keyword}`
                                    : target.keyword}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-blue-50 text-blue-700"
                                  >
                                    <ThumbsUp className="h-3 w-3 mr-1" />{" "}
                                    {target.numLikes}
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
                                onClick={() => openEditModal(platform, index)}
                              >
                                <Pencil className="h-4 w-4 text-gray-500" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500"
                                onClick={() =>
                                  removeKeywordTarget(platform, index)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 border rounded-md bg-gray-50">
                      <p className="text-sm text-gray-500">
                        No {platform === "REDDIT" ? "subreddit" : "keyword"}{" "}
                        targets
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => openAddModal(platform)}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add{" "}
                        {platform === "REDDIT" ? "Subreddit" : "Keyword"}
                      </Button>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 text-right mt-2">
                    {currentSettings.keywordTargets?.length || 0} of{" "}
                    {MAX_KEYWORDS}{" "}
                    {platform === "REDDIT" ? "subreddits" : "keywords"} used
                  </div>
                </div>

                {/* Platform-Specific Prompt Configuration */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-3">
                    Response Configuration
                  </h3>
                  <PromptSelector
                    control={control}
                    setValue={setValue}
                    getValues={getValues}
                    register={register}
                    watch={watch}
                    platform={platform}
                    defaultPrompts={[SAMPLE_CUSTOM_PROMPT]}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Keyword Modal */}
      <KeywordModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSaveKeyword}
        initialKeyword={
          editingIndex !== null
            ? getCurrentPlatformSettings(selectedPlatform).keywordTargets?.[
                editingIndex
              ]
            : null
        }
        isEditing={isEditing}
        maxLikes={limits.remainingLikes}
        maxComments={limits.remainingComments}
        // Add Reddit-specific props
        isReddit={selectedPlatform === "REDDIT"}
        placeholder={selectedPlatform === "REDDIT" ? "technology" : "#sales"}
        label={selectedPlatform === "REDDIT" ? "Subreddit" : "Keyword/Hashtag"}
      />
    </div>
  );
}
