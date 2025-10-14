"use client";
import React, { useState, useEffect, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Save, Loader2, AlertCircle } from "lucide-react";
// import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useToast } from "@repo/ui/hooks/use-toast";
// UI Components
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
import PromptSelector from "./components/PromptSelector";
import FormSkeleton from "./components/FormSkeleton";
import { MAX_COMMENTS, MAX_LIKES } from "./utils";
import CombinedInteractions from "./components/CombinedInteractions";

// Sample custom prompt template
const SAMPLE_CUSTOM_PROMPT = {
  id: "default-prompt",
  title: "Professional Engagement",
  text: "Engage with this post in a professional manner, highlighting relevant industry insights and asking thoughtful questions that demonstrate expertise in the subject matter.",
};

// Interface for license type
interface License {
  id: string;
  key: string;
  name: string;
  status: string;
}

// Placeholder for the form schema - importing from the actual validation schema
const linkedinConfigurationFormSchema = z.object({
  platform: z.string(),
  useBrandVoice: z.boolean(),
  promoteProduct: z.boolean(),
  productDetails: z.string().optional(),
  feedInteractions: z.object({
    numLikes: z.number().min(0).max(MAX_LIKES),
    numComments: z.number().min(0).max(MAX_COMMENTS),
  }),
  keywordTargets: z.array(
    z.object({
      keyword: z.string().min(1),
      numLikes: z.number().min(0),
      numComments: z.number().min(0),
    })
  ),
});

// Extend the schema with additional fields
const updatedLinkedinConfigurationFormSchema =
  linkedinConfigurationFormSchema.extend({
    licenseKey: z.string().optional(),
    promptMode: z.enum(["automatic", "custom"]).default("automatic"),
    // Now customPrompts is just an array with a maximum of 1 item
    customPrompts: z
      .array(
        z.object({
          id: z.string(),
          title: z.string(),
          text: z.string().min(10, "Prompt must be at least 10 characters"),
        })
      )
      .max(1)
      .optional(),
    selectedCustomPromptId: z.string().optional(),
  });

// Type for form values based on the schema
export type FormValues = z.infer<typeof updatedLinkedinConfigurationFormSchema>;

const LinkedInAutomationConfig = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableLicenses, setAvailableLicenses] = useState<License[]>([]);
  const [isLoadingLicenses, setIsLoadingLicenses] = useState(true);
  const [runtimeWarning, setRuntimeWarning] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("general");
  const tabSequence = ["general", "content", "interactions"];
  const { toast } = useToast();

  // New state variables for brand voice data
  const [brandVoiceData, setBrandVoiceData] = useState(null);
  const [isBrandVoiceLoading, setIsBrandVoiceLoading] = useState(false);
  const [brandVoiceError, setBrandVoiceError] = useState<string | null>(null);

  // Set default form values
  const defaultValues: FormValues = {
    platform: "linkedin",
    useBrandVoice: false,
    promoteProduct: false,
    productDetails: "",
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
    licenseKey: "",
    promptMode: "automatic",
    customPrompts: [], // Start with no custom prompts
    selectedCustomPromptId: "", // No selected prompt ID initially
  };

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(updatedLinkedinConfigurationFormSchema),
    defaultValues,
    mode: "onChange",
  });

  // Calculate total interactions
  const calculateTotalInteractions = (formValues: any) => {
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
  };

  // Function to fetch brand voice data
  const fetchBrandVoiceStatus = useCallback(async () => {
    if (isLoadingLicenses || !availableLicenses || availableLicenses.length === 0) {
      return;
    }
    
    setIsBrandVoiceLoading(true);
    setBrandVoiceError(null);
    
    try {
      const license = availableLicenses.find(license => license.id === availableLicenses[0].id);
      
      if (!license) {
        throw new Error("License not found");
      }
      
      const response = await fetch(`/api/license-key/${license.key}/custom-knowledge`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch brand voice status");
      }
      
      const data = await response.json();
      setBrandVoiceData(data);
    } catch (error) {
      console.error("Error checking brand voice status:", error);
      setBrandVoiceError(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setIsBrandVoiceLoading(false);
    }
  }, [availableLicenses, isLoadingLicenses]);

  // Fetch brand voice data when licenses are available
  useEffect(() => {
    if (isLoadingLicenses || !availableLicenses || availableLicenses.length === 0) {
      return;
    }
    
    fetchBrandVoiceStatus();
  }, [availableLicenses, isLoadingLicenses, fetchBrandVoiceStatus]);

  // Watch for changes in interactions to monitor limits
  useEffect(() => {
    const subscription = form.watch((values) => {
      // Check for interaction limits
      const { totalLikes, totalComments } = calculateTotalInteractions(values);

      // Set warning if limits are exceeded
      if (totalLikes > MAX_LIKES || totalComments > MAX_COMMENTS) {
        setRuntimeWarning(
          `You've exceeded the maximum interaction limits: ${totalLikes}/${MAX_LIKES} likes, ${totalComments}/${MAX_COMMENTS} comments.`
        );
      } else if (
        runtimeWarning &&
        runtimeWarning.includes("maximum interaction limits")
      ) {
        // Clear interaction warnings if they exist and limits are no longer exceeded
        setRuntimeWarning(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, runtimeWarning]);

  // Watch for changes in prompts
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name?.includes("customPrompts") && type === "change") {
        // Re-validate the form when custom prompt changes
        form.trigger("customPrompts");

        // Clear runtime warning if we have a valid prompt
        const customPrompts = form.getValues("customPrompts") || [];
        if (
          customPrompts.length > 0 &&
          customPrompts[0].text &&
          customPrompts[0].text.trim().length >= 10 &&
          runtimeWarning &&
          !runtimeWarning.includes("maximum interaction limits")
        ) {
          setRuntimeWarning(null);
        }

        // Always set selectedCustomPromptId to the first prompt's ID
        if (customPrompts.length > 0 && customPrompts[0].id) {
          form.setValue("selectedCustomPromptId", customPrompts[0].id);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, runtimeWarning]);

  // Watch form fields
  const watchPromoteProduct = form.watch("promoteProduct");
  const watchPromptMode = form.watch("promptMode");
  
  // Check if licenses are available
  const hasAvailableLicenses = !isLoadingLicenses && availableLicenses.length > 0;

  // Fetch existing configuration
  useEffect(() => {
    async function fetchConfig() {
      setIsFetching(true);
      setError(null);
      try {
        const response = await fetch("/api/ac/config?platform=LINKEDIN");

        if (!response.ok) {
          throw new Error("Failed to fetch configuration");
        }

        const { data, availableLicenses: licenses } = await response.json();

        // Set available licenses if returned from the API
          setAvailableLicenses(licenses);
          setIsLoadingLicenses(false);

        if (data) {
          // Transform data to match form structure
          let customPrompts: any[] = [];

          // If there are custom prompts in the data, take only the first one
          if (data.customPrompts && data.customPrompts.length > 0) {
            customPrompts = [data.customPrompts[0]];
          }

          const formData = {
            platform: data.platform.toLowerCase(),
            useBrandVoice: data.useBrandVoice || false,
            promoteProduct: data.promoteProduct || false,
            productDetails: data.productDetails || "",
            feedInteractions: {
              numLikes: data.feedInteractions?.numLikes || 5,
              numComments: data.feedInteractions?.numComments || 5,
            },
            keywordTargets:
              data.keywordTargets && data.keywordTargets.length > 0
                ? data.keywordTargets
                : [{ keyword: "#sales", numLikes: 5, numComments: 3 }],
            licenseKey: data.licenseKey || "",
            promptMode: data.promptMode || "automatic",
            customPrompts: customPrompts,
            selectedCustomPromptId:
              customPrompts.length > 0 ? customPrompts[0].id : "",
          };

          // Reset form with fetched data
          form.reset(formData);

          // Check if the loaded data exceeds our limits
          const { totalLikes, totalComments } =
            calculateTotalInteractions(formData);
          if (totalLikes > MAX_LIKES || totalComments > MAX_COMMENTS) {
            setRuntimeWarning(
              `Your saved configuration exceeds the new limits of ${MAX_LIKES} likes and ${MAX_COMMENTS} comments. Please adjust your settings.`
            );
          }
        }
      } catch (error) {
        console.error("Error fetching configuration:", error);
        setError(
          "Failed to load your existing configuration. Starting with default settings."
        );
        // Still try to fetch licenses even if config loading fails
      } finally {
        setIsFetching(false);
      }
    }

    fetchConfig();
  }, [form]);


  // Check for required prompts and interaction limits before submitting
  const validateForm = () => {
    // First check interaction limits
    const formValues = form.getValues();
    const { totalLikes, totalComments } =
      calculateTotalInteractions(formValues);

    if (totalLikes > MAX_LIKES) {
      setRuntimeWarning(
        `You've exceeded the maximum limit of ${MAX_LIKES} likes. Please reduce the number of likes.`
      );
      return false;
    }

    if (totalComments > MAX_COMMENTS) {
      setRuntimeWarning(
        `You've exceeded the maximum limit of ${MAX_COMMENTS} comments. Please reduce the number of comments.`
      );
      return false;
    }

    // Then check prompt requirements for custom mode
    if (formValues.promptMode === "custom") {
      const customPrompts = formValues.customPrompts || [];

      if (customPrompts.length === 0) {
        setRuntimeWarning("Please create a custom prompt before saving");
        return false;
      }

      // Check if the custom prompt has valid content
      const customPrompt = customPrompts[0];
      if (
        !customPrompt ||
        !customPrompt.text ||
        customPrompt.text.trim().length < 10
      ) {
        setRuntimeWarning(
          "Your custom prompt must have at least 10 characters"
        );
        return false;
      }

      // Set the selectedCustomPromptId to the only prompt's ID if not already set
      if (!formValues.selectedCustomPromptId && customPrompts.length > 0) {
        form.setValue("selectedCustomPromptId", customPrompts[0].id);
      }
    }

    setRuntimeWarning(null);
    return true;
  };

  // Handle form submission
  async function onSubmit(data: FormValues) {
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Get the single custom prompt if it exists
      const customPrompt =
        data.customPrompts && data.customPrompts.length > 0
          ? data.customPrompts[0]
          : null;

      // Transform form data to match API schema
      const apiData = {
        platform: data.platform.toUpperCase(),
        isEnabled: true, // Enable by default when saving
        useBrandVoice: data.useBrandVoice,
        promoteProduct: data.promoteProduct,
        productDetails: data.productDetails,
        feedInteractions: data.feedInteractions,
        postsPerDay: data.feedInteractions.numComments, // Use comment count as postsPerDay
        action: ["COMMENT"], // Default to COMMENT action
        timeInterval: 5, // Default time interval in hours
        // Process hashtags from keyword targets
        hashtags: data.keywordTargets
          .map((target) => target.keyword)
          .filter((kw) => kw.startsWith("#"))
          .map((tag) => tag.substring(1).toUpperCase())
          .slice(0, 3), // Max 3 hashtags
        keywordTargets: data.keywordTargets,
        licenseKey: data.licenseKey, // Include the license key ID
        promptMode: data.promptMode,
        // Only send the custom prompt if we're in custom mode and have a prompt
        customPrompts:
          data.promptMode === "custom" && customPrompt ? [customPrompt] : [],
        selectedCustomPromptId:
          data.promptMode === "custom" && customPrompt ? customPrompt.id : "",
      };

      // Submit to API
      const response = await fetch("/api/ac/config", {
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

      // Success!
      // toast.success("Configuration saved successfully!");
      toast({
        title: "Success",
        description: "Configuration saved successfully!",
        variant: "default", // You can use "default" for success
      });

      // Refresh the page data
      router.refresh();
    } catch (error: any) {
      console.error("Error saving configuration:", error);
      // toast.error(error.message || "Failed to save configuration");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save configuration",
      });
      setError(error.message || "Failed to save configuration");
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
            LinkedIn Automation Configuration
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg mt-2">
            Configure your social media automation settings for engagement and
            promotion. Maximum {MAX_LIKES} likes and {MAX_COMMENTS} comments per
            run.
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
                  <div className="mb-4 sm:mb-6">
                    <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
                      <TabsTrigger value="general">General</TabsTrigger>
                      <TabsTrigger value="content" disabled={!hasAvailableLicenses}>
                        Content
                      </TabsTrigger>
                      <TabsTrigger value="interactions" disabled={!hasAvailableLicenses}>
                        Interactions
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* General Tab */}
                  <TabsContent
                    value="general"
                    className="space-y-4 sm:space-y-6"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div className="border border-gray-100 rounded-lg p-3 sm:p-4 bg-white shadow-sm">
                        <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">
                          Platform Settings
                        </h3>
                        <div className="space-y-4">
                          {/* <PlatformSelector control={form.control} /> */}
                          <LicenseSelector
                            control={form.control}
                            isLoadingLicenses={isLoadingLicenses}
                            availableLicenses={availableLicenses}
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

                  {/* Content Tab */}
                  <TabsContent
                    value="content"
                    className="space-y-4 sm:space-y-6"
                  >
                    {!hasAvailableLicenses ? (
                      <Alert className="border-amber-200 bg-amber-50">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertTitle className="text-amber-600">License Required</AlertTitle>
                        <AlertDescription className="text-amber-700">
                          Auto-commenter is restricted to paid users only. Please purchase a license from the
                          plans page to access content configuration.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="border border-gray-100 rounded-lg p-3 sm:p-4 bg-white shadow-sm">
                        <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">
                          Response Configuration
                        </h3>
                        <PromptSelector
                          control={form.control}
                          setValue={form.setValue}
                          getValues={form.getValues}
                          register={form.register}
                          watch={form.watch}
                          defaultPrompts={[SAMPLE_CUSTOM_PROMPT]}
                        />
                      </div>
                    )}
                  </TabsContent>

                  {/* Interactions Tab */}
                  <TabsContent
                    value="interactions"
                    className="space-y-4 sm:space-y-6"
                  >
                    {!hasAvailableLicenses ? (
                      <Alert className="border-amber-200 bg-amber-50">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertTitle className="text-amber-600">License Required</AlertTitle>
                        <AlertDescription className="text-amber-700">
                          Auto-commenter is restricted to paid users only. Please purchase a license from the
                          plans page to access interaction configuration.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="border border-gray-100 rounded-lg p-3 sm:p-4 bg-white shadow-sm">
                        <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">
                          Engagement Configuration
                        </h3>
                        <CombinedInteractions
                          control={form.control}
                          getValues={form.getValues}
                          setValue={form.setValue}
                          watch={form.watch}
                          register={form.register}
                        />
                      </div>
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

                  {activeTab !== "interactions" ? (
                    <Button
                      type="button"
                      onClick={(e) => {
                        // Prevent form submission
                        e.preventDefault();
                        const currentIndex = tabSequence.indexOf(activeTab);
                        if (currentIndex < tabSequence.length - 1) {
                          setActiveTab(tabSequence[currentIndex + 1]);
                        }
                      }}
                      disabled={activeTab === "general" && !hasAvailableLicenses}
                      className="px-4 sm:px-6 py-2 bg-gray-900 hover:bg-gray-800 w-full sm:w-auto"
                    >
                      Next
                    </Button>
                  ) : null}
                </div>

                {activeTab === "interactions" && (
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
                )}
              </form>
            </Form>
          </CardContent>
          <CardFooter className="border-t border-gray-100 py-2 sm:py-3 flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              Configuration last updated: 25/03/2025, 13:11:24
            </p>
            <p className="text-xs font-medium text-center sm:text-left">
              Limits: 10 comments, 10 likes per run
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LinkedInAutomationConfig;