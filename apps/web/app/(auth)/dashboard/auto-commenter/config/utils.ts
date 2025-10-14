import { Facebook, Instagram, Linkedin, Twitter, Video } from "lucide-react";
import { RiTiktokLine } from "react-icons/ri";

// utils.ts - Updated utility file
export const MAX_COMMENTS = 10;
export const MAX_LIKES = 10;
export const MAX_KEYWORDS = 3;

// Platform configuration
export const PLATFORM_CONFIG = {
  LINKEDIN: {
    name: "LinkedIn",
    description: "Professional networking and business content",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    tabColor: "data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700",
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
    defaultHashtag: "#sales",
    icon: Linkedin,
  },
  TWITTER: {
    name: "Twitter/X",
    description: "Real-time conversations and trending topics",
    color: "bg-gray-100 text-gray-700 border-gray-200",
    tabColor: "data-[state=active]:bg-gray-50 data-[state=active]:text-gray-700",
    bgColor: "bg-gray-100",
    iconColor: "text-gray-600",
    defaultHashtag: "#tech",
    icon: Twitter,
  },
  FACEBOOK: {
    name: "Facebook",
    description: "Social networking and community engagement",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    tabColor: "data-[state=active]:bg-blue-50 data-[state=active]:text-blue-800",
    bgColor: "bg-indigo-100",
    iconColor: "text-indigo-600",
    defaultHashtag: "#business",
    icon: Facebook,
  },
  INSTAGRAM: {
    name: "Instagram",
    description: "Visual content and lifestyle sharing",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    tabColor: "data-[state=active]:bg-purple-50 data-[state=active]:text-purple-800",
    bgColor: "bg-purple-100",
    iconColor: "text-purple-600",
    defaultHashtag: "#lifestyle",
    icon: Instagram,
  },
  TIKTOK: {
    name: "TikTok",
    description: "Short-form video content and viral trends",
    color: "bg-black text-white border-gray-800",
    tabColor: "data-[state=active]:bg-black data-[state=active]:text-white",
    bgColor: "bg-gray-900",
    iconColor: "text-white",
    defaultHashtag: "#viral",
    icon: RiTiktokLine,
  },
} as const;


// Platform settings interface
export interface PlatformSettings {
  feedInteractions: {
    numLikes: number;
    numComments: number;
  };
  keywordTargets: Array<{
    keyword: string;
    numLikes: number;
    numComments: number;
  }>;
  // Add prompt settings
  promptMode?: "automatic" | "custom";
  customPrompts?: Array<{
    id: string;
    title: string;
    text: string;
  }>;
  selectedCustomPromptId?: string;
}

// Utility function to calculate total interactions for a platform
export const calculatePlatformInteractions = (
  platformSettings: PlatformSettings | undefined,
) => {
  if (!platformSettings) {
    return { totalLikes: 0, totalComments: 0 };
  }

  const feedInteractions = platformSettings.feedInteractions || {
    numLikes: 0,
    numComments: 0,
  };
  const keywordTargets = platformSettings.keywordTargets || [];

  let totalLikes = feedInteractions.numLikes || 0;
  let totalComments = feedInteractions.numComments || 0;

  keywordTargets.forEach((target) => {
    totalLikes += target.numLikes || 0;
    totalComments += target.numComments || 0;
  });

  return { totalLikes, totalComments };
};

// Utility function to calculate total interactions across all platforms
export const calculateTotalInteractions = (
  platformSettings: Record<string, PlatformSettings>,
  enabledPlatforms: string[],
) => {
  let totalLikes = 0;
  let totalComments = 0;

  enabledPlatforms.forEach((platform) => {
    const { totalLikes: platformLikes, totalComments: platformComments } =
      calculatePlatformInteractions(platformSettings[platform]);
    totalLikes += platformLikes;
    totalComments += platformComments;
  });

  return { totalLikes, totalComments };
};

// Utility function to get default platform settings
export const getDefaultPlatformSettings = (
  platform: string,
): PlatformSettings => {
  const config = PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG];
  return {
    feedInteractions: {
      numLikes: 5,
      numComments: 5,
    },
    keywordTargets: [
      {
        keyword: config?.defaultHashtag || "#general",
        numLikes: 3,
        numComments: 2,
      },
    ],
    promptMode: "automatic",
    customPrompts: [],
    selectedCustomPromptId: "",
  };
};

// Utility function to validate platform limits
export const validatePlatformLimits = (
  platformSettings: PlatformSettings,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const { totalLikes, totalComments } =
    calculatePlatformInteractions(platformSettings);

  if (totalLikes > MAX_LIKES) {
    errors.push(
      `Total likes (${totalLikes}) exceed the maximum limit of ${MAX_LIKES}`,
    );
  }

  if (totalComments > MAX_COMMENTS) {
    errors.push(
      `Total comments (${totalComments}) exceed the maximum limit of ${MAX_COMMENTS}`,
    );
  }

  if (platformSettings.keywordTargets.length > MAX_KEYWORDS) {
    errors.push(
      `Number of keywords (${platformSettings.keywordTargets.length}) exceed the maximum limit of ${MAX_KEYWORDS}`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Type definitions for updated form
export type PlatformType = keyof typeof PLATFORM_CONFIG;

export interface FormValues {
  // Global settings
  useBrandVoice: boolean;
  promoteProduct: boolean;
  productDetails?: string;
  licenseKey?: string;

  // LinkedIn-specific settings (backward compatibility)
  linkedinPromptMode: "automatic" | "custom";
  linkedinCustomPrompts?: Array<{
    id: string;
    title: string;
    text: string;
  }>;
  linkedinSelectedCustomPromptId?: string;
  feedInteractions: {
    numLikes: number;
    numComments: number;
  };
  keywordTargets: Array<{
    keyword: string;
    numLikes: number;
    numComments: number;
  }>;

  // Platform-specific settings
  enabledPlatforms: PlatformType[];
  platformSettings: Record<string, PlatformSettings>;
}

// License interface
export interface License {
  id: string;
  key: string;
  name: string;
  status: string;
  type?: "main" | "sub";
  vendor?: string;
  tier?: string;
}

export interface PlatformInteractionLimits {
  totalLikes: number;
  totalComments: number;
}
