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
  Minus,
  Target,
  Info,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { useToast } from "@repo/ui/hooks/use-toast"; import KeywordModal from "./KeywordModal";
import InteractionLimitBar from "./InteractionLimitBar";
import PromptSelector from "./PromptSelector";
import { Label } from "@repo/ui/components/ui/label";

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
      const feedInteractions = watch("feedInteractions") || {
        numLikes: 5,
        numComments: 5,
      };
      const keywordTargets = watch("keywordTargets") || [];
      return { feedInteractions, keywordTargets };
    } else {
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

  // Feed interaction adjustment functions
  const adjustFeedLikes = (platform: string, increment: boolean) => {
    const settings = getCurrentPlatformSettings(platform);
    const currentLikes = settings.feedInteractions?.numLikes || 0;
    const keywordLikes = settings.keywordTargets?.reduce(
      (sum: number, target: any) => sum + (target.numLikes || 0), 0) || 0;

    const maxAllowed = MAX_LIKES - keywordLikes;
    const newValue = increment ? currentLikes + 1 : currentLikes - 1;
    const clampedValue = Math.max(0, Math.min(newValue, maxAllowed));

    if (newValue > maxAllowed) {
      toast({
        title: "Limit Exceeded",
        description: `Maximum ${maxAllowed} feed likes available (${keywordLikes} used by keywords)`,
        variant: "destructive",
      });
      return;
    }

    updatePlatformSettings(platform, {
      ...settings,
      feedInteractions: {
        ...settings.feedInteractions,
        numLikes: clampedValue,
      },
    });
  };

  const adjustFeedComments = (platform: string, increment: boolean) => {
    const settings = getCurrentPlatformSettings(platform);
    const currentComments = settings.feedInteractions?.numComments || 0;
    const keywordComments = settings.keywordTargets?.reduce(
      (sum: number, target: any) => sum + (target.numComments || 0), 0) || 0;

    const maxAllowed = MAX_COMMENTS - keywordComments;
    const newValue = increment ? currentComments + 1 : currentComments - 1;
    const clampedValue = Math.max(0, Math.min(newValue, maxAllowed));

    if (newValue > maxAllowed) {
      toast({
        title: "Limit Exceeded",
        description: `Maximum ${maxAllowed} feed comments available (${keywordComments} used by keywords)`,
        variant: "destructive",
      });
      return;
    }

    updatePlatformSettings(platform, {
      ...settings,
      feedInteractions: {
        ...settings.feedInteractions,
        numComments: clampedValue,
      },
    });
  };

  // Manual input handlers
  const handleFeedLikesInput = (platform: string, value: string) => {
    const numValue = parseInt(value) || 0;
    const settings = getCurrentPlatformSettings(platform);
    const keywordLikes = settings.keywordTargets?.reduce(
      (sum: number, target: any) => sum + (target.numLikes || 0), 0) || 0;
    const maxAllowed = MAX_LIKES - keywordLikes;
    const clampedValue = Math.max(0, Math.min(numValue, maxAllowed));

    updatePlatformSettings(platform, {
      ...settings,
      feedInteractions: {
        ...settings.feedInteractions,
        numLikes: clampedValue,
      },
    });
  };

  const handleFeedCommentsInput = (platform: string, value: string) => {
    const numValue = parseInt(value) || 0;
    const settings = getCurrentPlatformSettings(platform);
    const keywordComments = settings.keywordTargets?.reduce(
      (sum: number, target: any) => sum + (target.numComments || 0), 0) || 0;
    const maxAllowed = MAX_COMMENTS - keywordComments;
    const clampedValue = Math.max(0, Math.min(numValue, maxAllowed));

    updatePlatformSettings(platform, {
      ...settings,
      feedInteractions: {
        ...settings.feedInteractions,
        numComments: clampedValue,
      },
    });
  };

  // Handle keyword modal operations
  const openAddModal = (platform: string) => {
    const settings = getCurrentPlatformSettings(platform);
    const keywordTargets = settings.keywordTargets || [];

    if (keywordTargets.length >= MAX_KEYWORDS) {
      toast({
        title: "Limit Exceeded",
        description: `You can only add up to ${MAX_KEYWORDS} keyword targets per platform.`,
        variant: "destructive",
      });
      return;
    }

    const { totalLikes, totalComments } = calculatePlatformInteractions(platform);
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
    const updatedKeywordTargets = settings.keywordTargets.filter(
      (_: any, i: number) => i !== index,
    );

    updatePlatformSettings(platform, {
      ...settings,
      keywordTargets: updatedKeywordTargets,
    });

    toast({
      title: "Keyword target removed successfully",
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
        description: `You can only add up to ${MAX_KEYWORDS} keyword targets per platform.`,
        variant: "destructive",
      });
      return;
    }

    const { totalLikes, totalComments } = calculatePlatformInteractions(selectedPlatform);

    let newTotalLikes = totalLikes;
    let newTotalComments = totalComments;

    if (isEditing && editingIndex !== null) {
      const oldKeyword = currentTargets[editingIndex];
      newTotalLikes = newTotalLikes - (oldKeyword.numLikes || 0) + keyword.numLikes;
      newTotalComments = newTotalComments - (oldKeyword.numComments || 0) + keyword.numComments;
    } else {
      newTotalLikes += keyword.numLikes;
      newTotalComments += keyword.numComments;
    }

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
        ? "Keyword target updated successfully"
        : "Keyword target added successfully",
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

    let usedLikes = feedInteractions.numLikes || 0;
    let usedComments = feedInteractions.numComments || 0;

    keywordTargets.forEach((target: any, i: number) => {
      if (editIndex !== null && i === editIndex) return;
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
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Settings className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Platforms Enabled
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Please enable at least one platform in the General tab to configure
          platform-specific settings.
        </p>
      </div>
    );
  }

  const currentSettings = getCurrentPlatformSettings(selectedPlatform);
  const { totalLikes, totalComments } = calculatePlatformInteractions(selectedPlatform);
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
            className="grid w-full gap-1 h-auto p-1 min-w-max bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border shadow-sm"
            style={{
              gridTemplateColumns: `repeat(${validEnabledPlatforms.length}, minmax(120px, 1fr))`,
            }}
          >
            {validEnabledPlatforms.map((platform) => {
              const config = PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG];
              const IconComponent = config.icon;
              const { totalLikes, totalComments } = calculatePlatformInteractions(platform);
              const usageCount = totalLikes + totalComments;
              const maxUsage = MAX_LIKES + MAX_COMMENTS;
              const usagePercentage = Math.round((usageCount / maxUsage) * 100);

              return (
                <TabsTrigger
                  key={platform}
                  value={platform}
                  className={`
          relative flex items-center justify-center gap-2 min-w-0 px-3 py-2 rounded-md
          transition-all duration-200 ease-in-out group
          data-[state=active]:bg-white data-[state=active]:shadow-md
          data-[state=active]:ring-1 data-[state=active]:ring-blue-500/20
          data-[state=inactive]:hover:bg-white/60 data-[state=inactive]:hover:shadow-sm
          data-[state=inactive]:bg-transparent
        `}
                >
                  {/* Platform Icon */}
                  <div className={`
          w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200
          group-data-[state=active]:${config.bgColor || 'bg-blue-100'} 
          group-data-[state=inactive]:bg-gray-100
          group-data-[state=inactive]:group-hover:bg-gray-200
        `}>
                    <IconComponent className={`
            h-3.5 w-3.5 transition-colors duration-200
            group-data-[state=active]:${config.iconColor || 'text-blue-600'}
            group-data-[state=inactive]:text-gray-500
            group-data-[state=inactive]:group-hover:text-gray-700
          `} />
                  </div>

                  {/* Platform Info - Vertical Stack */}
                  <div className="flex flex-col items-center gap-0.5 min-w-0">
                    <span className={`
            text-xs font-medium transition-colors duration-200 truncate max-w-full leading-tight
            group-data-[state=active]:text-gray-900
            group-data-[state=inactive]:text-gray-600
            group-data-[state=inactive]:group-hover:text-gray-800
          `}>
                      {config.name}
                    </span>

                    {/* Compact Usage Counter */}
                    <div className={`
            px-1.5 py-0.5 rounded text-[10px] font-medium transition-all duration-200 leading-none
            ${usagePercentage > 80
                        ? 'bg-red-100 text-red-700'
                        : usagePercentage > 50
                          ? 'bg-amber-100 text-amber-700'
                          : usagePercentage > 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                      }
          `}>
                      {usageCount}/{maxUsage}
                    </div>
                  </div>

                  {/* Active Indicator Dot */}
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-500 border border-white shadow-sm opacity-0 scale-75 group-data-[state=active]:opacity-100 group-data-[state=active]:scale-100 transition-all duration-200"></div>
                </TabsTrigger>
              );
            })}
          </TabsList>


        </div>

        {validEnabledPlatforms.map((platform) => (
          <TabsContent key={platform} value={platform} className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {React.createElement(
                      PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG].icon,
                      { className: "h-5 w-5" }
                    )}
                    <span>
                      {PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG].name} Configuration
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {totalLikes}/{MAX_LIKES} likes
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {totalComments}/{MAX_COMMENTS} comments
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Feed Interactions Cards */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      Feed Interactions
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>
                              Interactions with posts in your feed. Shares the same limit
                              pool with keyword targeting.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Feed Likes Card */}
                    <div className={`
                      relative flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all
                      ${remainingFeedLikes === 0
                        ? "bg-red-50 border-red-200 opacity-50"
                        : "bg-blue-50 border-blue-200 hover:border-blue-300"
                      }
                    `}>
                      <div className="flex items-center gap-2 mb-4">
                        <ThumbsUp className="h-6 w-6 text-blue-600" />
                        <span className="font-medium text-blue-900">Feed Likes</span>
                      </div>

                      {remainingFeedLikes === 0 ? (
                        <div className="text-center">
                          <div className="text-3xl font-bold text-red-600 mb-1">0</div>
                          <div className="text-xs text-red-600">All allocated to keywords</div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 mb-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => adjustFeedLikes(platform, false)}
                              disabled={currentSettings.feedInteractions?.numLikes === 0}
                              className="h-10 w-10 p-0 rounded-full"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              min="0"
                              max={remainingFeedLikes}
                              value={currentSettings.feedInteractions?.numLikes || 0}
                              onChange={(e) => handleFeedLikesInput(platform, e.target.value)}
                              className="w-20 text-center text-2xl font-bold h-12 border-2"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => adjustFeedLikes(platform, true)}
                              disabled={currentSettings.feedInteractions?.numLikes >= remainingFeedLikes}
                              className="h-10 w-10 p-0 rounded-full"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-xs text-blue-600 text-center">
                            Max: {remainingFeedLikes} available
                          </div>
                        </>
                      )}
                    </div>

                    {/* Feed Comments Card */}
                    <div className={`
                      relative flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all
                      ${remainingFeedComments === 0
                        ? "bg-red-50 border-red-200 opacity-50"
                        : "bg-green-50 border-green-200 hover:border-green-300"
                      }
                    `}>
                      <div className="flex items-center gap-2 mb-4">
                        <MessageSquare className="h-6 w-6 text-green-600" />
                        <span className="font-medium text-green-900">Feed Comments</span>
                      </div>

                      {remainingFeedComments === 0 ? (
                        <div className="text-center">
                          <div className="text-3xl font-bold text-red-600 mb-1">0</div>
                          <div className="text-xs text-red-600">All allocated to keywords</div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 mb-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => adjustFeedComments(platform, false)}
                              disabled={currentSettings.feedInteractions?.numComments === 0}
                              className="h-10 w-10 p-0 rounded-full"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              min="0"
                              max={remainingFeedComments}
                              value={currentSettings.feedInteractions?.numComments || 0}
                              onChange={(e) => handleFeedCommentsInput(platform, e.target.value)}
                              className="w-20 text-center text-2xl font-bold h-12 border-2"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => adjustFeedComments(platform, true)}
                              disabled={currentSettings.feedInteractions?.numComments >= remainingFeedComments}
                              className="h-10 w-10 p-0 rounded-full"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-xs text-green-600 text-center">
                            Max: {remainingFeedComments} available
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Keyword Targeting */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Keyword Targeting
                      <Badge variant="outline" className="ml-2 text-xs">
                        {currentSettings.keywordTargets?.length || 0}/{MAX_KEYWORDS}
                      </Badge>
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => openAddModal(platform)}
                      className="h-9 gap-2"
                      disabled={
                        currentSettings.keywordTargets?.length >= MAX_KEYWORDS ||
                        (totalLikes >= MAX_LIKES && totalComments >= MAX_COMMENTS)
                      }
                    >
                      <Plus className="h-4 w-4" /> Add Keyword
                    </Button>
                  </div>

                  {currentSettings.keywordTargets && currentSettings.keywordTargets.length > 0 ? (
                    <div className="grid gap-3">
                      {currentSettings.keywordTargets.map((target: any, index: number) => (
                        <div
                          key={`${platform}-keyword-${index}`}
                          className="flex items-center justify-between p-4 border-2 rounded-lg hover:border-gray-300 transition-all bg-white"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                              <Hash className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-base mb-1">
                                {target.keyword}
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  <ThumbsUp className="h-4 w-4 text-blue-500" />
                                  <span className="text-sm font-medium text-blue-700">
                                    {target.numLikes}
                                  </span>
                                  <span className="text-xs text-gray-500">likes</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="h-4 w-4 text-green-500" />
                                  <span className="text-sm font-medium text-green-700">
                                    {target.numComments}
                                  </span>
                                  <span className="text-xs text-gray-500">comments</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 hover:bg-blue-50"
                              onClick={() => openEditModal(platform, index)}
                            >
                              <Pencil className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 hover:bg-red-50"
                              onClick={() => removeKeywordTarget(platform, index)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Target className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">
                        No keyword targets
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Add keywords or hashtags to target specific content
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => openAddModal(platform)}
                        className="gap-2"
                        disabled={totalLikes >= MAX_LIKES && totalComments >= MAX_COMMENTS}
                      >
                        <Plus className="h-4 w-4" /> Add Your First Keyword
                      </Button>
                    </div>
                  )}
                </div>

                {/* Platform-Specific Prompt Configuration */}
                <div className="border-t pt-6">
                  <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Response Configuration
                  </h3>
                  <PromptSelector
                    control={control as any}
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
            ? getCurrentPlatformSettings(selectedPlatform).keywordTargets?.[editingIndex]
            : null
        }
        isEditing={isEditing}
        maxLikes={limits.remainingLikes}
        maxComments={limits.remainingComments}
      />
    </div>
  );
}
