"use client";
import React, { useState, useEffect, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Save, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@repo/ui/hooks/use-toast";
// UI Component
import { Button } from "@repo/ui/components/ui/button";
import { Form } from "@repo/ui/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";

// Import sub-components
import LicenseSelector from "./components/LicenseSelector";
import BrandVoiceToggle from "./components/BrandVoiceToggle";
import ProductPromotion from "./components/ProductPromotion";
import FormSkeleton from "./components/FormSkeleton";
import PlatformSelector from "./components/PlatformSelector";
import PlatformConfiguration from "./components/PlatformConfiguration";
import { MAX_COMMENTS, MAX_LIKES } from "./utils";

// Interface for license type
interface License {
  id: string;
  key: string;
  name: string;
  status: string;
}

// Platform settings interface - Updated to support both keywords and subreddits
interface PlatformSettings {
  feedInteractions: {
    numLikes: number;
    numComments: number;
  };
  keywordTargets?: Array<{
    keyword: string;
    numLikes: number;
    numComments: number;
  }>;
  subredditTargets?: Array<{
    subreddit: string;
    numLikes: number;
    numComments: number;
  }>;
  promptMode?: "automatic" | "custom";
  customPrompts?: Array<{
    id: string;
    title: string;
    text: string;
  }>;
  selectedCustomPromptId?: string;
}

// Updated form schema - Added Reddit support
const linkedinConfigurationFormSchema = z.object({
  // Global settings
  useBrandVoice: z.boolean(),
  promoteProduct: z.boolean(),
  productDetails: z.string().optional(),
  licenseKey: z.string().optional(),

  // LinkedIn-specific settings (existing fields for backward compatibility)
  feedInteractions: z.object({
    numLikes: z.number().min(0).max(MAX_LIKES),
    numComments: z.number().min(0).max(MAX_COMMENTS),
  }),
  keywordTargets: z
    .array(
      z.object({
        keyword: z.string().min(1),
        numLikes: z.number().min(0),
        numComments: z.number().min(0),
      }),
    )
    .max(3),

  // LinkedIn prompt settings (backward compatibility)
  linkedinPromptMode: z.enum(["automatic", "custom"]).default("automatic"),
  linkedinCustomPrompts: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        text: z.string().min(10, "Prompt must be at least 10 characters"),
      }),
    )
    .max(1)
    .optional(),
  linkedinSelectedCustomPromptId: z.string().optional(),

  // Platform management - Updated to include Reddit
  enabledPlatforms: z
    .array(
      z.enum([
        "LINKEDIN",
        "TWITTER",
        "FACEBOOK",
        "INSTAGRAM",
        "THREADS",
        "REDDIT",
        "TIKTOK",
      ]),
    )
    .default(["LINKEDIN"]),

  // New platforms use JSON settings (Twitter, Facebook, Instagram, Reddit)
  platformSettings: z
    .record(
      z.string(),
      z.object({
        feedInteractions: z.object({
          numLikes: z.number().min(0).max(MAX_LIKES),
          numComments: z.number().min(0).max(MAX_COMMENTS),
        }),
        keywordTargets: z
          .array(
            z.object({
              keyword: z.string().min(1),
              numLikes: z.number().min(0),
              numComments: z.number().min(0),
            }),
          )
          .max(3)
          .optional(),
        subredditTargets: z
          .array(
            z.object({
              subreddit: z.string().min(1),
              numLikes: z.number().min(0),
              numComments: z.number().min(0),
            }),
          )
          .max(3)
          .optional(),
        promptMode: z.enum(["automatic", "custom"]).default("automatic"),
        customPrompts: z
          .array(
            z.object({
              id: z.string(),
              title: z.string(),
              text: z.string().min(10, "Prompt must be at least 10 characters"),
            }),
          )
          .max(1)
          .optional(),
        selectedCustomPromptId: z.string().optional(),
      }),
    )
    .default({}),
});

// Type for form values based on the schema
export type FormValues = z.infer<typeof linkedinConfigurationFormSchema>;

const LinkedInAutomationConfig = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableLicenses, setAvailableLicenses] = useState<License[]>([]);
  const [isLoadingLicenses, setIsLoadingLicenses] = useState(true);
  const [runtimeWarning, setRuntimeWarning] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("LINKEDIN");
  const tabSequence = ["general", "platforms"]; // Removed "content"
  const { toast } = useToast();

  // New state variables for brand voice data
  const [brandVoiceData, setBrandVoiceData] = useState(null);
  const [isBrandVoiceLoading, setIsBrandVoiceLoading] = useState(false);
  const [brandVoiceError, setBrandVoiceError] = useState<string | null>(null);

  // Set default form values - LinkedIn uses direct fields, others use platformSettings
  const defaultValues: FormValues = {
    useBrandVoice: false,
    promoteProduct: false,
    productDetails: "",
    licenseKey: "",
    linkedinPromptMode: "automatic",
    linkedinCustomPrompts: [],
    linkedinSelectedCustomPromptId: "",
    enabledPlatforms: ["LINKEDIN"],
    // LinkedIn settings as direct fields
    feedInteractions: {
      numLikes: 5,
      numComments: 5,
    },
    keywordTargets: [
      {
        keyword: "#sales",
        numLikes: 5,
        numComments: 3,
      },
    ],
    // Other platforms use platformSettings JSON
    platformSettings: {
      TWITTER: {
        feedInteractions: {
          numLikes: 3,
          numComments: 3,
        },
        keywordTargets: [
          {
            keyword: "#tech",
            numLikes: 3,
            numComments: 2,
          },
        ],
        promptMode: "automatic",
        customPrompts: [],
        selectedCustomPromptId: "",
      },
      FACEBOOK: {
        feedInteractions: {
          numLikes: 4,
          numComments: 4,
        },
        keywordTargets: [
          {
            keyword: "#business",
            numLikes: 4,
            numComments: 2,
          },
        ],
        promptMode: "automatic",
        customPrompts: [],
        selectedCustomPromptId: "",
      },
      INSTAGRAM: {
        feedInteractions: {
          numLikes: 6,
          numComments: 3,
        },
        keywordTargets: [
          {
            keyword: "#lifestyle",
            numLikes: 4,
            numComments: 2,
          },
        ],
        promptMode: "automatic",
        customPrompts: [],
        selectedCustomPromptId: "",
      },
      REDDIT: {
        feedInteractions: {
          numLikes: 5,
          numComments: 3,
        },
        subredditTargets: [
          {
            subreddit: "technology",
            numLikes: 3,
            numComments: 2,
          },
        ],
        promptMode: "automatic",
        customPrompts: [],
        selectedCustomPromptId: "",
      },
      TIKTOK: {
        feedInteractions: {
          numLikes: 4,
          numComments: 2,
        },
        keywordTargets: [
          {
            keyword: "#viral",
            numLikes: 2,
            numComments: 1,
          },
        ],
        promptMode: "automatic",
        customPrompts: [],
        selectedCustomPromptId: "",
      },
    },
  };

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(linkedinConfigurationFormSchema),
    defaultValues,
    mode: "onChange",
  });

  // Calculate total interactions for a specific platform
  const calculatePlatformInteractions = (
    platformKey: string,
    formValues: any,
  ) => {
    if (platformKey === "LINKEDIN") {
      // LinkedIn uses direct fields
      const feedInteractions = formValues?.feedInteractions || {
        numLikes: 0,
        numComments: 0,
      };
      const keywordTargets = formValues?.keywordTargets || [];

      let totalLikes = feedInteractions.numLikes || 0;
      let totalComments = feedInteractions.numComments || 0;

      keywordTargets.forEach((target: any) => {
        totalLikes += target.numLikes || 0;
        totalComments += target.numComments || 0;
      });

      return { totalLikes, totalComments };
    } else {
      // Other platforms use platformSettings JSON
      const platformSettings = formValues?.platformSettings?.[platformKey];
      if (!platformSettings) return { totalLikes: 0, totalComments: 0 };

      const feedInteractions = platformSettings.feedInteractions || {
        numLikes: 0,
        numComments: 0,
      };

      let totalLikes = feedInteractions.numLikes || 0;
      let totalComments = feedInteractions.numComments || 0;

      // Handle keyword targets (for most platforms)
      const keywordTargets = platformSettings.keywordTargets || [];
      keywordTargets.forEach((target: any) => {
        totalLikes += target.numLikes || 0;
        totalComments += target.numComments || 0;
      });

      // Handle subreddit targets (for Reddit)
      const subredditTargets = platformSettings.subredditTargets || [];
      subredditTargets.forEach((target: any) => {
        totalLikes += target.numLikes || 0;
        totalComments += target.numComments || 0;
      });

      return { totalLikes, totalComments };
    }
  };

  // Function to fetch brand voice data
  const fetchBrandVoiceStatus = useCallback(async () => {
    if (
      isLoadingLicenses ||
      !availableLicenses ||
      availableLicenses.length === 0
    ) {
      return;
    }

    setIsBrandVoiceLoading(true);
    setBrandVoiceError(null);

    try {
      const license = availableLicenses.find(
        (license) => license.id === availableLicenses[0].id,
      );

      if (!license) {
        // Don't throw error, just set loading to false and return
        setIsBrandVoiceLoading(false);
        return;
      }

      const response = await fetch(
        `/api/license-key/${license.key}/custom-knowledge`,
      );

      if (!response.ok) {
        // Don't throw error for non-critical functionality
        console.warn("Failed to fetch brand voice status:", response.status);
        setBrandVoiceError("Brand voice data unavailable");
        return;
      }

      const data = await response.json();
      setBrandVoiceData(data);
    } catch (error) {
      console.error("Error checking brand voice status:", error);
      setBrandVoiceError(
        error instanceof Error ? error.message : "Unknown error occurred",
      );
    } finally {
      setIsBrandVoiceLoading(false);
    }
  }, [availableLicenses, isLoadingLicenses]);

  // Fetch brand voice data when licenses are available
  useEffect(() => {
    if (
      isLoadingLicenses ||
      !availableLicenses ||
      availableLicenses.length === 0
    ) {
      return;
    }

    fetchBrandVoiceStatus();
  }, [availableLicenses, isLoadingLicenses, fetchBrandVoiceStatus]);

  // Watch for changes in interactions to monitor limits
  useEffect(() => {
    const subscription = form.watch((values) => {
      // Check interaction limits for all enabled platforms
      const enabledPlatforms = values.enabledPlatforms || [];
      let hasExceededLimits = false;
      let warningMessage = "";

      enabledPlatforms.forEach((platform) => {
        const { totalLikes, totalComments } = calculatePlatformInteractions(
          platform!,
          values,
        );

        if (totalLikes > MAX_LIKES || totalComments > MAX_COMMENTS) {
          hasExceededLimits = true;
          warningMessage = `${platform}: ${totalLikes}/${MAX_LIKES} likes, ${totalComments}/${MAX_COMMENTS} comments exceed limits.`;
        }
      });

      if (hasExceededLimits) {
        setRuntimeWarning(warningMessage);
      } else if (runtimeWarning && runtimeWarning.includes("exceed limits")) {
        setRuntimeWarning(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, runtimeWarning]);

  // Watch for changes in prompts
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name?.includes("customPrompts") && type === "change") {
        form.trigger("linkedinCustomPrompts");

        const linkedinCustomPrompts =
          form.getValues("linkedinCustomPrompts") || [];
        if (
          linkedinCustomPrompts.length > 0 &&
          linkedinCustomPrompts[0].text &&
          linkedinCustomPrompts[0].text.trim().length >= 10 &&
          runtimeWarning &&
          !runtimeWarning.includes("exceed limits")
        ) {
          setRuntimeWarning(null);
        }

        if (linkedinCustomPrompts.length > 0 && linkedinCustomPrompts[0].id) {
          form.setValue(
            "linkedinSelectedCustomPromptId",
            linkedinCustomPrompts[0].id,
          );
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, runtimeWarning]);

  // Watch form fields
  const watchPromoteProduct = form.watch("promoteProduct");
  const watchEnabledPlatforms = form.watch("enabledPlatforms");

  // Check if licenses are available
  const hasAvailableLicenses =
    !isLoadingLicenses && availableLicenses.length > 0;

  // Fetch existing configuration
  useEffect(() => {
    async function fetchConfig() {
      setIsFetching(true);
      setError(null);
      try {
        const response = await fetch("/api/ac/test/config/test");

        if (!response.ok) {
          throw new Error("Failed to fetch configuration");
        }

        const { data, availableLicenses: licenses } = await response.json();

        setAvailableLicenses(licenses);
        setIsLoadingLicenses(false);

        if (data) {
          let linkedinCustomPrompts: any[] = [];

          if (data.customPrompts && data.customPrompts.length > 0) {
            linkedinCustomPrompts = [data.customPrompts[0]];
          }

          const formData = {
            useBrandVoice: data.useBrandVoice || false,
            promoteProduct: data.promoteProduct || false,
            productDetails: data.productDetails || "",
            licenseKey: data.licenseKey || "",
            linkedinPromptMode: data.promptMode || "automatic",
            linkedinCustomPrompts: linkedinCustomPrompts,
            linkedinSelectedCustomPromptId:
              linkedinCustomPrompts.length > 0
                ? linkedinCustomPrompts[0].id
                : "",
            enabledPlatforms: data.enabledPlatforms || ["LINKEDIN"],
            // LinkedIn settings from direct fields
            feedInteractions: data.feedInteractions || {
              numLikes: 5,
              numComments: 5,
            },
            keywordTargets: data.keywordTargets || [
              { keyword: "#sales", numLikes: 5, numComments: 3 },
            ],
            // Other platforms from platformSettings JSON
            platformSettings: data.platformSettings || {
              TWITTER: {
                feedInteractions: { numLikes: 3, numComments: 3 },
                keywordTargets: [
                  { keyword: "#tech", numLikes: 3, numComments: 2 },
                ],
                promptMode: "automatic",
                customPrompts: [],
                selectedCustomPromptId: "",
              },
              FACEBOOK: {
                feedInteractions: { numLikes: 4, numComments: 4 },
                keywordTargets: [
                  { keyword: "#business", numLikes: 4, numComments: 2 },
                ],
                promptMode: "automatic",
                customPrompts: [],
                selectedCustomPromptId: "",
              },
              INSTAGRAM: {
                feedInteractions: { numLikes: 6, numComments: 3 },
                keywordTargets: [
                  { keyword: "#lifestyle", numLikes: 4, numComments: 2 },
                ],
                promptMode: "automatic",
                customPrompts: [],
                selectedCustomPromptId: "",
              },
              REDDIT: {
                feedInteractions: { numLikes: 5, numComments: 3 },
                subredditTargets: [
                  { subreddit: "technology", numLikes: 3, numComments: 2 },
                ],
                promptMode: "automatic",
                customPrompts: [],
                selectedCustomPromptId: "",
              },
              TIKTOK: {
                feedInteractions: {
                  numLikes: 4,
                  numComments: 2,
                },
                keywordTargets: [
                  {
                    keyword: "#viral",
                    numLikes: 2,
                    numComments: 1,
                  },
                ],
                promptMode: "automatic",
                customPrompts: [],
                selectedCustomPromptId: "",
              },
            },
          };

          form.reset(formData);

          // Check if any platform exceeds limits
          const enabledPlatforms = formData.enabledPlatforms;
          enabledPlatforms.forEach((platform: string) => {
            const { totalLikes, totalComments } = calculatePlatformInteractions(
              platform,
              formData as FormValues,
            );
            if (totalLikes > MAX_LIKES || totalComments > MAX_COMMENTS) {
              setRuntimeWarning(
                `Your saved configuration for ${platform} exceeds the new limits of ${MAX_LIKES} likes and ${MAX_COMMENTS} comments. Please adjust your settings.`,
              );
            }
          });
        }
      } catch (error) {
        console.error("Error fetching configuration:", error);
        setError(
          "Failed to load your existing configuration. Starting with default settings.",
        );
      } finally {
        setIsFetching(false);
      }
    }

    fetchConfig();
  }, [form]);

  // Check for required prompts and interaction limits before submitting
  const validateForm = () => {
    try {
      const formValues = form.getValues();
      const enabledPlatforms = formValues.enabledPlatforms || [];

      // Clear any existing warnings first
      setRuntimeWarning(null);

      // Skip validation if no platforms enabled (shouldn't happen but safety check)
      if (enabledPlatforms.length === 0) {
        setRuntimeWarning("Please select at least one platform");
        return false;
      }

      // Check interaction limits for each enabled platform
      for (const platform of enabledPlatforms) {
        try {
          const { totalLikes, totalComments } = calculatePlatformInteractions(
            platform,
            formValues,
          );

          if (totalLikes > MAX_LIKES) {
            setRuntimeWarning(
              `${platform}: You've exceeded the maximum limit of ${MAX_LIKES} likes. Please reduce the number of likes.`,
            );
            return false;
          }

          if (totalComments > MAX_COMMENTS) {
            setRuntimeWarning(
              `${platform}: You've exceeded the maximum limit of ${MAX_COMMENTS} comments. Please reduce the number of comments.`,
            );
            return false;
          }
        } catch (error) {
          console.warn(
            `Error calculating interactions for ${platform}:`,
            error,
          );
          // Continue validation for other platforms
        }
      }

      // Check prompt requirements for custom mode for each platform
      for (const platform of enabledPlatforms) {
        try {
          let promptMode, customPrompts;

          if (platform === "LINKEDIN") {
            promptMode = formValues.linkedinPromptMode;
            customPrompts = formValues.linkedinCustomPrompts || [];
          } else {
            const platformSettings = formValues.platformSettings?.[platform];
            promptMode = platformSettings?.promptMode || "automatic";
            customPrompts = platformSettings?.customPrompts || [];
          }

          if (promptMode === "custom") {
            if (customPrompts.length === 0) {
              setRuntimeWarning(
                `Please create a custom prompt for ${platform} before saving`,
              );
              return false;
            }

            const customPrompt = customPrompts[0];
            if (
              !customPrompt ||
              !customPrompt.text ||
              customPrompt.text.trim().length < 10
            ) {
              setRuntimeWarning(
                `Your custom prompt for ${platform} must have at least 10 characters`,
              );
              return false;
            }
          }
        } catch (error) {
          console.warn(`Error validating prompts for ${platform}:`, error);
          // Continue validation for other platforms
        }
      }

      return true;
    } catch (error) {
      console.error("Error in form validation:", error);
      setRuntimeWarning("Validation error occurred. Please try again.");
      return false;
    }
  };

  // Handle form submission
  async function onSubmit(data: FormValues) {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setRuntimeWarning(null);

    try {
      const linkedinCustomPrompt =
        data.linkedinCustomPrompts && data.linkedinCustomPrompts.length > 0
          ? data.linkedinCustomPrompts[0]
          : null;

      // Filter out THREADS from enabled platforms before submission
      const filteredEnabledPlatforms = data.enabledPlatforms.filter(
        (platform: string) => platform !== "THREADS",
      );

      // Send ALL platformSettings, not just enabled ones
      // This ensures unconfigured platforms still have their default settings sent
      const completePlatformSettings: Record<string, PlatformSettings> = {};

      // Include all platforms except LinkedIn (which uses direct fields)
      const allPlatforms = ["TWITTER", "FACEBOOK", "INSTAGRAM", "REDDIT", "TIKTOK"];

      allPlatforms.forEach((platformKey) => {
        if (data.platformSettings?.[platformKey]) {
          // Use existing settings if available
          completePlatformSettings[platformKey] =
            data.platformSettings[platformKey];
        } else {
          // Use default settings if not configured
          completePlatformSettings[platformKey] =
            defaultValues.platformSettings[platformKey];
        }
      });

      const apiData = {
        isEnabled: true,
        useBrandVoice: data.useBrandVoice,
        promoteProduct: data.promoteProduct,
        productDetails: data.productDetails,
        licenseKey: data.licenseKey,
        promptMode: data.linkedinPromptMode,
        customPrompts:
          data.linkedinPromptMode === "custom" && linkedinCustomPrompt
            ? [linkedinCustomPrompt]
            : [],
        selectedCustomPromptId:
          data.linkedinPromptMode === "custom" && linkedinCustomPrompt
            ? linkedinCustomPrompt.id
            : "",
        enabledPlatforms: filteredEnabledPlatforms, // Use filtered platforms
        // LinkedIn settings as direct fields (backward compatibility)
        feedInteractions: data.feedInteractions,
        keywordTargets: data.keywordTargets,
        // Send complete platformSettings for all platforms
        platformSettings: completePlatformSettings,
      };

      const response = await fetch("/api/ac/test/config/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save configuration");
      }

      toast({
        title: "Success",
        description: "Configuration saved successfully!",
        variant: "default",
      });

      router.refresh();
    } catch (error: any) {
      console.error("Error saving configuration:", error);

      const errorMessage = error.message || "Failed to save configuration";

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }
  // Show loading state
  if (isFetching) {
    return <FormSkeleton />;
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-full sm:max-w-6xl mx-auto">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Multi-Platform Automation Configuration
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg mt-2">
            Configure your social media automation settings for multiple
            platforms including Reddit. Maximum {MAX_LIKES} likes and{" "}
            {MAX_COMMENTS} comments per platform per run.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {tabSequence.map((tab, index) => (
              <React.Fragment key={tab}>
                <button
                  onClick={() => setActiveTab(tab)}
                  className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium ${
                    activeTab === tab
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {index + 1}. {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
                {index < tabSequence.length - 1 && (
                  <span className="text-gray-400 hidden sm:inline">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {runtimeWarning && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-600">Note</AlertTitle>
            <AlertDescription className="text-amber-700">
              {runtimeWarning}
            </AlertDescription>
          </Alert>
        )}

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="pt-4 sm:pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 sm:space-y-8"
              >
                <Tabs
                  defaultValue="general"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  {/* General Tab */}
                  <TabsContent
                    value="general"
                    className="space-y-4 sm:space-y-6"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div className="border border-gray-100 rounded-lg p-3 sm:p-4 bg-white shadow-sm">
                        <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">
                          Global Settings
                        </h3>
                        <div className="space-y-4">
                          <LicenseSelector
                            control={form.control}
                            isLoadingLicenses={isLoadingLicenses}
                            availableLicenses={availableLicenses}
                          />
                          <PlatformSelector
                            control={form.control}
                            availableLicenses={availableLicenses}
                            isLoadingLicenses={isLoadingLicenses}
                          />
                        </div>
                      </div>

                      <div className="border border-gray-100 rounded-lg p-3 sm:p-4 bg-white shadow-sm">
                        <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">
                          Content Options
                        </h3>
                        <div className="space-y-4">
                          <BrandVoiceToggle
                            control={form.control}
                            isLoadingLicenses={isLoadingLicenses}
                            availableLicenses={availableLicenses}
                            brandVoiceData={brandVoiceData}
                            isBrandVoiceLoading={isBrandVoiceLoading}
                            brandVoiceError={brandVoiceError}
                          />
                          <ProductPromotion
                            control={form.control}
                            watchPromoteProduct={watchPromoteProduct}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Platforms Tab */}
                  <TabsContent
                    value="platforms"
                    className="space-y-4 sm:space-y-6"
                  >
                    {!hasAvailableLicenses ? (
                      <Alert className="border-amber-200 bg-amber-50">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertTitle className="text-amber-600">
                          License Required
                        </AlertTitle>
                        <AlertDescription className="text-amber-700">
                          Auto-commenter is restricted to paid users only.
                          Please purchase a license from the plans page to
                          access platform configuration.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <PlatformConfiguration
                        control={form.control}
                        getValues={form.getValues}
                        setValue={form.setValue}
                        watch={form.watch}
                        register={form.register}
                        enabledPlatforms={watchEnabledPlatforms}
                        selectedPlatform={selectedPlatform}
                        setSelectedPlatform={setSelectedPlatform}
                      />
                    )}
                  </TabsContent>
                </Tabs>

                <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mt-4 sm:mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const currentIndex = tabSequence.indexOf(activeTab);
                      if (currentIndex > 0) {
                        setActiveTab(tabSequence[currentIndex - 1]);
                      }
                    }}
                    disabled={activeTab === "general"}
                    className="px-4 sm:px-6 py-2 bg-white hover:bg-gray-50 w-full sm:w-auto"
                  >
                    Previous
                  </Button>

                  {activeTab !== "platforms" ? (
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        const currentIndex = tabSequence.indexOf(activeTab);
                        if (currentIndex < tabSequence.length - 1) {
                          setActiveTab(tabSequence[currentIndex + 1]);
                        }
                      }}
                      disabled={
                        activeTab === "general" && !hasAvailableLicenses
                      }
                      className="px-4 sm:px-6 py-2 bg-gray-900 hover:bg-gray-800 w-full sm:w-auto"
                    >
                      Next
                    </Button>
                  ) : null}
                </div>

                {activeTab === "platforms" && (
                  <div className="space-y-2">
                    <Button
                      type="submit"
                      className="w-full mt-4 sm:mt-6 py-2 sm:py-3 bg-gray-900 hover:bg-gray-800 flex items-center justify-center"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                          <span className="hidden xs:inline">Saving </span>
                          Configuration...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                          Save Configuration
                        </>
                      )}
                    </Button>

                    {/* Temporary reset button if form gets stuck */}
                    {isSubmitting && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => {
                          setIsSubmitting(false);
                          setError(null);
                          setRuntimeWarning(null);
                        }}
                      >
                        Reset Form State (if stuck)
                      </Button>
                    )}
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LinkedInAutomationConfig;
