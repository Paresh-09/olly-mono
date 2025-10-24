"use client";

import React, { useEffect, useState } from "react";
import {
  BadgeCheck,
  CalendarIcon,
  CheckIcon,
  SparklesIcon,
  Users2Icon,
  XIcon,
  Loader2,
  HelpCircleIcon,
  StarIcon,
  ShieldIcon,
  ZapIcon,
} from "lucide-react";
import { Tag } from "@/components/Tag";
import { cva } from "class-variance-authority";
import { usePricing } from "@/providers/pricingContext";
// Pricing features inline since marketing components were removed
const pricingFeatures = {
  starter: ["Basic dashboard access", "Limited API calls"],
  pro: ["Full dashboard access", "Unlimited API calls", "Priority support"],
  enterprise: ["Everything in Pro", "Custom integrations", "Dedicated support"]
};
import axios from "axios";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { calculateCreditPrice } from "@/lib/utils";
import { Alert, AlertTitle } from "@repo/ui/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { useSession } from "@/providers/SessionProvider";
import { Slider } from "@repo/ui/components/ui/slider";
import { Badge } from "@repo/ui/components/ui/badge";
import { Separator } from "@repo/ui/components/ui/separator";

type TagColor = "green" | "white" | "red";

interface Plan {
  name: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  unavailableFeatures?: string[];
  buttonText: string;
  buttonVariant?:
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "premium";
  buttonLink: string;
  tag?: {
    color: TagColor;
    text: string;
  };
  highlight?: boolean;
  onButtonClick?: () => void;
}

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        premium:
          "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0 hover:opacity-90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface PlanDetails {
  name: string;
  vendor?: string;
  tier?: number;
  price?: string;
  subLicenses: number;
  isSubLicense?: boolean;
  productId?: string;
  duration?: string;
  description?: string;
  expiresAt?: string;
  url?: string;
  monthlyUrl?: string;
  activeSubLicenses?: number;
  maxSubLicenses?: number;
  isTeamConverted?: boolean;
  key: string;
  totalSubLicenses?: number;
  canUpgrade?: boolean;
}

interface UserPlanResponse {
  plans: PlanDetails[];
  hasPremium: boolean;
}

export function Pricing() {
  const [lifetimeUsers, setLifetimeUsers] = useState<number>(1);
  const { buyNowProps } = usePricing();
  const [users, setUsers] = useState<number>(1);
  const [credits, setCredits] = useState<number>(100);
  const [creditPrice, setCreditPrice] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [userPlans, setUserPlans] = useState<PlanDetails[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState<boolean>(true);
  const [planError, setPlanError] = useState<string | null>(null);

  const [hasPremium, setHasPremium] = useState<boolean>(false);
  const [currentVendor, setCurrentVendor] = useState<string | null>(null);

  const userTiers = [1, 5, 10, 20];
  const { user } = useSession();

  const deduplicatePlans = (plans: PlanDetails[]): PlanDetails[] => {
    const seen = new Set();
    return plans.filter((plan) => {
      const key = `${plan.vendor}-${plan.tier}-${plan.duration}-${plan.subLicenses}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  };

  const getPlanDisplayText = (plan: PlanDetails) => {
    if (!plan) return "";

    if (plan.isSubLicense) {
      const tierText = plan.tier ? ` (Tier ${plan.tier})` : "";
      return `Team Member${tierText}`;
    }

    const planName = plan.name || "Unknown Plan";
    const vendorName = plan.vendor
      ? `${plan.vendor.charAt(0).toUpperCase()}${plan.vendor.slice(1)}`
      : "";

    if (plan.tier && plan.vendor?.toLowerCase() === "appsumo") {
      return `AppSumo ${planName} (Tier ${plan.tier})`;
    }

    if (plan.vendor?.toLowerCase() === "lemonsqueezy") {
      return `${planName} (Lifetime)`;
    }

    if (plan.vendor?.toLowerCase() === "olly") {
      return `${planName} (Internal)`;
    }

    return vendorName ? `${vendorName} ${planName}` : planName;
  };

  useEffect(() => {
    const fetchUserPlans = async () => {
      setIsLoadingPlans(true);
      setPlanError(null);
      try {
        const response = await axios.get<UserPlanResponse>("/api/user/plans");
        if (response.data.plans) {
          const uniquePlans = response.data.plans;
          setUserPlans(uniquePlans);
          setHasPremium(response.data.hasPremium);

          if (uniquePlans.length > 0) {
            const hasAppSumoTier7 = uniquePlans.some(
              (plan) =>
                plan.vendor?.toLowerCase() === "appsumo" && plan.tier === 7,
            );

            if (hasAppSumoTier7) {
              setUsers(5);
            } else {
              const appSumoTier = uniquePlans.find(
                (plan) => plan.vendor?.toLowerCase() === "appsumo",
              )?.tier;
              if (appSumoTier === 1) {
                setUsers(1);
              } else if (appSumoTier === 2) {
                setUsers(5);
              } else if (appSumoTier === 3) {
                setUsers(10);
              } else {
                const maxSubLicenses = Math.max(
                  ...uniquePlans.map((plan) => plan.maxSubLicenses || 1),
                );
                setUsers(maxSubLicenses > 20 ? 20 : maxSubLicenses);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user plans:", error);
        setPlanError(
          "Failed to load your plan details. Please try again later.",
        );
      } finally {
        setIsLoadingPlans(false);
      }
    };

    fetchUserPlans();
  }, []);

  const getLifetimePrice = (users: number): string => {
    switch (users) {
      case 1:
        return buyNowProps.price || "$49.99";
      case 5:
        return buyNowProps.teamPrice || "$199";
      case 10:
        return buyNowProps.agencyPrice || "$299";
      case 20:
        return buyNowProps.companyPrice || "$499";
      default:
        return buyNowProps.price || "$49.99";
    }
  };

  const getMonthlyPrice = (users: number): string => {
    switch (users) {
      case 1:
        return buyNowProps.monthlyPrice || "$9.99";
      case 5:
        return buyNowProps.teamMonthlyPrice || "$39";
      case 10:
        return buyNowProps.agencyMonthlyPrice || "$59";
      case 20:
        return buyNowProps.companyMonthlyPrice || "$99";
      default:
        return buyNowProps.monthlyPrice || "$9.99";
    }
  };

  const getLifetimeCredits = (users: number): number => {
    return users * 100;
  };

  const getMonthlyCredits = (users: number): number => {
    return users * 100;
  };

  const getLifetimeUrl = (users: number): string => {
    let baseUrl;
    switch (users) {
      case 1:
        baseUrl =
          buyNowProps.url ||
          "https://olly-ai.lemonsqueezy.com/buy/fa11a2cb-4f49-4959-a95a-215b29c51e89";
        break;
      case 5:
        baseUrl =
          buyNowProps.teamUrl ||
          "https://olly-ai.lemonsqueezy.com/buy/bc98afd2-5a3b-42c5-adf9-60a0aa3df338";
        break;
      case 10:
        baseUrl =
          buyNowProps.agencyUrl ||
          "https://olly-ai.lemonsqueezy.com/buy/401cc038-a90f-4cda-98f9-180e2bede638";
        break;
      case 20:
        baseUrl =
          buyNowProps.companyUrl ||
          "https://olly-ai.lemonsqueezy.com/buy/c29d14d4-7831-4791-84b4-f3bd19c2c36e";
        break;
      default:
        baseUrl =
          buyNowProps.url ||
          "https://olly-ai.lemonsqueezy.com/buy/fa11a2cb-4f49-4959-a95a-215b29c51e89";
    }

    if (user?.email) {
      return `${baseUrl}?checkout[email]=${encodeURIComponent(user.email)}`;
    }

    return baseUrl;
  };

  const getMonthlyUrl = (users: number): string => {
    // First check existing context
    let url = "";

    switch (users) {
      case 1:
        url = buyNowProps.monthlyUrl || "";
        if (!url)
          url =
            "https://olly-ai.lemonsqueezy.com/buy/ccfcb6bb-06c7-4c35-b0f2-949cd3ca7452";
        break;
      case 5:
        url = buyNowProps.teamMonthlyUrl || "";
        if (!url)
          url =
            "https://olly-ai.lemonsqueezy.com/buy/dcd88a81-81bb-4a67-896c-4b722fe33f76";
        break;
      case 10:
        url = buyNowProps.agencyMonthlyUrl || "";
        if (!url)
          url =
            "https://olly-ai.lemonsqueezy.com/buy/8975b410-3f67-4f78-9550-bfa2bb0aa662";
        break;
      case 20:
        url = buyNowProps.companyMonthlyUrl || "";
        if (!url)
          url =
            "https://olly-ai.lemonsqueezy.com/buy/b5b32644-48ac-4389-ba25-2e2e5c0b640a";
        break;
      default:
        url = buyNowProps.monthlyUrl || "";
        if (!url)
          url =
            "https://olly-ai.lemonsqueezy.com/buy/ccfcb6bb-06c7-4c35-b0f2-949cd3ca7452";
    }

    // Append email if user is logged in
    if (user?.email && url) {
      // Make sure we're not adding the parameter twice
      const baseUrl = url.split("?")[0];
      return `${baseUrl}?checkout[email]=${encodeURIComponent(user.email)}`;
    }

    return url;
  };

  useEffect(() => {
    setCreditPrice(calculateCreditPrice(credits));
  }, [credits]);

  const handleCreditPurchase = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/checkout/credits", {
        customPrice: Math.round(creditPrice * 100),
        productOptions: {
          name: `${credits} Credits`,
          description: `Purchase ${credits} credits for your account`,
        },
        checkoutData: {
          custom: {
            credits: credits,
          },
        },
      });

      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const featureSections = [
    {
      section: "Usage Limits",
      icon: <ZapIcon className="h-4 w-4" />,
      items: [
        { name: "AI Comments / Day", free: "5", paid: "Unlimited" },
        { name: "API/LLM Credits", free: "5", paid: "100-2000" },
        { name: "Users", free: "1", paid: "1-20" },
      ],
    },
    {
      section: "Core Features",
      icon: <StarIcon className="h-4 w-4" />,
      items: [
        { name: "Priority Support", free: false, paid: true },
        { name: "Bring Your Own API Key", free: false, paid: true },
        { name: "Model Selection", free: false, paid: true },
        { name: "Custom Voice/Tone", free: false, paid: true },
      ],
    },
    {
      section: "Premium",
      icon: <ShieldIcon className="h-4 w-4" />,
      items: [
        { name: "AI Personalities", free: false, paid: true },
        { name: "Virality Score", free: false, paid: true },
        { name: "One-click Comments", free: false, paid: true },
      ],
    },
  ];

  // Create dynamically updated versions of the feature sections for different plan types
  const getLifetimeFeatureSections = () => {
    return [
      {
        section: "Usage Limits",
        icon: <ZapIcon className="h-4 w-4" />,
        items: [
          { name: "AI Comments / Day", free: "5", paid: "Unlimited" },
          {
            name: "API/LLM Credits",
            free: "5",
            paid: `${getLifetimeCredits(users)}`,
          },
          { name: "Users", free: "1", paid: `${users}` },
        ],
      },
      {
        section: "Core Features",
        icon: <StarIcon className="h-4 w-4" />,
        items: [
          { name: "Priority Support", free: false, paid: true },
          { name: "Bring Your Own API Key", free: false, paid: true },
          { name: "Model Selection", free: false, paid: true },
          { name: "Custom Voice/Tone", free: false, paid: true },
        ],
      },
      {
        section: "Premium",
        icon: <ShieldIcon className="h-4 w-4" />,
        items: [
          { name: "AI Personalities", free: false, paid: true },
          { name: "Virality Score", free: false, paid: true },
          { name: "One-click Comments", free: false, paid: true },
        ],
      },
    ];
  };

  const getMonthlyFeatureSections = () => {
    return [
      {
        section: "Usage Limits",
        icon: <ZapIcon className="h-4 w-4" />,
        items: [
          { name: "AI Comments / Day", free: "5", paid: "Unlimited" },
          {
            name: "API/LLM Credits",
            free: "5",
            paid: `${getMonthlyCredits(users)}`,
          },
          { name: "Users", free: "1", paid: `${users}` },
        ],
      },
      {
        section: "Core Features",
        icon: <StarIcon className="h-4 w-4" />,
        items: [
          { name: "Priority Support", free: false, paid: true },
          { name: "Bring Your Own API Key", free: false, paid: true },
          { name: "Model Selection", free: false, paid: true },
          { name: "Custom Voice/Tone", free: false, paid: true },
        ],
      },
      {
        section: "Premium",
        icon: <ShieldIcon className="h-4 w-4" />,
        items: [
          { name: "AI Personalities", free: false, paid: true },
          { name: "Virality Score", free: false, paid: true },
          { name: "One-click Comments", free: false, paid: true },
        ],
      },
    ];
  };

  const renderFeatureItem = (feature: any, isPaid = false) => {
    if (typeof feature === "boolean") {
      return feature ? (
        <CheckIcon
          className={`h-4 w-4 ${isPaid ? "text-green-500" : "text-gray-500"}`}
        />
      ) : (
        <XIcon className="h-4 w-4 text-gray-300" />
      );
    }
    return <span className={isPaid ? "font-medium" : ""}>{feature}</span>;
  };

  // Add helper functions to determine user plan types
  const isUserOnMonthlyPlan = () => {
    return userPlans.some((plan) => plan.duration?.toLowerCase() === "monthly");
  };

  const isUserOnTier1 = () => {
    return userPlans.some(
      (plan) =>
        plan.vendor?.toLowerCase() === "appsumo" &&
        plan.tier === 1 &&
        !plan.isSubLicense,
    );
  };

  // Add a helper to determine if a user has a lifetime plan
  const isUserOnLifetimePlan = () => {
    return userPlans.some(
      (plan) =>
        (plan.duration?.toLowerCase() === "lifetime" || !plan.duration) &&
        !plan.isSubLicense,
    );
  };

  return (
    <div
      id="pricing"
      className="relative mx-auto max-w-7xl bg-white px-4 pb-20 pt-6 sm:px-6 lg:px-8"
    >
      {isLoadingPlans ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : planError ? (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>{planError}</AlertTitle>
        </Alert>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {userPlans.length > 0 && (
              <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg text-xs">
                <BadgeCheck className="h-3 w-3 text-blue-600 flex-shrink-0" />
                <span className="truncate">
                  {userPlans.some((plan) => plan.isSubLicense)
                    ? "You're on a team plan"
                    : `${userPlans.length} active plan${userPlans.length > 1 ? "s" : ""}`}
                </span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-blue-600 text-xs"
                    >
                      Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Your Active Plans</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-3 mt-2">
                      {userPlans.map((plan, index) => (
                        <div
                          key={plan.key || index}
                          className="p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">
                              {getPlanDisplayText(plan)}
                            </span>
                            {plan.expiresAt && (
                              <span className="text-xs text-gray-500">
                                Expires:{" "}
                                {new Date(plan.expiresAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 flex flex-wrap gap-3">
                            <span>
                              Licenses: {plan.activeSubLicenses || 1}/
                              {plan.maxSubLicenses || 1}
                            </span>
                            <span>Type: {plan.duration || "Lifetime"}</span>
                            {plan.vendor && plan.tier && (
                              <span>Tier: {plan.tier}</span>
                            )}
                            {plan.isSubLicense && (
                              <span className="text-blue-600 font-medium">
                                Team Member
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          window.open(
                            "https://app.lemonsqueezy.com/my-orders",
                            "_blank",
                          )
                        }
                        className="text-xs"
                      >
                        Manage Subscription
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            <div className="flex-grow">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium whitespace-nowrap">
                  Users:
                </label>
                <div className="flex gap-1 flex-grow">
                  {userTiers.map((tier) => (
                    <Button
                      key={tier}
                      type="button"
                      size="sm"
                      variant={users === tier ? "default" : "outline"}
                      onClick={() => setUsers(tier)}
                      className="flex-1 h-8 px-2 text-xs"
                    >
                      {tier} {tier === 1 ? "User" : "Users"}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
              className={`flex flex-col ${userPlans.length === 0 ? "border-2 border-blue-100" : ""}`}
            >
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="font-cal">Free</CardTitle>
                <CardDescription>Basic access</CardDescription>
                <div className="mt-1">
                  <span className="text-2xl font-bold">$0</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow py-2">
                <div className="space-y-3">
                  {featureSections.map((section) => (
                    <div key={section.section}>
                      <div className="flex items-center gap-1 mb-1 text-sm font-medium text-gray-700">
                        {section.icon}
                        <span>{section.section}</span>
                      </div>
                      <ul className="space-y-1 text-sm">
                        {section.items.map((item) => (
                          <li
                            key={item.name}
                            className="flex justify-between items-center"
                          >
                            <span className="text-gray-600">{item.name}</span>
                            <span className="flex items-center">
                              {renderFeatureItem(item.free)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <Separator className="my-1" />
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-1">
                <Button disabled variant="outline" className="w-full">
                  {userPlans.length === 0 ? "Current Plan" : "Free Tier"}
                </Button>
              </CardFooter>
            </Card>

            <Card
              className={`flex flex-col relative overflow-hidden ${userPlans.length > 0 ? "border-0" : ""}`}
            >
              {isUserOnLifetimePlan() && (
                <>
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                  <div className="absolute inset-0.5 rounded-lg bg-white"></div>
                  <div className="absolute inset-0 rounded-lg shadow-lg"></div>
                </>
              )}
              <div className="relative z-10 flex flex-col h-full">
                <CardHeader className="pb-3 pt-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-cal">Lifetime</CardTitle>
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                      Popular
                    </Badge>
                  </div>
                  <CardDescription>One-time payment</CardDescription>
                  <div className="mt-1">
                    <span className="text-2xl font-bold">
                      {getLifetimePrice(users)}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">
                      for {users} {users === 1 ? "user" : "users"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow py-2">
                  <div className="space-y-3">
                    {getLifetimeFeatureSections().map((section) => (
                      <div key={section.section}>
                        <div className="flex items-center gap-1 mb-1 text-sm font-medium text-gray-700">
                          {section.icon}
                          <span>{section.section}</span>
                        </div>
                        <ul className="space-y-1 text-sm">
                          {section.items.map((item) => (
                            <li
                              key={item.name}
                              className="flex justify-between items-center"
                            >
                              <span className="text-gray-600">{item.name}</span>
                              <span className="flex items-center text-blue-600">
                                {renderFeatureItem(item.paid, true)}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <Separator className="my-1" />
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-1">
                  {userPlans.length > 0 ? (
                    isUserOnTier1() ? (
                      <Button
                        className="w-full"
                        onClick={() =>
                          window.open(
                            "https://appsumo.com/products/upgrade/olly-ai/",
                            "_blank",
                          )
                        }
                      >
                        Upgrade to Tier 2
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => {
                          if (!isUserOnLifetimePlan()) {
                            window.open(getLifetimeUrl(users), "_blank");
                          }
                        }}
                      >
                        {isUserOnLifetimePlan()
                          ? "Current Plan"
                          : "Get Lifetime Access"}
                      </Button>
                    )
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() =>
                        window.open(getLifetimeUrl(users), "_blank")
                      }
                    >
                      Get Lifetime Access
                    </Button>
                  )}
                </CardFooter>
              </div>
            </Card>

            <Card className="flex flex-col">
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="font-cal">Monthly</CardTitle>
                <CardDescription>Subscription</CardDescription>
                <div className="mt-1">
                  <span className="text-2xl font-bold">
                    {getMonthlyPrice(users)}
                  </span>
                  <span className="text-gray-500 text-sm ml-1">per month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow py-2">
                <div className="space-y-3">
                  {getMonthlyFeatureSections().map((section) => (
                    <div key={section.section}>
                      <div className="flex items-center gap-1 mb-1 text-sm font-medium text-gray-700">
                        {section.icon}
                        <span>{section.section}</span>
                      </div>
                      <ul className="space-y-1 text-sm">
                        {section.items.map((item) => (
                          <li
                            key={item.name}
                            className="flex justify-between items-center"
                          >
                            <span className="text-gray-600">{item.name}</span>
                            <span className="flex items-center">
                              {renderFeatureItem(item.paid, true)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <Separator className="my-1" />
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-1">
                {isUserOnMonthlyPlan() ? (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      const url = getMonthlyUrl(users);
                      if (url) window.open(url, "_blank");
                    }}
                  >
                    Cancel Plan
                  </Button>
                ) : (
                  <Button
                    variant={isUserOnLifetimePlan() ? "outline" : "default"}
                    className="w-full"
                    disabled={isUserOnLifetimePlan()}
                    onClick={() => {
                      if (isUserOnLifetimePlan()) return;
                      const url = getMonthlyUrl(users);
                      if (url) {
                        window.open(url, "_blank");
                      } else {
                        console.error(
                          "No valid monthly URL found for",
                          users,
                          "users",
                        );
                      }
                    }}
                  >
                    {isUserOnLifetimePlan()
                      ? "Included with Lifetime"
                      : "Start 7-Day Free Trial"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>

          {userPlans.length > 0 && (
            <Card className="mt-8">
              <CardContent className="flex justify-between items-center py-4">
                <div className="text-sm">
                  <span className="font-medium">Manage Your Subscription</span>
                  <span className="ml-2 text-gray-600">
                    View billing history, update payment method, or cancel plan
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(
                      "https://app.lemonsqueezy.com/my-orders",
                      "_blank",
                    )
                  }
                >
                  Manage Subscription
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Add LLM Credits</CardTitle>
              <CardDescription>
                Purchase additional credits for AI tools and API calls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="mb-4">
                    <Input
                      type="number"
                      value={credits}
                      onChange={(e) =>
                        setCredits(
                          Math.max(100, parseInt(e.target.value) || 100),
                        )
                      }
                      min="100"
                      className="h-10"
                    />
                    <Slider
                      value={[credits]}
                      onValueChange={(value) => setCredits(value[0])}
                      min={100}
                      max={10000}
                      step={100}
                      className="my-4"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>100</span>
                      <span>2,500</span>
                      <span>5,000</span>
                      <span>7,500</span>
                      <span>10,000</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="mb-3">
                    <div className="text-2xl font-bold">${creditPrice}</div>
                    <div className="text-sm text-gray-500">
                      for {credits} credits
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleCreditPurchase}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Buy Credits"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-1 text-xs text-gray-500 italic mt-2">
            <p>
              Note: Lifetime access pays for itself in just 5 months compared to
              monthly.
            </p>
            <p>
              Lifetime credits don't renew or expire. No refunds on any plans
              unless on promo period.
            </p>
          </div>

          <Card className="mt-4 bg-gray-50 border-none">
            <CardContent className="flex justify-between items-center py-4">
              <div className="text-sm">
                <span className="font-medium">Need more?</span>
                <span className="ml-2 text-gray-600">
                  Get enterprise features, priority support, team management
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("/contact-sales", "_blank")}
              >
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
