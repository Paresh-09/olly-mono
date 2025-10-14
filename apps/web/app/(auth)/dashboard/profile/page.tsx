'use client'

import React, { useEffect, useState } from 'react';
import { User } from '@prisma/client';
import { Button } from '@repo/ui/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@repo/ui/components/ui/card';
import { fetchUserProfile, updateUserProfile, deactivateProfile } from '@/lib/actions';
import EditUserModal from '../../_components/edit-user';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/components/ui/alert-dialog";
import { useToast } from "@repo/ui/hooks/use-toast";import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { Badge } from "@repo/ui/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Separator } from "@repo/ui/components/ui/separator";
import { Copy, CreditCard, Key, Clock, User as UserIcon, Package, Shield, LogOut, ExternalLink, Eye, EyeOff, BarChart3 } from "lucide-react";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";

interface ExtendedUser extends User {
  activePlan?: {
    name: string;
    tier?: number;
    duration?: string;
    expiresAt?: string;
  };
  usage?: {
    apiCalls: number;
    remainingCredits: number;
  };
  credits?: number;
  image?: string;
}

// Skeleton component for profile section
const ProfileSkeleton = () => (
  <Card>
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col items-center space-y-3 pb-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="text-center space-y-1 w-full">
          <Skeleton className="h-6 w-32 mx-auto" />
          <Skeleton className="h-4 w-20 mx-auto" />
          <Skeleton className="h-5 w-16 mx-auto rounded-full" />
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-4">
        <div className="space-y-1">
          <Skeleton className="h-4 w-12" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </div>

        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-28" />
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex flex-col space-y-2">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    </CardContent>
    <CardFooter>
      <Skeleton className="h-9 w-full" />
    </CardFooter>
  </Card>
);

// Skeleton component for subscription card
const SubscriptionSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-24 mb-2" />
      <Skeleton className="h-4 w-40" />
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4">
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-16 mt-1" />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-36" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Skeleton component for API card
const ApiSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-36 mb-2" />
      <Skeleton className="h-4 w-48" />
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex space-x-2 mb-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>

        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div>
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-32 mt-1" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>

        <Skeleton className="h-9 w-full" />
      </div>
    </CardContent>
  </Card>
);

const UserProfile: React.FC = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [licenseKeys, setLicenseKeys] = useState<any[]>([]);
  const [apiTransactions, setApiTransactions] = useState<any[]>([]);
  const [showKeysModal, setShowKeysModal] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [activePlans, setActivePlans] = useState<any[]>([]);
  const [hasPremium, setHasPremium] = useState(false);
  const [streak, setStreak] = useState<{ currentStreak: number; maxStreak: number; lastActivity: string | null } | null>(null);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoading(true);
        const result = await fetchUserProfile();

        if (result.success) {
          const userData = JSON.parse(result.success) as ExtendedUser;
          setUser(userData);
          console.log('User data loaded:', userData);

          // Fetch user plans
          try {
            const plansResponse = await fetch('/api/user/plans');
            if (plansResponse.ok) {
              const plansData = await plansResponse.json();
              setActivePlans(plansData.plans || []);
              setHasPremium(plansData.hasPremium || false);
            }
          } catch (err) {
            console.error('Error fetching plans:', err);
          }

          // Fetch API keys
          try {
            const apiKeysResponse = await fetch('/api/user/api-keys');
            if (apiKeysResponse.ok) {
              const apiKeysData = await apiKeysResponse.json();
              setApiKeys(apiKeysData.apiKeys || []);
            }
          } catch (err) {
            console.error('Error fetching API keys:', err);
          }

          // Fetch license keys
          try {
            const licenseKeysResponse = await fetch('/api/user/licenses');
            if (licenseKeysResponse.ok) {
              const licenseKeysData = await licenseKeysResponse.json();

              // If no licenses found, try fetching from sub-licenses
              if (!licenseKeysData.licenses || licenseKeysData.licenses.length === 0) {
                const subLicenseResponse = await fetch('/api/user/sub-licenses');
                if (subLicenseResponse.ok) {
                  const subLicenseData = await subLicenseResponse.json();
                  setLicenseKeys(subLicenseData.licenses || []);
                }
              } else {
                setLicenseKeys(licenseKeysData.licenses);
              }
            }
          } catch (err) {
            console.error('Error fetching license keys:', err);

            // If primary endpoint fails, try sub-licenses as fallback
            try {
              const subLicenseResponse = await fetch('/api/user/sub-licenses');
              if (subLicenseResponse.ok) {
                const subLicenseData = await subLicenseResponse.json();
                setLicenseKeys(subLicenseData.licenses || []);
              }
            } catch (subErr) {
              console.error('Error fetching sub-licenses:', subErr);
            }
          }

          // Fetch API transactions
          try {
            const transactionsResponse = await fetch('/api/user/transactions?limit=3');
            if (transactionsResponse.ok) {
              const transactionsData = await transactionsResponse.json();
              setApiTransactions(transactionsData.transactions || []);
            }
          } catch (err) {
            console.error('Error fetching transactions:', err);
          }

          // Fetch streak data
          if (userData.id) {
            try {
              const streakRes = await fetch(`/api/streak/get?userId=${userData.id}`);
              if (streakRes.ok) {
                const streakData = await streakRes.json();
                if (streakData.success) {
                  setStreak(streakData.streak);
                }
              }
            } catch (err) {
              // ignore streak error
            }
          }

        } else if (result.error) {
          setError(result.error);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to fetch user profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const handleUpdateUser = async (formData: FormData) => {
    try {
      const result = await updateUserProfile({}, formData);
      if (result.success) {
        const updatedUser = JSON.parse(result.success) as ExtendedUser;
        setUser(updatedUser);
        setIsModalOpen(false);
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      } else if (result.error) {
        setError(result.error);
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      setError('Failed to update user profile');
      toast({
        title: "Error",
        description: "Failed to update user profile",
        variant: "destructive",
      });
    }
  };

  const handleDeactivateAccount = async () => {
    try {
      const result = await deactivateProfile();
      if (result.success) {
        toast({
          title: "Account deactivated",
          description: result.success,
        });
        router.push('/login');
      } else if (result.error) {
        setError(result.error);
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deactivating account:', error);
      setError('Failed to deactivate account');
      toast({
        title: "Error",
        description: "Failed to deactivate account",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
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

      const response = await fetch('/api/v2/key/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeys(prev => [...prev, data.apiKey]);
        toast({
          title: "API Key Created",
          description: "Your new API key has been generated successfully.",
        });
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
    }
  };

  const revokeApiKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/user/api-keys/${keyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setApiKeys(prev => prev.filter(key => key.id !== keyId));
        toast({
          title: "API Key Revoked",
          description: "Your API key has been revoked successfully.",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to revoke API key",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error revoking API key:', error);
      toast({
        title: "Error",
        description: "Failed to revoke API key",
        variant: "destructive",
      });
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const renderKeyItem = (keyData: any, type: 'license' | 'api') => {
    const isVisible = visibleKeys[keyData.id];
    const displayKey = isVisible ? keyData.key : keyData.maskedKey || `${keyData.key.substring(0, 8)}${'•'.repeat(16)}`;

    return (
      <div key={keyData.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center space-x-3">
          <Key className={`h-5 w-5 ${type === 'license' ? 'text-green-600' : 'text-blue-600'}`} />
          <div>
            <div className="font-mono text-sm">{displayKey}</div>
            <div className="text-xs text-muted-foreground">
              {type === 'license' ? 'License' : 'API'} Key • Created: {new Date(keyData.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => toggleKeyVisibility(keyData.id)}
          >
            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => copyToClipboard(keyData.key)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          {type === 'api' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => revokeApiKey(keyData.id)}
            >
              Revoke
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Helper function to get plan display text
  const getPlanDisplayText = (plan: any) => {
    if (!plan) return "Free Plan";

    // Handle sub-license case
    if (plan.isSubLicense) {
      return "Team Plan Member";
    }

    // Build plan name based on vendor and details
    const planName = plan.name || "Unknown Plan";
    const vendorName = plan.vendor
      ? `${plan.vendor.charAt(0).toUpperCase()}${plan.vendor.slice(1)}`
      : "";

    if (plan.tier && plan.vendor?.toLowerCase() === "appsumo") {
      return `AppSumo ${planName} (Tier ${plan.tier})`;
    }

    if (plan.vendor?.toLowerCase() === "lemonsqueezy") {
      return `${planName} (${plan.duration || 'Lifetime'})`;
    }

    if (plan.vendor?.toLowerCase() === "olly") {
      return `${planName} (Internal)`;
    }

    return vendorName ? `${vendorName} ${planName}` : planName;
  };

  // Calculate days until plan expiry
  const getExpiryInfo = () => {
    if (!activePlans || activePlans.length === 0) return { daysRemaining: 0, text: "N/A" };

    const plan = activePlans[0];
    if (!plan.expiresAt) return { daysRemaining: 0, text: "Never (Lifetime)" };

    const daysRemaining = Math.ceil((new Date(plan.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return {
      daysRemaining,
      text: daysRemaining > 0 ? `Renews in ${daysRemaining} days` : "Expired"
    };
  };

  const expiryInfo = getExpiryInfo();

  // Render the subscription card content
  const renderSubscriptionCard = () => {
    if (activePlans.length === 0) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-sm font-medium text-gray-700 mb-2">Current Plan</div>
              <div className="text-2xl font-bold text-gray-900">Free Plan</div>
              <div className="text-sm text-gray-600 mt-1">Limited Features</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-sm font-medium text-gray-700 mb-2">Billing Cycle</div>
              <div className="text-2xl font-bold text-gray-900">N/A</div>
              <div className="text-sm text-gray-600 mt-1">No active subscription</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-sm font-medium text-gray-700 mb-2">Credits Remaining</div>
              <div className="text-2xl font-bold text-gray-900">{user?.credits}</div>
              <div className="text-sm text-gray-600 mt-1">API calls: {user?.usage?.apiCalls || 0}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            <Button
              onClick={() => router.push('/plans')}
              className="h-12 px-6 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-medium"
            >
              Upgrade Plan
            </Button>
            <Button
              onClick={() => router.push('/credits')}
              variant="outline"
              className="h-12 px-6 rounded-xl hover:bg-gray-50 font-medium"
            >
              Buy Credits
            </Button>
          </div>
        </div>
      );
    }

    const mainPlan = activePlans[0];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="text-sm font-medium text-gray-700 mb-2">Current Plan</div>
            <div className="text-2xl font-bold text-gray-900">{getPlanDisplayText(mainPlan)}</div>
            <div className="text-sm text-gray-600 mt-1">{mainPlan.duration || "Lifetime"}</div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <div className="text-sm font-medium text-gray-700 mb-2">Users / Licenses</div>
            <div className="text-2xl font-bold text-gray-900">
              {mainPlan.activeSubLicenses || 1} / {mainPlan.maxSubLicenses || 1}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {expiryInfo.text}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <div className="text-sm font-medium text-gray-700 mb-2">Credits Remaining</div>
            <div className="text-2xl font-bold text-gray-900">{user?.credits}</div>
            <div className="text-sm text-gray-600 mt-1">API calls: {user?.usage?.apiCalls || 0}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-4">
          {activePlans.length > 1 && (
            <Button
              onClick={() => setShowKeysModal(true)}
              variant="outline"
              className="h-12 px-6 rounded-xl hover:bg-gray-50 font-medium"
            >
              View All Plans ({activePlans.length})
            </Button>
          )}
          <Button
            onClick={() => router.push('/plans')}
            className="h-12 px-6 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-medium"
          >
            {hasPremium ? "Manage Plans" : "Upgrade Plan"}
          </Button>
          <Button
            onClick={() => router.push('/credits')}
            variant="outline"
            className="h-12 px-6 rounded-xl hover:bg-gray-50 font-medium"
          >
            Buy Credits
          </Button>
          <Button
            onClick={() => router.push('/dashboard/billing')}
            variant="outline"
            className="flex items-center gap-2 h-12 px-6 rounded-xl hover:bg-gray-50 font-medium"
          >
            <CreditCard className="h-5 w-5" />
            Manage Billing
          </Button>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-7xl">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="text-red-500">Error: {error}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Profile Settings</h1>
            <p className="text-lg text-gray-600 leading-relaxed font-light">
              Manage your account, subscription, and API access
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Summary Card */}
            {isLoading ? (
              <ProfileSkeleton />
            ) : (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Profile</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsModalOpen(true)}
                    >
                      <UserIcon className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="flex flex-col items-center space-y-4 pb-6">
                    <div className="relative">
                      <Avatar className="h-24 w-24 ring-4 ring-blue-50">
                        <AvatarImage src={user?.image || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                          {user?.name?.charAt(0) || user?.username?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>

                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-bold text-gray-900">{user?.name}</h3>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-gray-600">@{user?.username}</span>
                      </div>
                      {streak && (
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl px-4 py-2 border border-orange-200">
                          <span className="text-sm font-semibold text-orange-700">
                            🔥 {streak.currentStreak} day streak
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-6 mb-6">
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">Email Address</div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-900 font-medium">{user?.email}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 rounded-lg hover:bg-gray-200 transition-colors"
                            onClick={() => copyToClipboard(user?.email || "")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">Member Since</div>
                        <div className="text-sm text-gray-900">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          }) : "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-6 mb-6">
                    <div className="flex flex-col space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start h-12 rounded-xl border-gray-200 hover:bg-gray-50 transition-colors"
                        onClick={() => router.push('/dashboard')}
                      >
                        <Package className="mr-3 h-5 w-5" />
                        <span className="font-medium">Dashboard</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start h-12 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 transition-colors"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-3 h-5 w-5" />
                        <span className="font-medium">Sign Out</span>
                      </Button>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-12 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 transition-colors font-medium"
                        >
                          Deactivate Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action will deactivate your account. You can reactivate it later by logging in.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeactivateAccount}
                            className="bg-red-600 hover:bg-red-700 rounded-xl"
                          >
                            Deactivate
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <div className="md:col-span-2 space-y-6">
              {/* Subscription Card */}
              {isLoading ? (
                <SubscriptionSkeleton />
              ) : (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Subscription</h3>
                      <p className="text-sm text-gray-600 mt-1">Manage your plan and billing</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>

                  {renderSubscriptionCard()}
                </div>
              )}

              {/* Keys & Access Card */}
              {isLoading ? (
                <ApiSkeleton />
              ) : (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Keys & Access</h3>
                      <p className="text-sm text-gray-600 mt-1">Manage your license and API keys</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-xl">
                      <Key className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>

                  <Tabs defaultValue="license" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 rounded-xl">
                      <TabsTrigger value="license" className="rounded-lg">License Keys</TabsTrigger>
                      <TabsTrigger value="api" className="rounded-lg">API Keys</TabsTrigger>
                    </TabsList>

                    <TabsContent value="license" className="space-y-4">
                      {licenseKeys.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl">
                          <div className="p-4 bg-gray-100 rounded-xl w-fit mx-auto mb-4">
                            <Key className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-gray-600 mb-6 text-lg">No license keys found</p>
                          <Button
                            onClick={() => router.push('/plans')}
                            className="h-12 px-6 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-medium"
                          >
                            Get a License
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-3">
                            {licenseKeys.slice(0, 2).map(license => renderKeyItem(license, 'license'))}
                          </div>

                          {licenseKeys.length > 2 && (
                            <Button
                              variant="outline"
                              className="w-full h-12 rounded-xl hover:bg-gray-50 font-medium"
                              onClick={() => setShowKeysModal(true)}
                            >
                              Show All License Keys ({licenseKeys.length})
                            </Button>
                          )}
                        </>
                      )}
                    </TabsContent>

                    <TabsContent value="api" className="space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-gray-600 font-medium">
                          API Keys ({apiKeys.length}/5)
                        </p>
                        {apiKeys.length < 5 && (
                          <Button
                            onClick={generateNewApiKey}
                            className="h-10 px-4 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-medium"
                          >
                            <Key className="h-4 w-4 mr-2" />
                            Generate New Key
                          </Button>
                        )}
                      </div>

                      {apiKeys.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl">
                          <div className="p-4 bg-gray-100 rounded-xl w-fit mx-auto mb-4">
                            <Key className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-gray-600 mb-6 text-lg">No API keys found</p>
                          <Button
                            onClick={generateNewApiKey}
                            className="h-12 px-6 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-medium"
                          >
                            <Key className="h-4 w-4 mr-2" />
                            Generate New API Key
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-3">
                            {apiKeys.slice(0, 2).map(apiKey => renderKeyItem(apiKey, 'api'))}
                          </div>

                          {apiKeys.length > 2 && (
                            <Button
                              variant="outline"
                              className="w-full h-12 rounded-xl hover:bg-gray-50 font-medium"
                              onClick={() => setShowKeysModal(true)}
                            >
                              Show All API Keys ({apiKeys.length})
                            </Button>
                          )}
                        </>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* API Usage Card */}
              {isLoading ? (
                <ApiSkeleton />
              ) : (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">API Usage</h3>
                      <p className="text-sm text-gray-600 mt-1">View your API usage and transactions</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-xl">
                      <BarChart3 className="h-6 w-6 text-green-600" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="font-semibold text-gray-900 mb-4">Recent API Transactions</h4>
                      {apiTransactions.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="p-4 bg-gray-100 rounded-xl w-fit mx-auto mb-4">
                            <BarChart3 className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-gray-600">No transactions found</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {apiTransactions.map((transaction) => (
                            <div key={transaction.id} className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-gray-100">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{transaction.description} - {transaction.amount} credits</div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {new Date(transaction.createdAt).toLocaleString()}
                                </div>
                              </div>
                              <div className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">{transaction.status}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => router.push('/dashboard/transactions')}
                      className="w-full h-12 rounded-xl hover:bg-gray-50 font-medium"
                    >
                      View All Transactions
                    </Button>
                  </div>
                </div>
              )}

              {/* Security Card */}
              {isLoading ? (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <Skeleton className="h-6 w-20 mb-2" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-xl" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <div>
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-3 w-32 mt-1" />
                      </div>
                    </div>
                    <Skeleton className="h-10 w-32 rounded-xl" />
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Security</h3>
                      <p className="text-sm text-gray-600 mt-1">Manage your account security</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-xl">
                      <Shield className="h-6 w-6 text-green-600" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Shield className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Password</div>
                          <div className="text-sm text-gray-600">Last updated: {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "N/A"}</div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => router.push('/change-password')}
                        className="h-10 px-4 rounded-xl hover:bg-gray-50 font-medium"
                      >
                        Change Password
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {user && (
        <EditUserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          user={user}
          onUpdate={handleUpdateUser}
        />
      )}

      {/* All Keys Modal */}
      <Dialog open={showKeysModal} onOpenChange={setShowKeysModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>All Keys</DialogTitle>
            <DialogDescription>
              Manage all your license and API keys
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="license" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="license">License Keys</TabsTrigger>
              <TabsTrigger value="api">API Keys</TabsTrigger>
            </TabsList>

            <TabsContent value="license" className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {licenseKeys.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No license keys found</p>
                </div>
              ) : (
                licenseKeys.map(license => renderKeyItem(license, 'license'))
              )}
            </TabsContent>

            <TabsContent value="api" className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {apiKeys.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No API keys found</p>
                </div>
              ) : (
                <>
                  {apiKeys.map(apiKey => renderKeyItem(apiKey, 'api'))}
                  <Button onClick={generateNewApiKey} className="w-full mt-4">
                    <Key className="h-4 w-4 mr-2" />
                    Generate New API Key
                  </Button>
                </>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* All Plans Modal */}
      <Dialog open={showKeysModal && activePlans.length > 1} onOpenChange={setShowKeysModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>All Active Plans</DialogTitle>
            <DialogDescription>
              View all your subscription plans
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2">
            {activePlans.map((plan, index) => (
              <Card key={index} className={`
                ${plan.vendor?.toLowerCase() === "appsumo"
                  ? "bg-gradient-to-r from-green-50 via-white to-green-50 border-green-200"
                  : plan.vendor?.toLowerCase() === "lemonsqueezy"
                    ? "bg-gradient-to-r from-purple-50 via-white to-purple-50 border-purple-200"
                    : "bg-gradient-to-r from-blue-50 via-white to-blue-50 border-blue-200"
                }
              `}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{getPlanDisplayText(plan)}</h3>
                    {plan.expiresAt && (
                      <span className="text-sm text-muted-foreground flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Expires: {new Date(plan.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 bg-white rounded border">
                      <div className="text-xs text-muted-foreground">Licenses</div>
                      <div className="font-medium">
                        {plan.activeSubLicenses || 1} / {plan.maxSubLicenses || 1}
                      </div>
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <div className="text-xs text-muted-foreground">Type</div>
                      <div className="font-medium">
                        {plan.isTeamConverted ? "Team" : plan.duration || "Lifetime"}
                      </div>
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <div className="text-xs text-muted-foreground">Status</div>
                      <div className="font-medium">Active</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserProfile;