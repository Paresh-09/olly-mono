// dashboard-content.tsx
// New design
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Users,
  Key,
  Target,
  PlayCircle,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Chrome,
  Building2,
  UserPlus,
  Settings,
  Trophy,
  Trash2,
  X,
  MessageSquare,
  Book,
  Video,
  User,
  Loader2,
  CheckCircle,
  Calendar,
  Clock,
  Pencil,
} from "lucide-react";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { toast } from "@repo/ui/hooks/use-toast";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import LicensesList from "./license-list";
import ApiKeysList from "./api-list";
import UsageLogs from "./user-logs";
import AddUsernamePopup from "./add-username";
import { TourProvider, useTour } from "@reactour/tour";
import Link from "next/link";

interface User {
  username: string;
  email: string;
  isAdmin: boolean;
  id?: string;
}

interface License {
  licenseKey: {
    id: string;
    key: string;
    isActive: boolean;
    tier: number | null;
    vendor: string;
    lemonProductId: number | null;
  };
  userId: string;
  licenseKeyId: string;
  assignedAt: Date;
}

interface ApiKey {
  apiKey: {
    id: string;
    key: string;
    isActive: boolean;
  };
}

interface SubLicense {
  id: string;
  key: string;
  status: string;
  assignedEmail: string | null;
  mainLicenseKey: {
    id: string;
    tier: number | null;
    vendor: string;
    lemonProductId: number | null;
  };
  organization?: {
    id: string;
    name: string;
  };
}

interface UsageLog {
  date: string;
  total: number;
  [platform: string]: number | string | Record<string, number>;
}

interface Leaderboard {
  id: string;
  userId: string | null;
  updatedAt: Date;
  freeUserId: string | null;
  level: number;
  totalComments: number;
}

interface SubLicenseGoal {
  id: string;
  goal: string;
  daysToAchieve: number | null;
  platform: string;
  userId: string;
  target?: number | null;
  progress?: number | null;
  status?: string | null;
  achievedAt?: Date | null;
  createdAt: Date;
  subLicense?: {
    mainLicenseKey: {
      organization: {
        name: string;
      } | null;
    };
  };
}

interface LicenseGoal {
  id: string;
  goal: string;
  daysToAchieve: number | null;
  platform: string;
  target?: number | null;
  progress?: number | null;
  status?: string | null;
  achievedAt?: Date | null;
  createdAt: Date;
}

interface PlanDetails {
  name: string;
  vendor?: string;
  tier?: number;
  activeSubLicenses?: number;
  maxSubLicenses?: number;
  duration?: string;
  isTeamConverted?: boolean;
}

interface DashboardContentProps {
  user: User;
  licenses: License[];
  subLicenses: SubLicense[];
  apiKeys: ApiKey[];
  leaderboard: Leaderboard | null;
  usageLogs: UsageLog[];
  subLicenseGoals: SubLicenseGoal[];
  licenseGoals: LicenseGoal[];
  totalGoals: number;
  activePlan: PlanDetails | null;
  hasPremiumLicense: boolean;
}

const isTeamPlan = (
  plan: PlanDetails | null,
  licenses: License[],
  subLicenses: SubLicense[],
): boolean => {
  // First check if any license has sub-licenses
  if (
    licenses.some((license) => {
      // Check if this license has any sub-licenses
      const subLicensesForThisLicense = subLicenses.filter(
        (sl) => sl.mainLicenseKey.id === license.licenseKey.id,
      );
      return subLicensesForThisLicense.length > 0;
    })
  ) {
    return true;
  }

  // If no sub-licenses found, fall back to checking plan details
  if (!plan) return false;

  // Check for team tiers (2, 3, 4, 7)
  if (plan.tier && [2, 3, 4, 7].includes(plan.tier)) {
    return true;
  }

  // Check Lemon team plans
  if (plan.vendor?.toLowerCase() === "lemonsqueezy") {
    // Check if it's a team plan based on maxSubLicenses or if it's converted to team
    if (plan.maxSubLicenses && plan.maxSubLicenses > 1) {
      return true;
    }
    if (plan.isTeamConverted) {
      return true;
    }
  }

  return false;
};

// Add this new component before the DashboardContent component
const PremiumFeatureOverlay = ({ onClick }: { onClick: () => void }) => {
  return (
    <div
      className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center cursor-pointer group"
      onClick={onClick}
    >
      <div className="text-center p-4 transform group-hover:scale-105 transition-transform">
        <span className="text-2xl mb-2 block">✨</span>
        <p className="text-sm font-medium text-muted-foreground">
          Premium Feature
        </p>
        <Button variant="default" size="sm" className="mt-2">
          Upgrade Now
        </Button>
      </div>
    </div>
  );
};

// Add this before the DashboardContent component
const TeamInviteSection = ({
  isTeamPlan,
  onInvite,
}: {
  isTeamPlan: boolean;
  onInvite: (email: string) => void;
}) => {
  const [inviteEmail, setInviteEmail] = useState("");

  const router = useRouter();

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    onInvite(inviteEmail);
    router.push('/dashboard/licenses');
  };

  return (
    <div className="space-y-3">
      {/* <input
        type="email"
        placeholder="colleague@company.com"
        value={inviteEmail}
        onChange={(e) => setInviteEmail(e.target.value)}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      /> */}
      <button
        onClick={handleInvite}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg shadow-blue-500/25"
      >
        Invite
      </button>
      {/* TODO: Add seat management UI here. Show available/total seats, list of pending invites, 
          and active team members. Implement seat-based restrictions when max seats are reached. */}
    </div>
  );
};

// Dashboard Content Component
function DashboardContentInner({
  user,
  licenses,
  subLicenses,
  apiKeys,
  leaderboard,
  usageLogs,
  subLicenseGoals,
  licenseGoals,
  totalGoals,
  activePlan,
  hasPremiumLicense,
}: DashboardContentProps) {
  const router = useRouter();
  const [isPopupOpen, setIsPopupOpen] = useState(!user.username);
  const [currentUsername, setCurrentUsername] = useState(user.username);
  const [showLifetimeMessage, setShowLifetimeMessage] = useState(true);
  const [showAllKeys, setShowAllKeys] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState("7");
  const [selectedLicense, setSelectedLicense] = useState<string>("all");
  const licenseKeys = licenses.map((license) => license.licenseKey.key);
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [usageData, setUsageData] = useState<UsageLog[]>([]);
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{ id: string, title: string, embedUrl: string } | null>(null);
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);
  const [isGeneratingApiKey, setIsGeneratingApiKey] = useState(false);

  const usedLicenses = Math.min(
    activePlan?.activeSubLicenses || 0,
    activePlan?.maxSubLicenses || 1,
  );
  const maxLicenses = activePlan?.maxSubLicenses || 1;

  const { setIsOpen } = useTour();

  // Safe localStorage access functions
  const getLocalStorageItem = (key: string): string | null => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (error) {
      console.warn("localStorage access failed:", error);
    }
    return null;
  };

  const setLocalStorageItem = (key: string, value: string): void => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn("localStorage write failed:", error);
    }
  };

  // Handle component mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToChrome = () => {
    window.open(
      "https://chromewebstore.google.com/detail/olly-ai-assistant-for-soc/ofjpapfmglfjdhmadpegoeifocomaeje?hl=en",
      "_blank",
    );
  };

  // Check if the user belongs to an organization through a sub-license
  const hasOrganization = subLicenses.some(
    (subLicense) => subLicense.organization,
  );
  const organizationName = hasOrganization
    ? subLicenses.find((subLicense) => subLicense.organization)?.organization
      ?.name
    : null;
  const organizationId = hasOrganization
    ? subLicenses.find((subLicense) => subLicense.organization)?.organization
      ?.id
    : null;

  // Initialize tour state based on localStorage, but only on client-side and after mounting
  useEffect(() => {
    if (!mounted) return;

    // Add delay to ensure proper hydration
    const timer = setTimeout(() => {
      const hasTourBeenShown = getLocalStorageItem("dashboard_tour_completed");
      if (!hasTourBeenShown) {
        setIsOpen(true);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [mounted, setIsOpen]);

  useEffect(() => {
    if (!mounted) return;

    setCurrentUsername(user.username);
    // Check if user has dismissed the message before
    const hasMessageBeenDismissed = getLocalStorageItem(
      "lifetimeMessageDismissed",
    );
    if (hasMessageBeenDismissed) {
      setShowLifetimeMessage(false);
    }
  }, [user.username, mounted]);

  useEffect(() => {
    if (!mounted) return;

    const fetchUsageData = async () => {
      try {
        setIsLoadingUsage(true);
        let queryParam = `period=${analyticsPeriod}`;

        // Add license-specific filtering
        if (selectedLicense !== "all") {
          queryParam += `&licenseKey=${encodeURIComponent(selectedLicense)}`;
        } else if (licenses.length === 0) {
          queryParam += `&userId=${user.id}`;
        }

        const response = await fetch(`/api/usage?${queryParam}`);
        if (response.ok) {
          const data = await response.json();
          setUsageData(data);
        }
      } catch (error) {
        console.error("Failed to fetch usage data:", error);
      } finally {
        setIsLoadingUsage(false);
      }
    };

    fetchUsageData();
  }, [analyticsPeriod, selectedLicense, licenses, user.id, mounted]);

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleUsernameUpdate = (newUsername: string) => {
    setCurrentUsername(newUsername);
    setIsPopupOpen(false);
  };

  const dismissLifetimeMessage = () => {
    setShowLifetimeMessage(false);
    setLocalStorageItem("lifetimeMessageDismissed", "true");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "The key has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };


  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }));
  };

  const renderKey = (key: string, keyId: string, type: "license" | "api") => {
    const isVisible = showKeys[keyId];
    const displayKey = isVisible ? key : `${key.slice(0, 8)}...`;

    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
        <div className="flex items-center space-x-2">
          <Key
            className={`h-4 w-4 ${type === "license" ? "text-green-600" : "text-blue-600"}`}
          />
          <span className="text-sm font-medium">
            {type === "license" ? "License Key" : "API Key"}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-mono">{displayKey}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => toggleKeyVisibility(keyId)}
          >
            {isVisible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => copyToClipboard(key)}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const handleTeamInvite = (email: string) => {
    if (!isTeamPlan(activePlan, licenses, subLicenses)) {
      toast({
        title: "Team Plan Required",
        description: "Please upgrade to a team plan to invite team members.",
        variant: "default",
      });
      router.push("/plans");
      return;
    }

    // If they have a team plan, send them to the licenses management page
    router.push("/dashboard/licenses");
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      setDeletingGoalId(goalId);
      const response = await fetch(`/api/license-goals?goalId=${goalId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Goal deleted successfully",
        });
        router.refresh();
      } else {
        throw new Error("Failed to delete goal");
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      });
    } finally {
      setDeletingGoalId(null);
    }
  };

  const generateNewApiKey = async () => {
    try {
      // Check if user already has 5 API keys
      if (apiKeys.length >= 5) {
        toast({
          title: "API Key Limit Reached",
          description: "You have reached the maximum limit of 5 API keys. Please delete an existing key before creating a new one.",
          variant: "destructive",
        });
        return;
      }

      setIsGeneratingApiKey(true);
      const response = await fetch('/api/v2/key/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "API Key Created",
          description: "Your new API key has been generated successfully.",
        });
        // Refresh the page to update the API keys list
        router.refresh();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to generate API key",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error generating API key:', error);
      toast({
        title: "Error",
        description: "Failed to generate API key",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingApiKey(false);
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };

  const getYouTubeThumbnail = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
  };

  // Don't render tour until component is mounted
  if (!mounted) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 max-w-7xl">
        <div className="space-y-2 sm:space-y-4">
          <Card className="border-0 bg-white">
            <CardContent className="p-3 sm:p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-4">
            <Card className="border-0 bg-white lg:col-span-8">
              <CardContent className="p-3 sm:p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-2 sm:space-y-4 lg:col-span-4">
              <Card className="border-0 bg-white">
                <CardContent className="p-3 sm:p-4">
                  <div className="animate-pulse space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#0C9488] rounded-xl flex items-center justify-center shadow-lg shadow-[#0C9488]/25">
                    <span className="text-white font-bold text-sm sm:text-lg">{leaderboard?.level || 1}</span>
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    <Trophy className="w-3 h-3 text-[#0C9488]" />
                    <span className="text-xs text-gray-500">Level</span>
                  </div>
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                    {currentUsername ? `Welcome back, ${currentUsername}` : 'Get started with Olly'}
                  </h1>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    {activePlan ? `${activePlan.name} • ${user.email}` : 'Use the free plan or upgrade for advanced features'}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                <button onClick={handleAddToChrome} className="px-3 sm:px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm text-sm">
                  <Chrome className="w-4 h-4" />
                  <span className="sm:inline">Add to Chrome</span>
                </button>
                <button
                  onClick={() => router.push("/plans")}
                  className="px-4 sm:px-6 py-2 bg-gradient-to-r from-[#0C9488] to-[#0a7d73] hover:from-[#0a7d73] hover:to-[#086963] text-white rounded-xl transition-all duration-200 shadow-lg shadow-[#0C9488]/25 text-sm font-medium"
                >
                  View Plans
                </button>
              </div>
            </div>
          </div>
        </div>

        {!currentUsername && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
              <div className="flex items-center">
                <div className="text-amber-600 text-sm">
                  Please add a username to your account to unlock all features.
                  <button
                    onClick={() => setIsPopupOpen(true)}
                    className="ml-2 text-amber-800 font-medium hover:underline"
                  >
                    Add Username
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {hasOrganization && organizationName && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-[#0C9488]" />
                  <span className="text-sm font-medium">Organization: {organizationName}</span>
                </div>
                <button
                  onClick={() => router.push(`/dashboard/${organizationId}`)}
                  className="px-4 py-2 bg-[#0C9488] hover:bg-[#0a7d73] text-white rounded-lg transition-all duration-200 text-sm font-medium w-full sm:w-auto"
                >
                  View Organization
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Usage Analytics (2/3 width) */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-xl shadow-gray-200/50 usage-analytics-section">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Usage Analytics</h2>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Includes Team Data</span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm font-medium text-gray-900">
                        Total: {usageData.reduce((acc, log) => acc + log.total, 0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex bg-gray-100 rounded-xl p-1 overflow-x-auto">
                    {['Today', '7D', '30D', '90D'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setAnalyticsPeriod(tab === 'Today' ? '1' : tab === '7D' ? '7' : tab === '30D' ? '30' : '90')}
                        className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${(tab === 'Today' && analyticsPeriod === '1') ||
                          (tab === '7D' && analyticsPeriod === '7') ||
                          (tab === '30D' && analyticsPeriod === '30') ||
                          (tab === '90D' && analyticsPeriod === '90')
                          ? 'bg-white text-[#0C9488] shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                          }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                <UsageLogs
                  usageLogs={usageData.length > 0 ? usageData : usageLogs}
                  licenseKeys={licenseKeys}
                  licenses={licenses}
                  subLicenses={subLicenses}
                  isLoading={isLoadingUsage}
                  selectedLicense={selectedLicense}
                  onLicenseChange={setSelectedLicense}
                />
              </div>
            </div>

            {/* Right Column (1/3 width) */}
            <div className="space-y-6 goals-section">
              {/* Team Members */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/40 shadow-xl shadow-gray-200/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <UserPlus className="w-5 h-5 text-[#0C9488]" />
                    <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                  </div>
                </div>
                <TeamInviteSection
                  isTeamPlan={isTeamPlan(activePlan, licenses, subLicenses)}
                  onInvite={handleTeamInvite}
                />
              </div>

              {/* Keys & Access */}
              {(licenses.filter((l) => l.licenseKey.isActive).length > 0 ||
                subLicenses.filter((s) => s.status === "ACTIVE").length > 0) && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/40 shadow-xl shadow-gray-200/50" id="keys-section">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <Key className="w-5 h-5 text-[#0C9488]" />
                        <h3 className="text-lg font-semibold text-gray-900">Keys & Access</h3>
                      </div>
                      <button
                        className="text-[#0C9488] hover:text-[#0a7d73] text-sm font-medium"
                        onClick={() => setShowAllKeys(true)}
                      >
                        View All Keys
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* License Key */}
                      {licenses
                        .filter((l) => l.licenseKey.isActive)
                        .slice(0, 1)
                        .map((license) => (
                          <div key={license.licenseKey.id} className="flex items-center justify-between p-4 bg-emerald-50/70 rounded-xl border border-emerald-200/60">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                              <span className="text-gray-700 font-medium">License Key</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-600 font-mono text-sm">
                                {showKeys[license.licenseKey.id] ? license.licenseKey.key : `${license.licenseKey.key.slice(0, 8)}...`}
                              </span>
                              <button onClick={() => toggleKeyVisibility(license.licenseKey.id)}>
                                {showKeys[license.licenseKey.id] ?
                                  <EyeOff className="w-4 h-4 text-gray-500 hover:text-gray-700" /> :
                                  <Eye className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                                }
                              </button>
                              <button onClick={() => copyToClipboard(license.licenseKey.key)}>
                                <Copy className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                              </button>
                            </div>
                          </div>
                        ))}

                      {/* Sub License Key */}
                      {subLicenses
                        .filter((s) => s.status === "ACTIVE")
                        .slice(0, 1)
                        .map((sublicense) => (
                          <div key={sublicense.id}>
                            <div className="flex items-center justify-between p-4 bg-emerald-50/70 rounded-xl border border-emerald-200/60">
                              <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                <span className="text-gray-700 font-medium">Team License Key</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-600 font-mono text-sm">
                                  {showKeys[sublicense.id] ? sublicense.key : `${sublicense.key.slice(0, 8)}...`}
                                </span>
                                <button onClick={() => toggleKeyVisibility(sublicense.id)}>
                                  {showKeys[sublicense.id] ?
                                    <EyeOff className="w-4 h-4 text-gray-500 hover:text-gray-700" /> :
                                    <Eye className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                                  }
                                </button>
                                <button onClick={() => copyToClipboard(sublicense.key)}>
                                  <Copy className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                                </button>
                              </div>
                            </div>
                            {sublicense.organization && (
                              <div className="flex items-center mt-1 ml-1">
                                <Building2 className="h-3 w-3 text-gray-500 mr-1" />
                                <span className="text-xs text-gray-500">
                                  From: {sublicense.organization.name}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}

                      {/* API Key */}
                      {apiKeys
                        .filter((a) => a.apiKey.isActive)
                        .slice(0, 1)
                        .map((apiKey) => (
                          <div key={apiKey.apiKey.id} className="flex items-center justify-between p-4 bg-teal-50/70 rounded-xl border border-teal-200/60">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-[#0C9488] rounded-full"></div>
                              <span className="text-gray-700 font-medium">API Key</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-600 font-mono text-sm">
                                {showKeys[apiKey.apiKey.id] ? apiKey.apiKey.key : `${apiKey.apiKey.key.slice(0, 8)}...`}
                              </span>
                              <button onClick={() => toggleKeyVisibility(apiKey.apiKey.id)}>
                                {showKeys[apiKey.apiKey.id] ?
                                  <EyeOff className="w-4 h-4 text-gray-500 hover:text-gray-700" /> :
                                  <Eye className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                                }
                              </button>
                              <button onClick={() => copyToClipboard(apiKey.apiKey.key)}>
                                <Copy className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                              </button>
                            </div>
                          </div>
                        ))}

                      {/* Generate API Key Button if no API key exists */}
                      {apiKeys.filter((a) => a.apiKey.isActive).length === 0 && (
                        <div className="flex items-center justify-between p-4 bg-teal-50/70 rounded-xl border border-teal-200/60">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-[#0C9488] rounded-full"></div>
                            <span className="text-gray-700 font-medium">API Key</span>
                          </div>
                          <button
                            onClick={generateNewApiKey}
                            disabled={isGeneratingApiKey}
                            className="px-3 py-1 bg-[#0C9488] hover:bg-[#0a7d73] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 text-sm font-medium flex items-center space-x-1"
                          >
                            {isGeneratingApiKey ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Generating...</span>
                              </>
                            ) : (
                              <span>Generate</span>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Goals */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/40 shadow-xl shadow-gray-200/50 relative">
                {!hasPremiumLicense && (
                  <div
                    className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-[5] flex flex-col items-center justify-center cursor-pointer group rounded-2xl"
                    onClick={() => router.push("/plans")}
                  >
                    <div className="text-center p-4 transform group-hover:scale-105 transition-transform">
                      <span className="text-2xl mb-2 block">✨</span>
                      <p className="text-sm font-medium text-gray-600">
                        Premium Feature
                      </p>
                      <button className="mt-2 px-4 py-2 bg-[#0C9488] hover:bg-[#0a7d73] text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-lg shadow-teal-500/25">
                        Upgrade Now
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-[#0C9488]" />
                    <h3 className="text-lg font-semibold text-gray-900">Goals</h3>
                  </div>
                  <div className="flex items-center space-x-3">
                    {/* View All Link - only show if there are more than 3 total goals */}
                    {(licenseGoals.length + subLicenseGoals.length) > 3 && (
                      <Link
                        href="/dashboard/licenses"
                        className="text-[#0C9488] hover:text-[#0a7d73] text-sm font-medium transition-colors"
                      >
                        View All
                      </Link>
                    )}
                    {/* Add Goal Button - show if user has premium license and there are existing goals */}
                    {hasPremiumLicense && (licenseGoals.length + subLicenseGoals.length) > 0 && (
                      <DialogPrimitive.Root>
                        <DialogPrimitive.Trigger asChild>
                          <button className="px-3 py-1.5 bg-[#0C9488] hover:bg-[#0a7d73] text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-lg shadow-teal-500/25">
                            Add Goal
                          </button>
                        </DialogPrimitive.Trigger>
                        <DialogPrimitive.Portal>
                          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                          <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
                            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                              <DialogPrimitive.Title className="text-lg font-semibold leading-none tracking-tight flex items-center space-x-2">
                                <Target className="w-5 h-5 text-[#0C9488]" />
                                <span>Add New Goal</span>
                              </DialogPrimitive.Title>
                              <DialogPrimitive.Description className="text-sm text-muted-foreground">
                                Set a specific goal to track your progress and stay motivated.
                              </DialogPrimitive.Description>
                            </div>
                            <form
                              onSubmit={async (e) => {
                                e.preventDefault();

                                if (isCreatingGoal) return;

                                setIsCreatingGoal(true);
                                const formData = new FormData(e.currentTarget);
                                const goal = formData.get("goal") as string;
                                const platform = formData.get("platform") as string;
                                const daysToAchieve = parseInt(
                                  formData.get("daysToAchieve") as string,
                                );
                                const target = formData.get("target") as string;

                                try {
                                  const response = await fetch("/api/license-goals", {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      goal,
                                      platform,
                                      daysToAchieve,
                                      target: target ? parseInt(target) : null,
                                    }),
                                  });

                                  if (response.ok) {
                                    toast({
                                      title: "Goal Added",
                                      description: "Your goal has been successfully added!",
                                    });
                                    router.refresh();
                                  } else {
                                    const errorText = await response.text();
                                    if (response.status === 409) {
                                      toast({
                                        title: "Active Goal Exists",
                                        description: "You already have an active goal for this platform. Please complete your current goal before creating a new one.",
                                        variant: "default",
                                      });
                                    } else {
                                      throw new Error(errorText || 'Failed to add goal');
                                    }
                                  }
                                } catch (error) {
                                  console.error("Failed to add goal:", error);
                                  toast({
                                    title: "Error",
                                    description: error instanceof Error ? error.message : "Failed to add goal. Please try again.",
                                    variant: "destructive",
                                  });
                                } finally {
                                  setIsCreatingGoal(false);
                                }
                              }}
                              className="space-y-4"
                            >
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Goal Description</label>
                                <Input
                                  name="goal"
                                  placeholder="e.g., 50 comments in 50 days"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Target Comments</label>
                                <Input
                                  name="target"
                                  type="number"
                                  placeholder="e.g., 50 (for 50 comments)"
                                  min="1"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Platform</label>
                                <select 
                                  name="platform" 
                                  required
                                  className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <option value="">Select platform</option>
                                  <option value="LinkedIn">LinkedIn</option>
                                  <option value="Twitter">Twitter</option>
                                  <option value="Instagram">Instagram</option>
                                  <option value="YouTube">YouTube</option>
                                  <option value="Facebook">Facebook</option>
                                  <option value="TikTok">TikTok</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Days to Achieve</label>
                                <Input
                                  name="daysToAchieve"
                                  type="number"
                                  placeholder="e.g., 30"
                                  min="1"
                                  max="365"
                                  required
                                />
                              </div>
                              <div className="flex justify-end space-x-2 pt-4">
                                <DialogPrimitive.Close asChild>
                                  <Button type="button" variant="outline" size="sm">
                                    Cancel
                                  </Button>
                                </DialogPrimitive.Close>
                                <Button
                                  type="submit"
                                  disabled={isCreatingGoal}
                                  className="bg-[#0C9488] hover:bg-[#0a7d73] text-white"
                                  size="sm"
                                >
                                  {isCreatingGoal ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Creating...
                                    </>
                                  ) : (
                                    "Add Goal"
                                  )}
                                </Button>
                              </div>
                            </form>
                            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                              <X className="h-4 w-4" />
                              <span className="sr-only">Close</span>
                            </DialogPrimitive.Close>
                          </DialogPrimitive.Content>
                        </DialogPrimitive.Portal>
                      </DialogPrimitive.Root>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {(() => {
                    // Combine and limit goals to show only first 3
                    const allGoals = [
                      ...licenseGoals.map(goal => ({ ...goal, type: 'license' as const })),
                      ...subLicenseGoals.map(goal => ({ ...goal, type: 'sublicense' as const }))
                    ];

                    const displayedGoals = allGoals.slice(0, 3);
                    const hasMoreGoals = allGoals.length > 3;

                    if (displayedGoals.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <Target className="h-8 w-8 mx-auto text-gray-400 mb-3" />
                          <p className="text-gray-500 text-sm mb-1">No goals set yet</p>
                          <p className="text-gray-400 text-xs mb-4">
                            Set goals to track your progress and boost your social media performance
                          </p>
                          {hasPremiumLicense && (
                            <DialogPrimitive.Root>
                              <DialogPrimitive.Trigger asChild>
                                <button className="px-4 py-2 bg-[#0C9488] hover:bg-[#0a7d73] text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-lg shadow-teal-500/25">
                                  Add Your First Goal
                                </button>
                              </DialogPrimitive.Trigger>
                              <DialogPrimitive.Portal>
                                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                                <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
                                  <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                                    <DialogPrimitive.Title className="text-lg font-semibold leading-none tracking-tight flex items-center space-x-2">
                                      <Target className="w-5 h-5 text-[#0C9488]" />
                                      <span>Add Your First Goal</span>
                                    </DialogPrimitive.Title>
                                    <DialogPrimitive.Description className="text-sm text-muted-foreground">
                                      Set a specific goal to track your progress and stay motivated.
                                    </DialogPrimitive.Description>
                                  </div>
                                  <form
                                    onSubmit={async (e) => {
                                      e.preventDefault();

                                      if (isCreatingGoal) return;

                                      setIsCreatingGoal(true);
                                      const formData = new FormData(e.currentTarget);
                                      const goal = formData.get("goal") as string;
                                      const platform = formData.get("platform") as string;
                                      const daysToAchieve = parseInt(
                                        formData.get("daysToAchieve") as string,
                                      );
                                      const target = formData.get("target") as string;

                                      try {
                                        const response = await fetch("/api/license-goals", {
                                          method: "POST",
                                          headers: {
                                            "Content-Type": "application/json",
                                          },
                                          body: JSON.stringify({
                                            goal,
                                            platform,
                                            daysToAchieve,
                                            target: target ? parseInt(target) : null,
                                          }),
                                        });

                                        if (response.ok) {
                                          toast({
                                            title: "Goal Added",
                                            description: "Your first goal has been successfully added!",
                                          });
                                          router.refresh();
                                        } else {
                                          const errorText = await response.text();
                                          if (response.status === 409) {
                                            toast({
                                              title: "Active Goal Exists",
                                              description: "You already have an active goal for this platform. Please complete your current goal before creating a new one.",
                                              variant: "default",
                                            });
                                          } else {
                                            throw new Error(errorText || 'Failed to add goal');
                                          }
                                        }
                                      } catch (error) {
                                        console.error("Failed to add goal:", error);
                                        toast({
                                          title: "Error",
                                          description: error instanceof Error ? error.message : "Failed to add goal. Please try again.",
                                          variant: "destructive",
                                        });
                                      } finally {
                                        setIsCreatingGoal(false);
                                      }
                                    }}
                                    className="space-y-4"
                                  >
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">Goal Description</label>
                                      <Input
                                        name="goal"
                                        placeholder="e.g., 50 comments in 50 days"
                                        required
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">Target Comments</label>
                                      <Input
                                        name="target"
                                        type="number"
                                        placeholder="e.g., 50 (for 50 comments)"
                                        min="1"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">Platform</label>
                                      <select 
                                        name="platform" 
                                        required
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                      >
                                        <option value="">Select platform</option>
                                        <option value="LinkedIn">LinkedIn</option>
                                        <option value="Twitter">Twitter</option>
                                        <option value="Instagram">Instagram</option>
                                        <option value="YouTube">YouTube</option>
                                        <option value="Facebook">Facebook</option>
                                        <option value="TikTok">TikTok</option>
                                      </select>
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">Days to Achieve</label>
                                      <Input
                                        name="daysToAchieve"
                                        type="number"
                                        placeholder="e.g., 30"
                                        min="1"
                                        max="365"
                                        required
                                      />
                                    </div>
                                    <div className="flex justify-end space-x-2 pt-4">
                                      <DialogPrimitive.Close asChild>
                                        <Button type="button" variant="outline" size="sm">
                                          Cancel
                                        </Button>
                                      </DialogPrimitive.Close>
                                      <Button
                                        type="submit"
                                        disabled={isCreatingGoal}
                                        className="bg-[#0C9488] hover:bg-[#0a7d73] text-white"
                                        size="sm"
                                      >
                                        {isCreatingGoal ? (
                                          <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creating...
                                          </>
                                        ) : (
                                          "Add Goal"
                                        )}
                                      </Button>
                                    </div>
                                  </form>
                                  <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Close</span>
                                  </DialogPrimitive.Close>
                                </DialogPrimitive.Content>
                              </DialogPrimitive.Portal>
                            </DialogPrimitive.Root>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {displayedGoals.map((goal) => {
                          const createdAt = new Date(goal.createdAt || new Date());
                          const deadline = goal.daysToAchieve
                            ? new Date(createdAt.getTime() + goal.daysToAchieve * 24 * 60 * 60 * 1000)
                            : null;

                          return (
                            <div
                              key={goal.id}
                              className={`p-5 rounded-xl border transition-all duration-200 group ${goal.status === "achieved"
                                ? "bg-gradient-to-r from-green-50/70 to-emerald-50/70 border-green-200/60"
                                : "bg-gradient-to-r from-gray-50/70 to-white/70 border-gray-200/60 hover:shadow-lg hover:shadow-gray-200/50"
                                }`}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h4 className={`font-semibold transition-colors ${goal.status === "achieved"
                                      ? "text-green-800 line-through"
                                      : "text-gray-900"
                                      }`}>
                                      {goal.goal}
                                    </h4>
                                    {goal.status === "achieved" && (
                                      <CheckCircle className="w-5 h-5 text-green-600" />
                                    )}
                                  </div>
                                  <div className="flex items-center flex-wrap gap-2 mb-3">
                                    <span className="px-2 py-1 bg-teal-100 text-[#0C9488] rounded-full text-xs font-medium">
                                      {goal.platform}
                                    </span>
                                    {goal.type === 'sublicense' && (
                                      <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                                        Team Member
                                      </span>
                                    )}
                                    {goal.target && (
                                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                        Target Comments: {goal.target}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {hasPremiumLicense && (
                                  <div className="flex items-center space-x-2">
                                    {goal.status !== "achieved" && (
                                      <Link href="/dashboard/licenses">
                                        <button
                                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                          title="Edit goal"
                                        >
                                          <Pencil className="w-4 h-4" />
                                        </button>
                                      </Link>
                                    )}
                                    <button
                                      onClick={() => handleDeleteGoal(goal.id)}
                                      disabled={deletingGoalId === goal.id}
                                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                      title={deletingGoalId === goal.id ? "Deleting..." : "Delete goal"}
                                    >
                                      {deletingGoalId === goal.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                                      ) : (
                                        <Trash2 className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>Created {format(createdAt, "MMM d, yyyy")}</span>
                                </div>
                                {deadline && (
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>Due {format(deadline, "MMM d, yyyy")}</span>
                                  </div>
                                )}
                                {goal.status === "achieved" && goal.achievedAt && (
                                  <div className="flex items-center space-x-1 text-green-600">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Completed {format(new Date(goal.achievedAt), "MMM d, yyyy")}</span>
                                  </div>
                                )}
                                {goal.type === 'sublicense' && goal.subLicense?.mainLicenseKey.organization && (
                                  <div className="text-xs text-gray-500">
                                    Org: {goal.subLicense.mainLicenseKey.organization.name}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* View All Goals Button/Link - shows after the 3rd goal */}
                        {hasMoreGoals && (
                          <div className="pt-2">
                            <Link
                              href="/dashboard/licenses"
                              className="block w-full p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-xl border border-gray-200/60 transition-all duration-200 text-center group"
                            >
                              <div className="flex items-center justify-center space-x-2">
                                <Target className="w-4 h-4 text-[#0C9488] group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-[#0C9488] group-hover:text-[#0a7d73]">
                                  View All Goals ({allGoals.length})
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Manage and track all your goals
                              </p>
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Add Tutorials Section */}
          <div className="mt-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/40 shadow-xl shadow-gray-200/50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div className="flex items-center space-x-3">
                  <PlayCircle className="w-8 h-8 text-[#0C9488]" />
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Tutorials</h2>
                    <p className="text-gray-600">Learn how to get the most out of Olly</p>
                  </div>
                </div>
                <button
                  onClick={() => window.open('https://www.youtube.com/@olly.social', '_blank')}
                  className="flex items-center space-x-2 text-[#0C9488] hover:text-[#0a7d73] font-medium transition-colors">
                  <span>View All</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    id: "1",
                    title: "App Sumo Easy setup guide",
                    url: "https://youtu.be/sI0WOh5FSEQ?feature=shared"
                  },
                  {
                    id: "2",
                    title: "Boost Engagement Instantly with Smart Post Borders",
                    url: "https://youtu.be/cMxjDD1NPT8?feature=shared"
                  },
                  {
                    id: "3",
                    title: "Biggest Olly Update Yet! v2.6.0.1 Setup",
                    url: "https://youtu.be/V3HkOFtXeTM?feature=shared"
                  }
                ].map((tutorial) => (
                  <div
                    key={tutorial.id}
                    className="group cursor-pointer"
                    onClick={() => setSelectedVideo({
                      id: tutorial.id,
                      title: tutorial.title,
                      embedUrl: getYouTubeEmbedUrl(tutorial.url)
                    })}
                  >
                    <div className="relative mb-4 overflow-hidden rounded-xl aspect-video">
                      <img
                        src={getYouTubeThumbnail(tutorial.url)}
                        alt={tutorial.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+VmlkZW88L3RleHQ+PC9zdmc+';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-200 flex items-center justify-center">
                        <PlayCircle className="w-12 h-12 text-white group-hover:scale-110 transition-transform duration-200" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-[#0C9488] transition-colors duration-200 mb-2 line-clamp-2">
                      {tutorial.title}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl w-full p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video">
            {selectedVideo && (
              <iframe
                src={selectedVideo.embedUrl}
                title={selectedVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-2 sm:space-y-4">
        {hasOrganization && organizationName && (
          <Card className="border-0 bg-white mb-2">
            <CardContent className="p-2 sm:p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-3">
                <Building2 className="h-4 w-4 text-[#0C9488]" />
                <span className="text-sm font-medium">
                  Organization: {organizationName}
                </span>
                <Badge
                  variant="outline"
                  className="text-xs font-normal py-1 px-2 border border-teal-200 bg-teal-50"
                >
                  {subLicenses.some((s) => s.status === "ACTIVE")
                    ? "Active Team Member"
                    : "Team Member"}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm h-8 px-3 flex-1 sm:flex-none"
                  onClick={() => router.push(`/dashboard/${organizationId}`)}
                >
                  View Organization
                </Button>
              </div>
            </CardContent>
          </Card>
        )}





      </div>

      <Dialog open={showAllKeys} onOpenChange={setShowAllKeys}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>All Keys</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2">License Keys</h3>
              <div className="space-y-2">
                {licenses
                  .filter((l) => l.licenseKey.isActive)
                  .map((license) => (
                    <div
                      key={license.licenseKey.id}
                      className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono">
                          {showKeys[license.licenseKey.id]
                            ? license.licenseKey.key
                            : `${license.licenseKey.key.slice(0, 8)}...`}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            toggleKeyVisibility(license.licenseKey.id)
                          }
                        >
                          {showKeys[license.licenseKey.id] ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            copyToClipboard(license.licenseKey.key)
                          }
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                  ))}
              </div>
            </div>

            {subLicenses.filter((s) => s.status === "ACTIVE").length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Team License Keys</h3>
                <div className="space-y-2">
                  {subLicenses
                    .filter((s) => s.status === "ACTIVE")
                    .map((subLicense) => (
                      <div
                        key={subLicense.id}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-mono">
                            {showKeys[subLicense.id]
                              ? subLicense.key
                              : `${subLicense.key.slice(0, 8)}...`}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleKeyVisibility(subLicense.id)}
                          >
                            {showKeys[subLicense.id] ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(subLicense.key)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                          {subLicense.organization && (
                            <span className="text-xs text-muted-foreground">
                              {subLicense.organization.name}
                            </span>
                          )}
                          <Badge variant="default">Active</Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium">API Keys</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {apiKeys.filter((a) => a.apiKey.isActive).length}/5 keys used
                  </p>
                </div>
                {apiKeys.filter((a) => a.apiKey.isActive).length < 5 && (
                  <Button
                    onClick={generateNewApiKey}
                    disabled={isGeneratingApiKey}
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-sm"
                  >
                    {isGeneratingApiKey ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Key"
                    )}
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {apiKeys.filter((a) => a.apiKey.isActive).length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">No API keys found</p>
                    <Button
                      onClick={generateNewApiKey}
                      disabled={isGeneratingApiKey}
                      variant="outline"
                      size="sm"
                      className="mt-2 h-8 px-3 text-sm"
                    >
                      {isGeneratingApiKey ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        "Generate First Key"
                      )}
                    </Button>
                  </div>
                ) : (
                  apiKeys
                    .filter((a) => a.apiKey.isActive)
                    .map((apiKey) => (
                      <div
                        key={apiKey.apiKey.id}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-mono">
                            {showKeys[apiKey.apiKey.id]
                              ? apiKey.apiKey.key
                              : `${apiKey.apiKey.key.slice(0, 8)}...`}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleKeyVisibility(apiKey.apiKey.id)}
                          >
                            {showKeys[apiKey.apiKey.id] ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(apiKey.apiKey.key)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isPopupOpen && (
        <AddUsernamePopup
          onClose={handleClosePopup}
          onUsernameUpdate={handleUsernameUpdate}
        />
      )}
    </>
  );
}

// Tour steps configuration
const tourSteps = [
  {
    selector: ".usage-analytics-section",
    content: "Track your usage and analytics across different platforms.",
  },
  {
    selector: ".goals-section",
    content: "Set and track your social media goals here.",
  },
  {
    selector: "#keys-section",
    content: "Access your license keys and API keys in this section.",
  },
];

// Main component with TourProvider
export default function DashboardContent(props: DashboardContentProps) {
  const handleTourComplete = () => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("dashboard_tour_completed", "true");
      }
    } catch (error) {
      console.warn("localStorage write failed:", error);
    }
  };

  return (
    <TourProvider
      steps={tourSteps}
      beforeClose={handleTourComplete}
      styles={{
        popover: (base) => ({
          ...base,
          "--reactour-accent": "#3b82f6",
          borderRadius: "12px",
        }),
        maskArea: (base) => ({
          ...base,
          rx: 8,
        }),
        badge: (base) => ({
          ...base,
          left: "auto",
          right: "-0.8125em",
        }),
      }}
      showBadge={true}
      showPrevNextButtons={true}
      showCloseButton={true}
      disableInteraction={false}
      padding={10}
    >
      <DashboardContentInner {...props} />
    </TourProvider>
  );
}
