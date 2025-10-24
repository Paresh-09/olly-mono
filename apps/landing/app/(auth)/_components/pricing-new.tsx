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
import Link from "next/link";
import { Tag } from "@/components/Tag";
import { cva } from "class-variance-authority";
import { usePricing } from "@/providers/pricingContext";
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
import { Skeleton } from "@repo/ui/components/ui/skeleton";

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
    // monthlyUrl?: string;
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
                    "bg-gradient-to-r from-[#0C9488] via-[#0a7d73] to-[#086963] text-white border-0 hover:opacity-90",
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

const pricingFeatures = [
    "Unlimited AI Comments per Day",
    "OpenAI, Claude, Gemini, Straico, OpenRouter, Local Models (via Ollama)",
    "AI Personalities",
    "Custom Actions",
    "Gamification & Leaderboard",
    "Full Customisation Suite",
    "Supported on all Social Media Platforms",
    "Priority Support",
];

export function PricingNew() {
    const { buyNowProps } = usePricing();
    const [users, setUsers] = useState(1);
    const [credits, setCredits] = useState<number>(100);
    const [creditPrice, setCreditPrice] = useState<number>(5);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [userPlans, setUserPlans] = useState<PlanDetails[]>([]);
    const [isLoadingPlans, setIsLoadingPlans] = useState<boolean>(true);
    const [planError, setPlanError] = useState<string | null>(null);

    const [hasPremium, setHasPremium] = useState<boolean>(false);
    const [currentVendor, setCurrentVendor] = useState<string | null>(null);

    // Available user tiers
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

    // const getMonthlyPrice = (users: number): string => {
    //     switch (users) {
    //         case 1:
    //             return buyNowProps.monthlyPrice || "$9.99";
    //         case 5:
    //             return buyNowProps.teamMonthlyPrice || "$39";
    //         case 10:
    //             return buyNowProps.agencyMonthlyPrice || "$59";
    //         case 20:
    //             return buyNowProps.companyMonthlyPrice || "$99";
    //         default:
    //             return buyNowProps.monthlyPrice || "$9.99";
    //     }
    // };

    const getLifetimeCredits = (users: number): number => {
        return users * 100;
    };

    // const getMonthlyCredits = (users: number): number => {
    //     return users * 100;
    // };

    const getPerUserPrice = (price: string, users: number): string => {
        const numericPrice = parseFloat(price.replace("$", ""));
        return `$${(numericPrice / users).toFixed(2)}`;
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

    // const getMonthlyUrl = (users: number): string => {
    //     // First check existing context
    //     let url = "";

    //     switch (users) {
    //         case 1:
    //             url = buyNowProps.monthlyUrl || "";
    //             if (!url)
    //                 url =
    //                     "https://olly-ai.lemonsqueezy.com/buy/ccfcb6bb-06c7-4c35-b0f2-949cd3ca7452";
    //             break;
    //         case 5:
    //             url = buyNowProps.teamMonthlyUrl || "";
    //             if (!url)
    //                 url =
    //                     "https://olly-ai.lemonsqueezy.com/buy/dcd88a81-81bb-4a67-896c-4b722fe33f76";
    //             break;
    //         case 10:
    //             url = buyNowProps.agencyMonthlyUrl || "";
    //             if (!url)
    //                 url =
    //                     "https://olly-ai.lemonsqueezy.com/buy/8975b410-3f67-4f78-9550-bfa2bb0aa662";
    //             break;
    //         case 20:
    //             url = buyNowProps.companyMonthlyUrl || "";
    //             if (!url)
    //                 url =
    //                     "https://olly-ai.lemonsqueezy.com/buy/b5b32644-48ac-4389-ba25-2e2e5c0b640a";
    //             break;
    //         default:
    //             url = buyNowProps.monthlyUrl || "";
    //             if (!url)
    //                 url =
    //                     "https://olly-ai.lemonsqueezy.com/buy/ccfcb6bb-06c7-4c35-b0f2-949cd3ca7452";
    //     }

    //     // Append email if user is logged in
    //     if (user?.email && url) {
    //         // Make sure we're not adding the parameter twice
    //         const baseUrl = url.split("?")[0];
    //         return `${baseUrl}?checkout[email]=${encodeURIComponent(user.email)}`;
    //     }

    //     return url;
    // };

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

    // Helper functions to determine user plan types
    // const isUserOnMonthlyPlan = () => {
    //     return userPlans.some((plan) => plan.duration?.toLowerCase() === "monthly");
    // };

    const isUserOnTier1 = () => {
        return userPlans.some(
            (plan) =>
                plan.vendor?.toLowerCase() === "appsumo" &&
                plan.tier === 1 &&
                !plan.isSubLicense,
        );
    };

    // Helper to determine if a user has a lifetime plan
    const isUserOnLifetimePlan = () => {
        return userPlans.some(
            (plan) =>
                (plan.duration?.toLowerCase() === "lifetime" || !plan.duration) &&
                !plan.isSubLicense,
        );
    };

    const plans: Plan[] = [
        {
            name: "Lifetime",
            description: "Unlimited access to all features, forever.",
            price: getLifetimePrice(users),
            period: `up to ${users} User${users > 1 ? "s" : ""} / Lifetime + ${getLifetimeCredits(users)} LLM Credits`,
            features: pricingFeatures,
            tag: { color: "white", text: "Most Loved ❤️" },
            buttonText: isUserOnLifetimePlan() ? "Current Plan" : isUserOnTier1() ? "Upgrade to Tier 2" : "Get Lifetime Access",
            buttonVariant: "default",
            buttonLink: getLifetimeUrl(users),
            highlight: true,
            onButtonClick: () => {
                if (isUserOnTier1()) {
                    window.open("https://appsumo.com/products/upgrade/olly-ai/", "_blank");
                } else if (!isUserOnLifetimePlan()) {
                    window.open(getLifetimeUrl(users), "_blank");
                }
            },
        },
        // {
        //     name: "Monthly",
        //     description: "Unlimited access to all features, billed monthly.",
        //     price: getMonthlyPrice(users),
        //     period: `Per Month (${users} User${users > 1 ? "s" : ""} + ${getMonthlyCredits(users)} LLM Credits)`,
        //     features: pricingFeatures,
        //     tag: { color: "white", text: "Most Loved ❤️" },
        //     buttonText: isUserOnMonthlyPlan() ? "Cancel Plan" : isUserOnLifetimePlan() ? "Included with Lifetime" : "Start 7-Day Free Trial",
        //     buttonVariant: isUserOnMonthlyPlan() ? "destructive" : isUserOnLifetimePlan() ? "outline" : "default",
        //     buttonLink: getMonthlyUrl(users),
        //     highlight: true,
        //     onButtonClick: () => {
        //         if (isUserOnMonthlyPlan()) {
        //             const url = getMonthlyUrl(users);
        //             if (url) window.open(url, "_blank");
        //         } else if (!isUserOnLifetimePlan()) {
        //             const url = getMonthlyUrl(users);
        //             if (url) {
        //                 window.open(url, "_blank");
        //             } else {
        //                 console.error("No valid monthly URL found for", users, "users");
        //             }
        //         }
        //     },
        // },
        {
            name: "Free Forever",
            description: "Get started for free, forever.",
            price: "$0",
            period: "Forever",
            features: [
                "20 Free Comments / Day",
                "Supported on all Social Media Platforms",
                "Limited Customisation Options",
                "Founder Support",
            ],
            unavailableFeatures: [
                "OpenAI, Claude, Gemini, Straico, OpenRouter, Local Models (via Ollama)",
                "AI Personalities",
                "Custom Actions",
                "Gamification & Leaderboard",
                "Full Customisation Suite",
            ],
            buttonText: userPlans.length === 0 ? "Current Plan" : "Free Tier",
            buttonVariant: "outline",
            buttonLink: "https://chromewebstore.google.com/detail/olly-social-media-sidekic/ofjpapfmglfjdhmadpegoeifocomaeje",
        },
    ];

    return (
        <div
            id="pricing"
            className="py-10 sm:py-20 md:py-24"
        >
            <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">


                {isLoadingPlans ? (
                    <div className="space-y-6">
                        {/* User Plan Status Skeleton */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                                <Skeleton className="h-3 w-3 rounded-full" />
                                <Skeleton className="h-3 w-32" />
                                <Skeleton className="h-3 w-12" />
                            </div>
                        </div>

                        {/* User Selection Skeleton */}
                        <div className="mb-10 sm:mb-16">
                            <div className="text-center mb-4 sm:mb-6">
                                <Skeleton className="h-5 sm:h-6 w-48 mx-auto mb-4" />
                            </div>
                            <div className="flex justify-center mb-10">
                                <div className="inline-flex p-1 bg-gray-50 rounded-2xl border border-gray-200 gap-1 sm:gap-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <Skeleton key={i} className="h-10 sm:h-12 w-16 sm:w-20 rounded-xl" />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Pricing Cards Skeleton */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto mt-8">
                            {[1, 2, 3].map((index) => (
                                <div
                                    key={index}
                                    className={`relative rounded-2xl sm:rounded-3xl border border-gray-200 bg-white/50 backdrop-blur-sm ${index === 2 ? "scale-100 sm:scale-105" : ""
                                        }`}
                                >
                                    {/* Popular Badge Skeleton */}
                                    {index === 2 && (
                                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                                            <Skeleton className="h-8 w-24 rounded-full" />
                                        </div>
                                    )}

                                    <div className="p-4 sm:p-8">
                                        {/* Plan Header Skeleton */}
                                        <div className="text-center mb-6 sm:mb-8">
                                            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                                <Skeleton className="h-6 sm:h-8 w-20 sm:w-24" />
                                                {index !== 2 && (
                                                    <Skeleton className="h-5 w-16 rounded-full" />
                                                )}
                                            </div>
                                            <Skeleton className="h-4 sm:h-5 w-3/4 mx-auto mb-4 sm:mb-6" />

                                            {/* Price Skeleton */}
                                            <div className="mb-4 sm:mb-6">
                                                <div className="flex items-baseline justify-center gap-1 sm:gap-2 mb-2">
                                                    <Skeleton className="h-12 sm:h-16 w-20 sm:w-28" />
                                                    <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                                                </div>
                                                <Skeleton className="h-3 sm:h-4 w-2/3 mx-auto" />
                                            </div>

                                            {/* CTA Button Skeleton */}
                                            <Skeleton className="h-12 sm:h-14 w-full rounded-xl sm:rounded-2xl" />
                                        </div>

                                        {/* Additional Info Skeleton */}
                                        <div className="text-center mb-4 sm:mb-6 space-y-2">
                                            <Skeleton className="h-3 sm:h-4 w-4/5 mx-auto" />
                                            <Skeleton className="h-3 sm:h-4 w-1/2 mx-auto" />
                                        </div>

                                        {/* Features List Skeleton */}
                                        <div className="space-y-3 sm:space-y-4">
                                            <Skeleton className="h-4 sm:h-5 w-1/3 mb-2 sm:mb-4" />
                                            <div className="space-y-2 sm:space-y-3">
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map((feature) => (
                                                    <div key={feature} className="flex items-start gap-2 sm:gap-3">
                                                        <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded-full flex-shrink-0 mt-0.5" />
                                                        <Skeleton className="h-3 sm:h-4 w-full max-w-xs" />
                                                    </div>
                                                ))}
                                                {index === 3 && [1, 2, 3, 4, 5].map((feature) => (
                                                    <div key={`unavailable-${feature}`} className="flex items-start gap-2 sm:gap-3">
                                                        <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded-full flex-shrink-0 mt-0.5" />
                                                        <Skeleton className="h-3 sm:h-4 w-full max-w-xs opacity-60" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Manage Subscription Skeleton */}
                        <div className="mt-8">
                            <div className="rounded-lg border bg-white p-4">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-64" />
                                    </div>
                                    <Skeleton className="h-8 w-24 rounded" />
                                </div>
                            </div>
                        </div>

                        {/* Credit Purchase Section Skeleton */}
                        <div className="mt-12 sm:mt-16">
                            <div className="text-center mb-8 sm:mb-12">
                                <Skeleton className="h-8 sm:h-10 w-48 mx-auto mb-3 sm:mb-4" />
                                <Skeleton className="h-4 sm:h-5 w-96 max-w-full mx-auto" />
                            </div>

                            <div className="max-w-4xl mx-auto">
                                <div className="rounded-2xl sm:rounded-3xl border border-gray-200 bg-white/50 backdrop-blur-sm">
                                    <div className="p-6 sm:p-8">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                                            {/* Credit Selection Skeleton */}
                                            <div className="lg:col-span-2 space-y-6">
                                                <div>
                                                    <Skeleton className="h-4 w-32 mb-3" />
                                                    <Skeleton className="h-12 w-full rounded-xl" />
                                                </div>

                                                <div>
                                                    <Skeleton className="h-2 w-full mb-4 rounded-full" />
                                                    <div className="flex justify-between">
                                                        {[1, 2, 3, 4, 5].map((i) => (
                                                            <Skeleton key={i} className="h-3 w-8" />
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <Skeleton className="h-4 w-24 mb-3" />
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                                                        {[1, 2, 3, 4].map((i) => (
                                                            <Skeleton key={i} className="h-8 w-full rounded-lg" />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Purchase Summary Skeleton */}
                                            <div className="lg:col-span-1">
                                                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl sm:rounded-2xl p-6 border border-gray-200/50 h-full flex flex-col">
                                                    <div className="text-center mb-6">
                                                        <Skeleton className="h-5 w-32 mx-auto mb-4" />
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between">
                                                                <Skeleton className="h-3 w-12" />
                                                                <Skeleton className="h-3 w-16" />
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <Skeleton className="h-3 w-8" />
                                                                <Skeleton className="h-3 w-20" />
                                                            </div>
                                                            <div className="border-t border-gray-200 pt-3">
                                                                <div className="flex justify-between items-center">
                                                                    <Skeleton className="h-4 w-10" />
                                                                    <Skeleton className="h-6 w-12" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-auto space-y-3">
                                                        <Skeleton className="h-12 w-full rounded-xl" />
                                                        <Skeleton className="h-3 w-3/4 mx-auto" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Notes Skeleton */}
                        <div className="space-y-1 mt-2">
                            <Skeleton className="h-3 w-4/5 mx-auto" />
                            <Skeleton className="h-3 w-3/5 mx-auto" />
                        </div>

                        {/* Contact Sales Skeleton */}
                        <div className="mt-4">
                            <div className="rounded-lg bg-gray-50 border-none p-4">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-3 w-72" />
                                    </div>
                                    <Skeleton className="h-8 w-24 rounded" />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : planError ? (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTitle>{planError}</AlertTitle>
                    </Alert>
                ) : (
                    <div className="space-y-6">
                        {/* User Plan Status */}
                        {userPlans.length > 0 && (
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
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
                            </div>
                        )}

                        {/* User Selection */}
                        <div className="mb-10 sm:mb-16">
                            <p className="text-center text-base sm:text-lg font-medium mb-4 sm:mb-6 text-gray-700">
                                Select number of users
                            </p>
                            <div className="flex justify-center mb-10">
                                <div className="inline-flex p-1 bg-gray-50 rounded-2xl border border-gray-200 gap-1 sm:gap-2">
                                    {userTiers.map((tier) => (
                                        <button
                                            key={tier}
                                            onClick={() => setUsers(tier)}
                                            className={`
                        px-4 sm:px-8 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all duration-200
                        ${users === tier
                                                    ? "bg-white shadow-lg text-[#0C9488] scale-105"
                                                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                                                }
                      `}
                                        >
                                            {tier} {tier === 1 ? "User" : "Users"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Pricing Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto mt-8 justify-items-center">
                            {plans.map((plan, index) => (
                                <div
                                    key={index}
                                    className={`relative rounded-2xl sm:rounded-3xl border transition-all duration-300 group w-full max-w-sm ${plan.highlight
                                        ? "border-[#0C9488]/30 bg-[#0C9488]/5 backdrop-blur-sm shadow-xl hover:shadow-2xl scale-100 sm:scale-105"
                                        : "border-gray-200 bg-white/50 backdrop-blur-sm hover:border-gray-300 hover:shadow-lg"
                                        }`}
                                >
                                    {/* Popular Badge */}
                                    {plan.highlight && (
                                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                                            <div className="bg-gradient-to-r from-[#0C9488] to-[#0a7d73] text-white px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium shadow-lg">
                                                Most Popular
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-4 sm:p-8">
                                        {/* Plan Header */}
                                        <div className="text-center mb-6 sm:mb-8">
                                            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                                <h3 className="text-lg sm:text-2xl font-bold text-gray-900">
                                                    {plan.name}
                                                </h3>
                                                {plan.tag && !plan.highlight && (
                                                    <Tag color={plan.tag.color}>{plan.tag.text}</Tag>
                                                )}
                                            </div>
                                            <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                                                {plan.description}
                                            </p>

                                            {/* Price */}
                                            <div className="mb-4 sm:mb-6">
                                                <div className="flex items-baseline justify-center gap-1 sm:gap-2">
                                                    <span className="text-3xl sm:text-5xl font-bold text-gray-900">
                                                        {plan.price}
                                                    </span>
                                                    {plan.name !== "Free Forever" && (
                                                        <span className="text-xs sm:text-sm text-gray-500 font-medium">
                                                            ({getPerUserPrice(plan.price, users)}/user)
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-gray-600 mt-1 sm:mt-2 font-medium text-xs sm:text-base">
                                                    {plan.period}
                                                </p>
                                            </div>

                                            {/* CTA Button */}
                                            <button
                                                onClick={plan.onButtonClick || (() => {
                                                    if (plan.buttonLink.startsWith('http')) {
                                                        window.open(plan.buttonLink, "_blank");
                                                    }
                                                })}
                                                disabled={plan.buttonText.includes("Current Plan") || plan.buttonText.includes("Included with Lifetime")}
                                                className={`block w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg transition-all duration-200 ${plan.highlight
                                                    ? "bg-gradient-to-r from-[#0C9488] to-[#0a7d73] text-white hover:from-[#0a7d73] hover:to-[#086963] shadow-lg hover:shadow-xl hover:scale-105"
                                                    : plan.buttonVariant === "outline"
                                                        ? "border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                                                        : plan.buttonVariant === "destructive"
                                                            ? "bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg hover:scale-105"
                                                            : (plan.buttonText.includes("Current Plan") || plan.buttonText.includes("Included with Lifetime"))
                                                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                                : "bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg hover:scale-105"
                                                    }`}
                                            >
                                                {plan.buttonText}
                                            </button>
                                        </div>

                                        {/* Additional Info */}
                                        <div className="text-center mb-4 sm:mb-6 space-y-1 sm:space-y-2">
                                            <p className="text-xs sm:text-sm text-gray-600">
                                                Runs fully locally & with Popular Text Generation Models.
                                            </p>
                                            {plan.name !== "Free Forever" && (
                                                <Link href="/ai-cost-calculators" target="_blank" className="text-xs sm:text-sm text-[#0C9488] hover:text-[#0a7d73] font-medium">
                                                    API Cost calculator →
                                                </Link>
                                            )}
                                        </div>

                                        {/* Features List */}
                                        <div className="space-y-3 sm:space-y-4">
                                            <h4 className="font-semibold text-gray-900 text-base sm:text-lg mb-2 sm:mb-4">What's included:</h4>
                                            <ul className="space-y-2 sm:space-y-3">
                                                {plan.features.map((feature, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 sm:gap-3">
                                                        <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#0C9488] flex-shrink-0 mt-0.5" />
                                                        <span className="text-gray-700 text-xs sm:text-sm leading-relaxed">{feature}</span>
                                                    </li>
                                                ))}
                                                {plan.unavailableFeatures &&
                                                    plan.unavailableFeatures.map((feature, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 sm:gap-3">
                                                            <XIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                                            <span className="text-gray-500 text-xs sm:text-sm leading-relaxed line-through">{feature}</span>
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Manage Subscription */}
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

                        <div className="my-16 h-1"></div>

                        {/* Credit Purchase Section */}
                        <div className="mt-24 sm:mt-32">
                            <div className="text-center mb-8 sm:mb-12">
                                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                                    Add LLM Credits
                                </h3>
                                <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
                                    Purchase additional credits for AI tools and API calls. Credits never expire and work with all supported models.
                                </p>
                            </div>

                            <div className="max-w-4xl mx-auto">
                                <div className="relative rounded-2xl sm:rounded-3xl border border-gray-200 bg-white/50 backdrop-blur-sm hover:border-gray-300 hover:shadow-lg transition-all duration-300">
                                    <div className="p-6 sm:p-8">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                                            {/* Credit Selection */}
                                            <div className="lg:col-span-2 space-y-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                                                        Select Credits Amount
                                                    </label>
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            value={credits}
                                                            onChange={(e) =>
                                                                setCredits(
                                                                    Math.max(100, parseInt(e.target.value) || 100),
                                                                )
                                                            }
                                                            min="100"
                                                            className="h-12 text-lg font-medium border-2 border-gray-200 focus:border-[#0C9488] focus:ring-[#0C9488]/20 rounded-xl"
                                                            placeholder="Enter credit amount"
                                                        />
                                                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                                            credits
                                                        </span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="mb-4">
                                                        <Slider
                                                            value={[credits]}
                                                            onValueChange={(value) => setCredits(value[0])}
                                                            min={100}
                                                            max={10000}
                                                            step={100}
                                                            className="my-6"
                                                        />
                                                    </div>
                                                    <div className="flex justify-between text-xs text-gray-500 font-medium">
                                                        <span>100</span>
                                                        <span>2,500</span>
                                                        <span>5,000</span>
                                                        <span>7,500</span>
                                                        <span>10,000+</span>
                                                    </div>
                                                </div>

                                                {/* Quick Select Options */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                                                        Quick Select
                                                    </label>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                                                        {[500, 1000, 2500, 5000].map((amount) => (
                                                            <button
                                                                key={amount}
                                                                onClick={() => setCredits(amount)}
                                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${credits === amount
                                                                    ? "bg-[#0C9488] text-white shadow-md"
                                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                                    }`}
                                                            >
                                                                {amount.toLocaleString()}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Purchase Summary */}
                                            <div className="lg:col-span-1">
                                                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl sm:rounded-2xl p-6 border border-gray-200/50 h-full flex flex-col">
                                                    <div className="text-center mb-6">
                                                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                                            Purchase Summary
                                                        </h4>
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">Credits:</span>
                                                                <span className="font-medium">{credits.toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">Rate:</span>
                                                                <span className="font-medium">${(creditPrice / credits).toFixed(4)}/credit</span>
                                                            </div>
                                                            <div className="border-t border-gray-200 pt-2 mt-3">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="font-semibold text-gray-900">Total:</span>
                                                                    <span className="text-2xl font-bold text-[#0C9488]">${creditPrice}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-auto">
                                                        <button
                                                            onClick={handleCreditPurchase}
                                                            disabled={isLoading}
                                                            className="w-full bg-gradient-to-r from-[#0C9488] to-[#0a7d73] text-white py-3 sm:py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 hover:from-[#0a7d73] hover:to-[#086963] shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                                        >
                                                            {isLoading ? (
                                                                <span className="flex items-center justify-center gap-2">
                                                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                                    </svg>
                                                                    Processing...
                                                                </span>
                                                            ) : (
                                                                "Buy Credits"
                                                            )}
                                                        </button>

                                                        <p className="text-xs text-gray-500 text-center mt-3 leading-relaxed">
                                                            Secure payment via Lemon Squeezy. Credits are instantly added to your account.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1 text-xs text-gray-500 italic mt-2">
                            <p>
                            {/* Note: Lifetime access pays for itself in just 5 months compared to
                            monthly. */}
                                Note: Lifetime access provides unlimited value with one-time payment.
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
        </div>
    );
}
