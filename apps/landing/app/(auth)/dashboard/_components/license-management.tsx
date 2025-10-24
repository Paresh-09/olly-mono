"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { SubLicenseManagement } from "./sub-license-management";
import { LicenseGoals } from "./license-goals";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { Badge } from "@repo/ui/components/ui/badge";
import { Key, Users, Target, ArrowLeft, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

interface License {
  id: string;
  key: string;
  isActive: boolean;
  tier?: number;
  isSublicense?: boolean;
  mainLicenseKeyId?: string;
}

interface LicenseManagementProps {
  userId: string;
  initialLicenses: License[];
}

export default function LicenseManagement({
  userId,
  initialLicenses,
}: LicenseManagementProps) {
  const router = useRouter();

  const sortedLicenses = useMemo(() => {
    return initialLicenses
      .filter((license) => license.isActive)
      .sort((a, b) => {
        const aIsTeamPlan = a.tier === 2 || a.tier === 3;
        const bIsTeamPlan = b.tier === 2 || b.tier === 3;
        if (aIsTeamPlan && !bIsTeamPlan) return -1;
        if (!aIsTeamPlan && bIsTeamPlan) return 1;
        return 0;
      });
  }, [initialLicenses]);

  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [activeTab, setActiveTab] = useState("goals");

  const isTeamPlan = (license: License) =>
    license.tier === 2 ||
    license.tier === 3 ||
    license.tier === 4 ||
    license.tier === 5 ||
    license.tier === 7;

  // Check if the selected license is a main license (not a sublicense) and has team features
  const canManageTeamMembers = selectedLicense && !selectedLicense.isSublicense && isTeamPlan(selectedLicense);

  useEffect(() => {
    if (sortedLicenses.length > 0) {
      setSelectedLicense(sortedLicenses[0]);
    } else {
      setSelectedLicense(null);
    }
  }, [sortedLicenses]);

  // Reset activeTab to "goals" if user can't manage team members
  useEffect(() => {
    if (selectedLicense && (!canManageTeamMembers || selectedLicense.isSublicense)) {
      setActiveTab("goals");
    }
  }, [selectedLicense, canManageTeamMembers]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => router.back()}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#0C9488] rounded-xl flex items-center justify-center shadow-lg shadow-[#0C9488]/25">
                <Settings className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                  License Management
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Manage your licenses, team members, and goals
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <Link href="/plans" passHref>
                <button className="px-4 sm:px-6 py-2 bg-gradient-to-r from-[#0C9488] to-[#0a7d73] hover:from-[#0a7d73] hover:to-[#086963] text-white rounded-xl transition-all duration-200 shadow-lg shadow-[#0C9488]/25 text-sm font-medium">
                  Upgrade Plan
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {sortedLicenses.length > 0 ? (
          <div className="space-y-6">
            {/* License Selection Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-xl shadow-gray-200/50">
              <div className="flex items-center space-x-3 mb-4">
                <Key className="w-5 h-5 text-[#0C9488]" />
                <h2 className="text-lg font-semibold text-gray-900">Select License</h2>
              </div>
              <Select
                value={selectedLicense?.id}
                onValueChange={(value) =>
                  setSelectedLicense(
                    sortedLicenses.find((l) => l.id === value) || null,
                  )
                }
              >
                <SelectTrigger className="w-full h-12 bg-white border-gray-200 rounded-xl">
                  <SelectValue placeholder="Choose a license to manage" />
                </SelectTrigger>
                <SelectContent>
                  {sortedLicenses.map((license) => (
                    <SelectItem key={license.id} value={license.id}>
                      <div className="flex items-center justify-between w-full">
                        <span className="font-mono text-sm text-gray-700">
                          {license.key.slice(0, 8)}...{license.key.slice(-8)}
                        </span>
                        {isTeamPlan(license) && (
                          <Badge variant="outline" className="ml-3 text-xs bg-teal-50 border-teal-200 text-[#0C9488]">
                            Team Plan
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedLicense && (
              <div className="space-y-6">
                {/* License Info Banner */}
                <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#0C9488] rounded-xl flex items-center justify-center">
                        <Key className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">Active License</span>
                        <p className="text-xs text-gray-600 font-mono">
                          {selectedLicense.key.slice(0, 12)}...{selectedLicense.key.slice(-12)}
                        </p>
                      </div>
                    </div>
                    {isTeamPlan(selectedLicense) && (
                      <Badge className="bg-[#0C9488] hover:bg-[#0a7d73] text-white">
                        Team Plan Active
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Main Content Tabs */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/40 shadow-xl shadow-gray-200/50">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="border-b border-gray-200 px-6 pt-6">
                      <TabsList className={`grid w-full ${canManageTeamMembers ? 'grid-cols-2' : 'grid-cols-1'} bg-gray-100 p-1 h-12 rounded-xl`}>
                        <TabsTrigger
                          value="goals"
                          className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-[#0C9488] data-[state=active]:shadow-sm rounded-lg transition-all"
                        >
                          <Target className="w-4 h-4" />
                          <span>Goals</span>
                        </TabsTrigger>
                        {canManageTeamMembers && (
                          <TabsTrigger
                            value="sublicenses"
                            className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-[#0C9488] data-[state=active]:shadow-sm rounded-lg transition-all"
                          >
                            <Users className="w-4 h-4" />
                            <span>Team Members</span>
                          </TabsTrigger>
                        )}
                      </TabsList>
                    </div>

                    <TabsContent value="goals" className="p-6 pt-6">
                      <LicenseGoals
                        userId={userId}
                        licenseId={selectedLicense.id}
                        licenseKey={selectedLicense.key}
                      />
                    </TabsContent>

                    {canManageTeamMembers && (
                      <TabsContent value="sublicenses" className="p-6 pt-6">
                        <SubLicenseManagement
                          userId={userId}
                          licenseId={selectedLicense.id}
                          licenseKey={selectedLicense.key}
                        />
                      </TabsContent>
                    )}
                  </Tabs>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Key className="h-8 w-8 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">No Active Licenses</h2>
              <p className="text-gray-600 mb-8">
                You don't have any active licenses. Purchase a license to access premium features and start managing your team.
              </p>
              <div className="space-y-4">
                <Link href="/plans" passHref>
                  <button className="w-full px-6 py-3 bg-gradient-to-r from-[#0C9488] to-[#0a7d73] hover:from-[#0a7d73] hover:to-[#086963] text-white rounded-xl transition-all duration-200 shadow-lg shadow-[#0C9488]/25 font-medium">
                    View Plans & Pricing
                  </button>
                </Link>
                <Link href="/dashboard" passHref>
                  <button className="w-full px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl transition-all duration-200 font-medium">
                    Back to Dashboard
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}