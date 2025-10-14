// license-list.tsx
"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert";
import { Copy, Check, Eye, EyeOff, Users, AlertCircle, Key, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import LicenseConversion from "./license-conversion";
import { PLANS, PlanConfig } from "@/lib/plans/plans-config";
import { PlanTier } from "@repo/db";
import { Badge } from "@repo/ui/components/ui/badge";
import { toast } from "@repo/ui/hooks/use-toast";

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

interface LicensesListProps {
  licenses: License[];
  subLicenses?: SubLicense[];
}

export default function LicensesList({ licenses, subLicenses = [] }: LicensesListProps) {
  const [visibleLicenses, setVisibleLicenses] = useState<{ [key: string]: boolean }>({});
  const [showConversion, setShowConversion] = useState(false);
  const router = useRouter();

  const convertibleLicensesInfo = useMemo(() => {
    const activeLicenses = licenses.filter(
      (license) =>
        license.licenseKey.isActive && !isTeamLicense(license.licenseKey.tier),
    );

    const licensesByVendor = groupByVendor(activeLicenses);

    for (const [vendor, vendorLicenses] of Object.entries(licensesByVendor)) {
      const eligibleLicenses = vendorLicenses.filter(isEligibleForConversion);

      if (eligibleLicenses.length >= 2) {
        return {
          hasConvertible: true,
          convertibleLicenses: eligibleLicenses,
          vendor,
        };
      }
    }

    return { hasConvertible: false, convertibleLicenses: [], vendor: null };
  }, [licenses]);

  const activeLicenses = useMemo(() => {
    const allLicenses = [
      ...licenses.map((license) => ({
        ...license,
        isSubLicense: false,
      })),
      ...subLicenses.map((subLicense) => ({
        licenseKey: {
          id: subLicense.id,
          key: subLicense.key,
          isActive: subLicense.status === "ACTIVE",
          tier: subLicense.mainLicenseKey.tier,
          vendor: subLicense.mainLicenseKey.vendor,
          lemonProductId: subLicense.mainLicenseKey.lemonProductId,
        },
        userId: subLicense.assignedEmail || "",
        licenseKeyId: subLicense.id,
        assignedAt: new Date(),
        isSubLicense: true,
      })),
    ];

    return allLicenses
      .filter((license) => license.licenseKey.isActive)
      .sort((a, b) => {
        const aIsTeamPlan = isTeamLicense(a.licenseKey.tier);
        const bIsTeamPlan = isTeamLicense(b.licenseKey.tier);

        if (aIsTeamPlan && !bIsTeamPlan) return -1;
        if (bIsTeamPlan && !aIsTeamPlan) return 1;

        return 0;
      });
  }, [licenses, subLicenses]);

  const handleConversion = async (licenseIds: string[]) => {
    try {
      const response = await fetch("/api/licenses/convert-to-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseIds }),
      });

      if (!response.ok) throw new Error("Failed to convert licenses");

      router.refresh();
    } catch (error) {
      console.error("Error converting licenses:", error);
      throw error;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "The license key has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const toggleLicenseVisibility = (licenseId: string) => {
    setVisibleLicenses(prev => ({
      ...prev,
      [licenseId]: !prev[licenseId]
    }));
  };

  const activeSubLicenses = subLicenses.filter(license => license.status === 'ACTIVE');
  const inactiveSubLicenses = subLicenses.filter(license => license.status !== 'ACTIVE');

  if (activeLicenses.length === 0 && activeSubLicenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>License Keys</CardTitle>
          <CardDescription>
            You don't have any license keys yet. Purchase a plan to get started.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>License Keys</CardTitle>
        <CardDescription>
          Your active license keys provide access to premium features.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeLicenses.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Active License Keys</h3>
            <div className="space-y-2">
              {activeLicenses.map((license) => (
                <div key={license.licenseKey.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-2">
                    <Key className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">License Key</span>
                    <Badge variant="outline" className="ml-2">
                      {license.licenseKey.tier === 1 ? "Standard" : license.licenseKey.tier === 2 ? "Team" : "Pro"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="text-sm font-mono">
                      {visibleLicenses[license.licenseKey.id] 
                        ? license.licenseKey.key 
                        : `${license.licenseKey.key.slice(0, 8)}...`}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleLicenseVisibility(license.licenseKey.id)}
                    >
                      {visibleLicenses[license.licenseKey.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(license.licenseKey.key)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubLicenses.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Active Team License Keys</h3>
            <div className="space-y-2">
              {activeSubLicenses.map((license) => (
                <div key={license.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-2">
                    <Key className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Team License</span>
                    {license.organization && (
                      <div className="flex items-center space-x-1 ml-1">
                        <Building2 className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-gray-600">{license.organization.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="text-sm font-mono">
                      {visibleLicenses[license.id] 
                        ? license.key 
                        : `${license.key.slice(0, 8)}...`}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleLicenseVisibility(license.id)}
                    >
                      {visibleLicenses[license.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(license.key)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {convertibleLicensesInfo.hasConvertible && (
          <Button
            variant="outline"
            onClick={() => setShowConversion(true)}
            className="flex items-center space-x-2"
          >
            <Users className="h-4 w-4" />
            <span>
              Convert to Team Plan (
              {convertibleLicensesInfo.convertibleLicenses.length})
            </span>
          </Button>
        )}
      </CardContent>

      {showConversion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <LicenseConversion
              licenses={convertibleLicensesInfo.convertibleLicenses.map(
                (l) => ({
                  ...l.licenseKey,
                  vendor: l.licenseKey.vendor,
                  lemonProductId: l.licenseKey.lemonProductId,
                }),
              )}
              onClose={() => setShowConversion(false)}
              onConvert={handleConversion}
            />
          </div>
        </div>
      )}
    </Card>
  );
}

// Utility functions
function isTeamLicense(tier: number | null): boolean {
  if (!tier) return false;

  // Check if the tier matches any team plan (T2, T3, T4)
  const teamTiers = [2, 3, 4]; // Corresponding to T2, T3, T4
  return teamTiers.includes(tier);
}

function isEligibleForConversion(license: License): boolean {
  // For AppSumo, only tier 1 is eligible
  if (license.licenseKey.vendor?.toLowerCase() === "appsumo") {
    return license.licenseKey.tier === 1;
  }

  // For Lemon, check against individual plan IDs from config
  if (license.licenseKey.vendor?.toLowerCase() === "lemonsqueezy") {
    const individualPlans = PLANS.filter(
      (p) => p.tier === PlanTier.T1 && p.vendor === "LEMON",
    );

    return individualPlans.some(
      (p) => license.licenseKey.lemonProductId === Number(p.productId),
    );
  }

  return false;
}

function groupByVendor(licenses: License[]): Record<string, License[]> {
  return licenses.reduce(
    (acc, license) => {
      const vendor = license.licenseKey.vendor;
      if (!acc[vendor]) {
        acc[vendor] = [];
      }
      acc[vendor].push(license);
      return acc;
    },
    {} as Record<string, License[]>,
  );
}

