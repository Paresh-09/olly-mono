"use client";
import React, { useState, useEffect, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Save, Loader2, AlertCircle, Settings, Bot, MessageSquare, Users, Target, Sparkles, ArrowRight, Check, SaveAllIcon } from "lucide-react";
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

// Platform settings interface
interface PlatformSettings {
  feedInteractions: {
    numLikes: number;
    numComments: number;
  };
  keywordTargets: Array<{
    keyword: string;
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

// Updated form schema - LinkedIn uses existing fields, others use platformSettings
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

  // Platform management - now includes Instagram, Threads, and TikTok
  enabledPlatforms: z
    .array(z.enum(["LINKEDIN", "TWITTER", "FACEBOOK", "INSTAGRAM", "THREADS", "TIKTOK"]))
    .default(["LINKEDIN"]),

  // New platforms use JSON settings (Twitter, Facebook, Instagram, TikTok)
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
          .max(3),
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
      TIKTOK: {
        feedInteractions: {
          numLikes: 8,
          numComments: 4,
        },
        keywordTargets: [
          {
            keyword: "#viral",
            numLikes: 6,
            numComments: 3,
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
      const keywordTargets = platformSettings.keywordTargets || [];

      let totalLikes = feedInteractions.numLikes || 0;
      let totalComments = feedInteractions.numComments || 0;

      keywordTargets.forEach((target: any) => {
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
        const response = await fetch("/api/ac/config/test");

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
              TIKTOK: {
                feedInteractions: { numLikes: 8, numComments: 4 },
                keywordTargets: [
                  { keyword: "#viral", numLikes: 6, numComments: 3 },
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
      const allPlatforms = ["TWITTER", "FACEBOOK", "INSTAGRAM", "TIKTOK"];

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

      const response = await fetch("/api/ac/config/test", {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-4">
        <div className="flex flex-col space-y-16">
          {/* Header Section */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                Multi-Platform Automation Configuration
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed font-light">
                Configure your social media automation settings across multiple platforms. Engage authentically with your audience while maintaining your brand voice. Maximum {MAX_LIKES} likes and {MAX_COMMENTS} comments per platform per run.
              </p>
            </div>

            {/* Progress Steps */}
            <div className="flex flex-wrap items-center gap-3">
              {tabSequence.map((tab, index) => (
                <React.Fragment key={tab}>
                  <button
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === tab
                      ? "bg-[#0C9488] text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
                      }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeTab === tab ? "bg-white/20" : "bg-gray-100"
                      }`}>
                      {index + 1}
                    </span>
                    <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                  </button>
                  {index < tabSequence.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-gray-300 hidden sm:block" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-900 mb-1">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {runtimeWarning && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-900 mb-1">Notice</h3>
                  <p className="text-amber-700">{runtimeWarning}</p>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="space-y-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <Tabs
                  defaultValue="general"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  {/* General Tab */}
                  <TabsContent value="general" className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Primary Configuration Card */}
                      <div className="lg:col-span-7">
                        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 group">
                          <div className="space-y-8">
                            <div className="space-y-6">
                              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                                Global Settings
                              </h2>
                              <p className="text-lg text-gray-600 leading-relaxed font-light">
                                Configure your license, platform selection, and core automation settings that apply across all platforms.
                              </p>
                            </div>



                            <div className="space-y-6">
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
                        </div>
                      </div>



                      {/* Feature Cards */}
                      <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                          <div className="space-y-6">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-10 h-10 bg-[#CBFBF1] rounded-xl flex items-center justify-center">
                                <MessageSquare className="h-6 w-6 text-[#0C9488]" />
                              </div>
                              <h3 className="text-xl font-bold text-gray-900">Content Options</h3>
                            </div>

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


                        {/* <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
                          <div className="flex items-start gap-5">
                            <div className="flex-shrink-0 w-14 h-14 bg-[#CBFBF1] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <Sparkles className="h-7 w-7 text-[#0C9488]" />
                            </div>
                            <div className="space-y-3">
                              <h3 className="text-xl font-bold text-gray-900">Brand Voice Integration</h3>
                              <p className="text-gray-600 leading-relaxed font-light">Maintain consistent messaging across all platforms using your trained brand voice.</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
                          <div className="flex items-start gap-5">
                            <div className="flex-shrink-0 w-14 h-14 bg-[#CBFBF1] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <Target className="h-7 w-7 text-[#0C9488]" />
                            </div>
                            <div className="space-y-3">
                              <h3 className="text-xl font-bold text-gray-900">Keyword Targeting</h3>
                              <p className="text-gray-600 leading-relaxed font-light">Engage with specific topics and conversations relevant to your brand and industry.</p>
                            </div>
                          </div>
                        </div> */}

                        {/* Content Options Card */}

                      </div>
                    </div>
                  </TabsContent>

                  {/* Platforms Tab */}
                  <TabsContent value="platforms" className="space-y-8">
                    <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-gray-100">
                      <div className="space-y-8">
                        <div className="space-y-6">
                          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                            Platform Configuration
                          </h2>
                          <p className="text-lg text-gray-600 leading-relaxed font-light">
                            Customize engagement settings, keyword targeting, and interaction limits for each enabled platform.
                          </p>
                        </div>

                        {!hasAvailableLicenses ? (
                          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
                            <div className="flex items-start space-x-4">
                              <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <AlertCircle className="h-6 w-6 text-amber-600" />
                              </div>
                              <div className="space-y-3">
                                <h3 className="text-xl font-bold text-amber-900">License Required</h3>
                                <p className="text-amber-700 leading-relaxed">
                                  Auto-commenter is restricted to paid users only. Please purchase a license from the plans page to access platform configuration.
                                </p>
                              </div>
                            </div>
                          </div>
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
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row justify-between gap-4">
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
                    className="px-6 py-3 bg-white hover:bg-gray-50 border-gray-200 font-semibold rounded-xl"
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
                      disabled={activeTab === "general" && !hasAvailableLicenses}
                      className="px-6 py-3 bg-[#0C9488] hover:bg-[#02C1C5] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      Next
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="px-6 py-3 bg-[#0C9488] hover:bg-[#02C1C5] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Saving Configuration...
                        </>
                      ) : (
                        <>
                          Save Configuration
                          <SaveAllIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedInAutomationConfig;