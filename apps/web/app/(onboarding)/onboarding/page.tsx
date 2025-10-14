"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { STEPS, StepType } from "@/types/onboarding";
import { OnboardingProgress } from "../_components/progress";
import ChromeExtensionStep from "../_components/chrome-extension";
import TextSelectionStep from "../_components/how-to-use";
import LicenseActivationStep from "../_components/license-activation";
import LLMSelectionStep from "../_components/llm-selection";
import QuestionnaireStep from "../_components/onboarding-form";
import { OnboardingData } from "@/app/(auth)/_components/onboarding-form";
import { STEPS_ARRAY } from "@/lib/steps";
import { Button } from "@repo/ui/components/ui/button";
import OnboardingSkeleton from "../_components/sub-components/onboarding-skeleton";
import { SkipConfirmationDialog } from "../_components/skip-confirmation-dialog";
import WelcomeStep from "../_components/welcome";
import { useMediaQuery } from "@/hooks/use-media-query";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert";
import CompletionStep from "../_components/completion-step";

interface User {
  id: string;
  email: string;
  username: string;
  onboardingComplete?: boolean; 
}

interface AuthResponse {
  authenticated: boolean;
  user: User | null;
}

const isValidStep = (step: number): step is StepType => {
  return step >= STEPS.WELCOME && step <= STEPS.COMPLETION_WEBSITES;
};

// Additional validation function to check if a step is in the current flow
const isActiveStep = (step: number): boolean => {
  const activeSteps = [
    STEPS.WELCOME,
    STEPS.TEXT_SELECTION,
    STEPS.LICENSE_ACTIVATION,
    STEPS.LLM_SELECTION,
    STEPS.COMPLETION_WEBSITES,
  ] as const;
  return activeSteps.includes(step as any);
};

// Map step numbers to their names for better tracking
const STEP_NAMES: Record<number, string> = {
  [STEPS.WELCOME]: "welcome",
  [STEPS.TEXT_SELECTION]: "text_selection",
  [STEPS.LICENSE_ACTIVATION]: "license_activation",
  [STEPS.LLM_SELECTION]: "llm_selection",
  [STEPS.COMPLETION_WEBSITES]: "completion_websites",
  [STEPS.COMPLETION]: "completion",
};

// Actual step labels for UI
const STEPS_DATA = [
  { step: STEPS.WELCOME, label: "Get Started" },
  { step: STEPS.TEXT_SELECTION, label: "How to Use" },
  { step: STEPS.LICENSE_ACTIVATION, label: "Activation" },
  { step: STEPS.LLM_SELECTION, label: "AI Setup" },
  { step: STEPS.COMPLETION_WEBSITES, label: "Ready to Use" },
];

export default function OnboardingStepper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [currentStep, setCurrentStep] = useState<StepType>(STEPS.WELCOME);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now());
  const [onboardingStartTime, setOnboardingStartTime] = useState<number>(
    Date.now(),
  );
  const [skippedSteps, setSkippedSteps] = useState<number[]>([]);
  const [llmSelectionLoading, setLlmSelectionLoading] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isExtensionLogin, setIsExtensionLogin] = useState<boolean>(false);
  const [redirecting, setRedirecting] = useState(false);
  const [completionLoading, setCompletionLoading] = useState(false);

  useEffect(() => {


    const initializeOnboarding = async () => {
      try {
        const authResponse = await fetch("/api/user/auth");
        const authData: AuthResponse = await authResponse.json();

        if (!authData.authenticated || !authData.user) {
          router.push("/login");
          return;
        }

        // If onboarding is complete, redirect to dashboard
        if (authData.user.onboardingComplete) {
          setRedirecting(true);
          router.push("/dashboard");
          return;
        }

        setUser(authData.user);

        // Check for query parameters
        const stepParam = searchParams.get("step");
        const isConnectedParam = searchParams.get("isConnected");
        const isExtensionLoginParam = searchParams.get("isExtensionLogin");

        // Set states based on URL parameters
        setIsConnected(isConnectedParam === "true");
        setIsExtensionLogin(isExtensionLoginParam === "true");

        // Handle step parameter
        if (stepParam && !isNaN(parseInt(stepParam))) {
          const stepNumber = parseInt(stepParam);
          // If step is 1, start from TEXT_SELECTION
          if (stepNumber === 1) {
            setCurrentStep(STEPS.TEXT_SELECTION);
            await updateProgress(STEPS.TEXT_SELECTION);
            setIsLoading(false);
            return;
          }
        }

        // If both isConnected and isExtensionLogin are true, continue with normal flow
        // The skipping will be handled in handleNext
        const progressResponse = await fetch("/api/user/onboarding/progress");
        if (progressResponse.ok) {
          const data = await progressResponse.json();
          if (data.currentStep !== undefined && isValidStep(data.currentStep)) {
            const step = data.currentStep as StepType;
            // On mobile, skip welcome step and start from TEXT_SELECTION
            if (isMobile && step === STEPS.WELCOME) {
              setCurrentStep(STEPS.TEXT_SELECTION);
              await updateProgress(STEPS.TEXT_SELECTION);
            } else {
              setCurrentStep(step);
            }
          } else {
            // On mobile, start from TEXT_SELECTION instead of WELCOME
            const initialStep = isMobile ? STEPS.TEXT_SELECTION : STEPS.WELCOME;
            setCurrentStep(initialStep);
            await updateProgress(initialStep);
          }
        } else {
          // On mobile, start from TEXT_SELECTION instead of WELCOME
          const initialStep = isMobile ? STEPS.TEXT_SELECTION : STEPS.WELCOME;
          setCurrentStep(initialStep);
          await updateProgress(initialStep);
        }

        setOnboardingStartTime(Date.now());
        setStepStartTime(Date.now());
      } catch (error) {
        console.error("Error initializing onboarding:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    initializeOnboarding();
  }, [router, searchParams]);

  // Reset step start time whenever step changes
  useEffect(() => {
    const stepName = STEP_NAMES[currentStep] || `unknown_step_${currentStep}`;
    setStepStartTime(Date.now());

    // Track when user views a step
    if (user?.id && !isLoading) {
    }
  }, [currentStep, user, isLoading]);

  const updateProgress = async (step: number, isCompleted?: boolean) => {
    if ((!isValidStep(step) && step !== STEPS.COMPLETION) || !user) {
      console.warn(`Attempted to update progress to invalid step: ${step}`);
      return null;
    }

    const stepName = STEP_NAMES[step] || `unknown_step_${step}`;

    try {
      // Don't allow going back to welcome step once we've moved past it
      if (step === STEPS.WELCOME && currentStep > STEPS.WELCOME) {
        return null;
      }

      // Don't allow updating to non-existent steps in our active flow (like CHROME_EXTENSION)
      if (!isActiveStep(step) && step !== STEPS.COMPLETION) {
        console.warn(`Prevented updating to inactive step: ${step}`);
        return null;
      }

      const response = await fetch("/api/user/onboarding/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step,
          isCompleted: isCompleted || step === STEPS.COMPLETION,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          const authCheck = await fetch("/api/user/auth");
          const authData: AuthResponse = await authCheck.json();

          if (!authData.authenticated) {
            router.push("/login");
            return null;
          }
        }
        console.error(
          "Error response from progress API:",
          response.status,
          response.statusText,
        );
        return null;
      }

      // Return the response data
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error("Error updating progress:", error);
      return null;
    }
  };

  const handleNext = async () => {
    if (!user) return;

    const timeSpent = (Date.now() - stepStartTime) / 1000;

    // Check if we're on TEXT_SELECTION step and should skip LICENSE_ACTIVATION and LLM_SELECTION
    if (
      currentStep === STEPS.TEXT_SELECTION &&
      isConnected &&
      isExtensionLogin
    ) {
      setCurrentStep(STEPS.COMPLETION_WEBSITES);
      await updateProgress(STEPS.COMPLETION_WEBSITES);
      return;
    }

    // Normal flow mapping
    const nextStepMap: Record<number, number> = {
      [STEPS.WELCOME]: STEPS.TEXT_SELECTION,
      [STEPS.TEXT_SELECTION]:
        isConnected && isExtensionLogin
          ? STEPS.COMPLETION_WEBSITES
          : STEPS.LICENSE_ACTIVATION,
      [STEPS.LICENSE_ACTIVATION]: STEPS.LLM_SELECTION,
      [STEPS.LLM_SELECTION]: STEPS.COMPLETION_WEBSITES,
      [STEPS.COMPLETION_WEBSITES]: STEPS.COMPLETION,
    };

    const nextStep = nextStepMap[currentStep] || currentStep + 1;

    if (nextStep <= STEPS.COMPLETION_WEBSITES) {
      setCurrentStep(nextStep as StepType);
      await updateProgress(nextStep);
    } else {
      // Show loading only for the last step's Next button
      setCompletionLoading(true);
      await completeOnboarding();
      setCompletionLoading(false);
    }
  };

  const handleSkipClick = () => {
    setShowSkipDialog(true);

    // Track skip dialog shown
  };

  const handleSkipConfirm = async () => {
    setShowSkipDialog(false);

    // Add current and remaining steps to skipped steps list
    const newSkippedSteps = [];
    for (let i = currentStep; i <= STEPS.COMPLETION_WEBSITES; i++) {
      newSkippedSteps.push(i);
    }
    setSkippedSteps([...skippedSteps, ...newSkippedSteps]);

    // Log the skip action more explicitly
    console.log(
      "User confirmed skipping onboarding, marking steps as skipped:",
      newSkippedSteps,
    );

    // Track skip confirmation

    // Show loading state
    setIsLoading(true);

    try {
      // First, call the onboarding API directly with skipped:true
      // This ensures the user's onboardingComplete is properly set in the database
      const skipResponse = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skipped: true }),
      });

      console.log("Skip onboarding API response:", skipResponse.status);

      if (!skipResponse.ok) {
        console.error(
          "Error when skipping onboarding:",
          await skipResponse.text(),
        );
      }

      // Also update the progress for good measure
      await updateProgress(STEPS.COMPLETION, true);

      // Track onboarding completion

      // Add a delay to ensure backend processes complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Double-check if onboarding is marked as complete
      const checkResponse = await fetch("/api/user/auth");
      const userData = await checkResponse.json();

      console.log(
        "User data after skip:",
        userData.user?.onboardingComplete
          ? "Onboarding complete"
          : "Onboarding incomplete",
      );

      // Then redirect to dashboard
      setRedirecting(true);
      router.push("/dashboard");
    } catch (error) {
      console.error(
        "Failed to complete onboarding after skip confirmation:",
        error,
      );
      // Force redirect even if there's an error
      setRedirecting(true);
      router.push("/dashboard");
    } finally {
      // Reset loading state in case we don't redirect
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;

    try {
      // Mark onboarding as complete with retries
      let success = false;
      let attempts = 0;
      const maxAttempts = 3;

      while (!success && attempts < maxAttempts) {
        attempts++;
        try {
          const response = await updateProgress(STEPS.COMPLETION, true);
          console.log(
            `Onboarding completion API response (attempt ${attempts}):`,
            response,
          );

          // Add a small delay to ensure the backend has processed the update
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Double-check if onboarding is marked as complete
          const checkResponse = await fetch("/api/user/auth");
          const userData = await checkResponse.json();

          if (userData.user?.onboardingComplete) {
            console.log("Onboarding successfully marked as complete!");
            // Set onboarded flag in localStorage
            if (typeof window !== "undefined") {
              localStorage.setItem("olly_onboarded", "true");
            }
            success = true;
          } else {
            console.warn(
              `Onboarding not marked as complete on attempt ${attempts}`,
            );

            // If we're on the last attempt, also try the direct API call
            if (attempts === maxAttempts - 1) {
              console.log(
                "Trying alternate method to mark onboarding complete...",
              );

              await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            // Only retry if we haven't reached max attempts
            if (attempts < maxAttempts) {
              console.log(
                `Retrying onboarding completion (attempt ${attempts + 1}/${maxAttempts})...`,
              );
              await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait longer between retries
            }
          }
        } catch (retryError) {
          console.error(
            `Error during completion attempt ${attempts}:`,
            retryError,
          );
          if (attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }

      // Then redirect to dashboard
      setRedirecting(true);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);

      // Force completion as a last resort
      try {
        console.log("Attempting force completion as fallback...");

        // First try the progress API
        await fetch("/api/user/onboarding/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            step: STEPS.COMPLETION,
            isCompleted: true,
          }),
        });

        // Then try the direct onboarding API as well
        await fetch("/api/user/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            skipped: skippedSteps.length > 0,
          }),
        });

        // Set onboarded flag in localStorage as a fallback
        if (typeof window !== "undefined") {
          localStorage.setItem("olly_onboarded", "true");
        }

        // Add a longer delay for the last-resort attempt
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (forceError) {
        console.error("Force completion also failed:", forceError);
      }

      setRedirecting(true);
      router.push("/dashboard"); // Fallback redirect
    }
  };

  const handleBack = () => {
    if (!user) return;

    // Calculate time spent on current step
    const timeSpent = (Date.now() - stepStartTime) / 1000; // in seconds

    // Track when user goes back

    if (currentStep > STEPS.WELCOME) {
      const prevStep = currentStep - 1;
      if (isValidStep(prevStep)) {
        setCurrentStep(prevStep as StepType);
        updateProgress(prevStep);
      }
    }
  };

  const handleOnboardingSubmit = async (data: OnboardingData) => {
    if (!user) return;

    try {
      // Track questionnaire submission with relevant data
      // Filter out any sensitive information
      const trackingData = {
        role: data.role,
        company_size: data.companySize,
        // Do not include user-specific identifiable information
      };

      const response = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          const authCheck = await fetch("/api/user/auth");
          const authData: AuthResponse = await authCheck.json();

          if (!authData.authenticated) {
            router.push("/login");
            return;
          }
        }
        throw new Error("Onboarding submission failed");
      }

      // Update user profile in Mixpanel with non-sensitive questionnaire data

      // Track completion of the questionnaire step specifically

      // Explicitly set the next step to TEXT_SELECTION after questionnaire
      const nextStep = STEPS.TEXT_SELECTION;
      setCurrentStep(nextStep);
      await updateProgress(nextStep);
    } catch (error) {
      console.error("Onboarding error:", error);

      // Track error
    }
  };

  const handleLLMSelection = async () => {
    setLlmSelectionLoading(true);
    // Track completion of the LLM selection step

    try {
      await completeOnboarding();
    } catch (error) {
      console.error("Error completing onboarding after LLM selection:", error);
      // Force redirect even if there's an error
      router.push("/dashboard");
    } finally {
      setLlmSelectionLoading(false);
    }
  };

  if (redirecting) {
    return <OnboardingSkeleton />;
  }

  if (isLoading) {
    return <OnboardingSkeleton />;
  }

  if (!user) {
    return null;
  }

  // For mobile devices, start from step 2 (TEXT_SELECTION) and skip welcome step
  if (isMobile) {
    // Set initial step to TEXT_SELECTION if not already set
    const mobileCurrentStep = currentStep === STEPS.WELCOME ? STEPS.TEXT_SELECTION : currentStep;
    
    const getMobileStepLabel = () => {
      const stepData = STEPS_DATA.find((s) => s.step === mobileCurrentStep);
      return stepData ? stepData.label : "Onboarding";
    };

    const getMobileStepIndex = () => {
      // For mobile, start counting from TEXT_SELECTION as step 1
      const mobileStepMapping: Record<number, number> = {
        [STEPS.TEXT_SELECTION]: 0, // Step 1: How to Use
        [STEPS.LICENSE_ACTIVATION]: 1, // Step 2: Activation
        [STEPS.LLM_SELECTION]: 2, // Step 3: AI Setup
        [STEPS.COMPLETION_WEBSITES]: 3, // Step 4: Ready to Use
      };

      return mobileStepMapping[mobileCurrentStep] !== undefined
        ? mobileStepMapping[mobileCurrentStep]
        : 0;
    };

    const mobileTotalSteps = 4; // TEXT_SELECTION, LICENSE_ACTIVATION, LLM_SELECTION, COMPLETION_WEBSITES
    const mobileStepIndex = getMobileStepIndex();

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
        <div className="max-w-full mx-auto px-4 py-6 flex flex-col" style={{ minHeight: "100vh" }}>
          {/* Mobile header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Welcome to Olly! 👋
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Let's get you set up
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleSkipClick}
              className="text-muted-foreground text-sm px-3 py-1"
              size="sm"
            >
              Skip
            </Button>
          </div>

          {/* Mobile step header */}
          <div className="mb-3">
            <h2 className="text-lg font-medium text-gray-800">
              {getMobileStepLabel()}
            </h2>
            <p className="text-xs text-muted-foreground">
              Step {mobileStepIndex + 1} of {mobileTotalSteps}
            </p>
          </div>

          {/* Mobile progress bar */}
          <div className="mb-4">
            <OnboardingProgress
              currentStep={mobileStepIndex}
              totalSteps={mobileTotalSteps}
            />
          </div>

          {/* Mobile main content */}
          <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden mb-4 flex-grow">
            <div className="p-4 h-full flex flex-col">
              <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 240px)" }}>
                {mobileCurrentStep === STEPS.TEXT_SELECTION && (
                  <TextSelectionStep
                    onNext={handleNext}
                    onBack={() => {
                      // On mobile, go to dashboard instead of back to welcome
                      router.push("/dashboard");
                    }}
                    isConnected={isConnected}
                  />
                )}

                {mobileCurrentStep === STEPS.LICENSE_ACTIVATION && (
                  <LicenseActivationStep
                    onNext={handleNext}
                    onBack={() => {
                      setCurrentStep(STEPS.TEXT_SELECTION);
                      updateProgress(STEPS.TEXT_SELECTION);
                    }}
                    isConnected={isConnected}
                  />
                )}

                {mobileCurrentStep === STEPS.LLM_SELECTION && (
                  <LLMSelectionStep
                    onNext={handleLLMSelection}
                    onBack={() => {
                      setCurrentStep(STEPS.LICENSE_ACTIVATION);
                      updateProgress(STEPS.LICENSE_ACTIVATION);
                    }}
                    isLoading={llmSelectionLoading}
                    isConnected={isConnected}
                  />
                )}

                {mobileCurrentStep === STEPS.COMPLETION_WEBSITES && (
                  <CompletionStep onNext={handleNext} isConnected={isConnected} />
                )}
              </div>
            </div>
          </div>

          {/* Mobile navigation buttons */}
          <div className="flex justify-between mt-auto py-2">
            <Button
              variant="outline"
              onClick={() => {
                if (mobileCurrentStep === STEPS.TEXT_SELECTION) {
                  router.push("/dashboard");
                } else {
                  handleBack();
                }
              }}
              className="w-24 text-sm"
              size="sm"
            >
              {mobileCurrentStep === STEPS.TEXT_SELECTION ? "Dashboard" : "Back"}
            </Button>

            <Button
              onClick={handleNext}
              className="w-24 text-sm"
              size="sm"
              disabled={completionLoading && mobileCurrentStep === STEPS.COMPLETION_WEBSITES}
            >
              {completionLoading && mobileCurrentStep === STEPS.COMPLETION_WEBSITES ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Loading
                </span>
              ) : (
                'Next'
              )}
            </Button>
          </div>
        </div>

        <SkipConfirmationDialog
          isOpen={showSkipDialog}
          onClose={() => {
            setShowSkipDialog(false);
          }}
          onConfirm={handleSkipConfirm}
        />
      </div>
    );
  }

  const getCurrentStepLabel = () => {
    const stepData = STEPS_DATA.find((s) => s.step === currentStep);
    return stepData ? stepData.label : "Onboarding";
  };

  const getCurrentStepIndex = () => {
    // Map the application's internal steps to UI display steps (0-based)
    const stepMapping: Record<number, number> = {
      [STEPS.WELCOME]: 0, // Step 1: Get Started (Welcome + Chrome)
      [STEPS.TEXT_SELECTION]: 1, // Step 2: How to Use
      [STEPS.LICENSE_ACTIVATION]: 2, // Step 3: Activation
      [STEPS.LLM_SELECTION]: 3, // Step 4: AI Setup
      [STEPS.COMPLETION_WEBSITES]: 4, // Step 5: Ready to Use
    };

    return stepMapping[currentStep] !== undefined
      ? stepMapping[currentStep]
      : 0;
  };

  const totalVisibleSteps = STEPS_DATA.length;
  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
      <div
        className="max-w-4xl mx-auto px-4 py-8 flex flex-col"
        style={{ minHeight: "100vh" }}
      >
        {/* Welcome header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome to Olly! 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Let's get you set up with everything you need
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleSkipClick}
            className="text-muted-foreground"
          >
            Skip Setup
          </Button>
        </div>

        {/* Step header */}
        <div className="mb-2">
          <h2 className="text-lg font-medium text-gray-800">
            {getCurrentStepLabel()}
          </h2>
          <p className="text-sm text-muted-foreground">
            Step {currentStepIndex + 1} of {totalVisibleSteps}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <OnboardingProgress
            currentStep={currentStepIndex}
            totalSteps={totalVisibleSteps}
          />
        </div>

        {/* Main content area - reduced height to fit everything in view */}
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden mb-6 flex-grow">
          <div className="p-6 h-full flex flex-col">
            <div
              className="overflow-y-auto pr-2"
              style={{ maxHeight: "calc(100vh - 280px)" }}
            >
              {currentStep === STEPS.WELCOME && (
                <WelcomeStep
                  onNext={handleNext}
                  onSkip={() => {
                    setCurrentStep(STEPS.TEXT_SELECTION);
                    updateProgress(STEPS.TEXT_SELECTION);
                  }}
                  isConnected={isConnected}
                />
              )}

              {currentStep === STEPS.TEXT_SELECTION && (
                <TextSelectionStep
                  onNext={handleNext}
                  onBack={handleBack}
                  isConnected={isConnected}
                />
              )}

              {currentStep === STEPS.LICENSE_ACTIVATION && (
                <LicenseActivationStep
                  onNext={handleNext}
                  onBack={handleBack}
                  isConnected={isConnected}
                />
              )}

              {currentStep === STEPS.LLM_SELECTION && (
                <LLMSelectionStep
                  onNext={handleLLMSelection}
                  onBack={handleBack}
                  isLoading={llmSelectionLoading}
                  isConnected={isConnected}
                />
              )}

              {currentStep === STEPS.COMPLETION_WEBSITES && (
                <CompletionStep onNext={handleNext} isConnected={isConnected} />
              )}
            </div>
          </div>
        </div>

        {/* Fixed navigation buttons at the bottom - now sticky */}
        <div className="flex justify-between mt-auto py-3">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === STEPS.WELCOME}
            className="w-28"
          >
            Back
          </Button>

          <Button
            onClick={handleNext}
            className="w-28"
            disabled={completionLoading && currentStep === STEPS.COMPLETION_WEBSITES}
          >
            {completionLoading && currentStep === STEPS.COMPLETION_WEBSITES ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Loading...
              </span>
            ) : (
              'Next'
            )}
          </Button>
        </div>
      </div>

      <SkipConfirmationDialog
        isOpen={showSkipDialog}
        onClose={() => {
          setShowSkipDialog(false);
        }}
        onConfirm={handleSkipConfirm}
      />
    </div>
  );
}
