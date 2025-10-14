// types/onboarding.ts
export const STEPS = {
    WELCOME: 0,
    TEXT_SELECTION: 1,
    LICENSE_ACTIVATION: 2,
    LLM_SELECTION: 3,
    COMPLETION_WEBSITES: 4,
    COMPLETION: 5
} as const;

export type StepType = typeof STEPS[keyof typeof STEPS];
export type LLMVendor = 'olly' | 'openai' | 'anthropic' | 'google' | 'other';

export interface OnboardingData {
    role: string;
    roleOther?: string;
    businessType?: string;
    primaryPlatform: string;
    primaryPlatformOther?: string;
    engagementGoal: string;
    contentFrequency: string;
    commentFrequency: string;
    companySize: string;
    aiExperience?: string;
    painPoints: string[];
    customPainPoint?: string;
    biggestChallenge?: string;
    industry?: string;
    referralSource?: string;
}

export interface StepProps {
    onNext: () => void;
    onSkip?: () => void;
    onBack?: () => void;
    isLoading?: boolean;
    isConnected?: boolean;
}

export interface QuestionnaireStepProps extends StepProps {
    onSubmit: (data: OnboardingData) => Promise<void>;
}