import React from 'react';
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import AnalyticsDashboard from '../_components/team-usage';
import { fetchInitialData } from '@/utils/analytics/data';
import { Lock, BarChart3, ArrowLeft, TrendingUp } from 'lucide-react';
import { Button } from '@repo/ui/components/ui/button';
import Link from 'next/link';

export default async function AnalyticsTeam() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect("/login");
  }

  if (!user.onboardingComplete) {
    return redirect("/onboarding");
  }

  // Fetch main licenses owned by the user
  const userLicenseKeys = await prismadb.userLicenseKey.findMany({
    where: {
      userId: user.id,
      licenseKey: {
        isActive: true
      }
    },
    include: {
      licenseKey: {
        select: {
          id: true,
          key: true,
          tier: true,
          vendor: true,
          lemonProductId: true,
          subLicenses: {
            where: {
              status: 'ACTIVE'
            },
            select: {
              id: true,
              key: true,
              status: true,
              activationCount: true,
              assignedEmail: true,
              mainLicenseKey: {
                select: {
                  id: true,
                  tier: true,
                  vendor: true,
                  lemonProductId: true
                }
              }
            }
          }
        }
      }
    }
  });

  // Fetch sublicenses assigned to the user
  const userSubLicenses = await prismadb.subLicense.findMany({
    where: {
      OR: [
        { assignedUserId: user.id },
        { assignedEmail: user.email }
      ],
      status: 'ACTIVE',
      mainLicenseKey: {
        isActive: true
      }
    },
    include: {
      mainLicenseKey: {
        select: {
          id: true,
          key: true,
          tier: true,
          vendor: true,
          lemonProductId: true,
          subLicenses: {
            where: {
              status: 'ACTIVE'
            },
            select: {
              id: true,
              key: true,
              status: true,
              activationCount: true,
              assignedEmail: true,
              mainLicenseKey: {
                select: {
                  id: true,
                  tier: true,
                  vendor: true,
                  lemonProductId: true
                }
              }
            }
          }
        }
      }
    }
  });

  // Check if user has any licenses at all
  if (userLicenseKeys.length === 0 && userSubLicenses.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link
                href="/dashboard"
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </Link>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#0C9488] rounded-xl flex items-center justify-center shadow-lg shadow-[#0C9488]/25">
                <BarChart3 className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Team Analytics
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Advanced analytics and insights
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* No Licenses State */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">No Active Licenses</h2>
              <p className="text-gray-600 mb-8">
                You need an active license to view team analytics and insights. Upgrade to access advanced features.
              </p>
              <div className="space-y-4">
                <Link href="/plans">
                  <button className="w-full px-6 py-3 bg-gradient-to-r from-[#0C9488] to-[#0a7d73] hover:from-[#0a7d73] hover:to-[#086963] text-white rounded-xl transition-all duration-200 shadow-lg shadow-[#0C9488]/25 font-medium">
                    View Plans & Pricing
                  </button>
                </Link>
                <Link href="/dashboard">
                  <button className="w-full px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl transition-all duration-200 font-medium">
                    Back to Dashboard
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Determine what keys to send based on what user has
  let licenseKeys = [];
  let hasTeamPlan = false;
  let selectedLicenseKey = '';

  if (userLicenseKeys.length > 0) {
    // User has main licenses - send main license keys
    const sortedMainLicenses = userLicenseKeys
      .map(ulk => ulk.licenseKey)
      .sort((a, b) => {
        const aIsTeamPlan = a.tier === 2 || a.tier === 3 || a.tier === 4 || a.tier === 5;
        const bIsTeamPlan = b.tier === 2 || b.tier === 3 || b.tier === 4 || b.tier === 5;
        if (aIsTeamPlan && !bIsTeamPlan) return -1;
        if (!aIsTeamPlan && bIsTeamPlan) return 1;
        return 0;
      });

    licenseKeys = sortedMainLicenses.map(license => license.key);
    selectedLicenseKey = licenseKeys[0];
    hasTeamPlan = sortedMainLicenses.some(license =>
      license.tier === 2 || license.tier === 3 || license.tier === 4 || license.tier === 5
    );
  } else {
    // User only has sublicenses - send sublicense keys
    const sortedSubLicenses = userSubLicenses.sort((a, b) => {
      const aIsTeamPlan = a.mainLicenseKey.tier === 2 || a.mainLicenseKey.tier === 3 || a.mainLicenseKey.tier === 4 || a.mainLicenseKey.tier === 5;
      const bIsTeamPlan = b.mainLicenseKey.tier === 2 || b.mainLicenseKey.tier === 3 || b.mainLicenseKey.tier === 4 || b.mainLicenseKey.tier === 5;
      if (aIsTeamPlan && !bIsTeamPlan) return -1;
      if (!aIsTeamPlan && bIsTeamPlan) return 1;
      return 0;
    });

    licenseKeys = sortedSubLicenses.map(subLicense => subLicense.key);
    selectedLicenseKey = licenseKeys[0];
    hasTeamPlan = sortedSubLicenses.some(subLicense =>
      subLicense.mainLicenseKey.tier === 2 || subLicense.mainLicenseKey.tier === 3 || subLicense.mainLicenseKey.tier === 4 || subLicense.mainLicenseKey.tier === 5
    );
  }

  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 6);
  startDate.setHours(0, 0, 0, 0);

  const initialData = await fetchInitialData(selectedLicenseKey, startDate, endDate);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link
                href="/dashboard"
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </Link>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#0C9488] rounded-xl flex items-center justify-center shadow-lg shadow-[#0C9488]/25">
                <TrendingUp className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Team Analytics
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm">
                  {hasTeamPlan ? 'Advanced team insights and performance metrics' : 'Individual analytics and insights'}
                </p>
              </div>
            </div>
            {!hasTeamPlan && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                <Link href="/plans">
                  <button className="px-4 sm:px-6 py-2 bg-gradient-to-r from-[#0C9488] to-[#0a7d73] hover:from-[#0a7d73] hover:to-[#086963] text-white rounded-xl transition-all duration-200 shadow-lg shadow-[#0C9488]/25 text-sm font-medium w-full sm:w-auto">
                    Upgrade to Team
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Team Plan Warning */}
        {!hasTeamPlan && (
          <div className="mb-6">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lock className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-amber-800 mb-1">
                    Team Analytics Locked
                  </h3>
                  <p className="text-sm text-amber-700 mb-3">
                    Upgrade to a team plan to access advanced analytics, team member insights, and collaborative features.
                  </p>
                  <Link href="/plans">
                    <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors">
                      View Team Plans
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Dashboard */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/40 shadow-xl shadow-gray-200/50">
          <AnalyticsDashboard
            initialData={initialData}
            initialStartDate={startDate}
            initialEndDate={endDate}
            licenseKeys={licenseKeys}
            hasTeamPlan={hasTeamPlan}
          />
        </div>
      </div>
    </div>
  );
}