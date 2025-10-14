'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LicenseKeyCustomKnowledgeForm from '../_components/custom-knowledge';
import Loading from '@/app/(auth)/loading';
import { AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/ui/alert';
import { Skeleton } from '@repo/ui/components/ui/skeleton';

interface LicenseKeyCustomKnowledge {
  brandName?: string;
  brandPersonality?: string;
  industry?: string;
  targetAudience?: string;
  productServices?: string;
  uniqueSellingPoints?: string;
  brandVoice?: string;
  contentTopics?: string;
  brandValues?: string;
  missionStatement?: string;
  // Add other fields as needed
  personalBackground?: string;
  values?: string;
  lifestyle?: string;
  professionalBackground?: string;
  expertise?: string;
  industryInsights?: string;
  uniqueApproach?: string;
  contentStrategy?: string;
}

const LicenseKeyCustomKnowledgePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const licenseKey = params.licenseKey as string;
  const [initialData, setInitialData] = useState<LicenseKeyCustomKnowledge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isFormReady, setIsFormReady] = useState(false);

  const renderPageSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <Skeleton className="h-10 w-64 mx-auto" />
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="p-8 lg:p-12">
              <div className="space-y-8">
                {/* Tab skeleton */}
                <div className="w-full bg-gray-50 rounded-2xl p-1 h-12 flex gap-1">
                  <Skeleton className="flex-1 h-10 rounded-xl" />
                  <Skeleton className="flex-1 h-10 rounded-xl" />
                </div>

                {/* Brand type toggle skeleton */}
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-2xl border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-xl" />
                      <Skeleton className="h-6 w-64" />
                    </div>
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="w-11 h-6 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </div>

                {/* Form fields skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-12 rounded-xl" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-24 rounded-xl" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-24 rounded-xl" />
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-24 rounded-xl" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-20 rounded-xl" />
                </div>

                {/* Document upload skeleton */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex gap-2">
                      <Skeleton className="flex-1 h-10 rounded-md" />
                      <Skeleton className="flex-1 h-10 rounded-md" />
                    </div>
                    <Skeleton className="h-10 rounded-md" />
                  </div>
                </div>

                {/* Action buttons skeleton */}
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <Skeleton className="flex-1 h-12 rounded-xl" />
                    <Skeleton className="h-12 w-64 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    const checkOwnership = async () => {
      try {

        // First check if user is authenticated and owns this license key
        const mainLicenseResponse = await fetch(`/api/user/licenses`);

        if (!mainLicenseResponse.ok) {
          if (mainLicenseResponse.status === 401) {
            // User is not authenticated
            console.log("User not authenticated, redirecting to login");
            router.push('/login');
            return;
          }
          throw new Error('Failed to verify license key ownership');
        }

        const { licenses: mainLicenses } = await mainLicenseResponse.json();
        let isOwner = mainLicenses.some((license: any) => license.key === licenseKey);
        console.log("License found in main licenses:");

        // If not found in main licenses, check sub-licenses
        if (!isOwner) {
          try {
            const subLicenseResponse = await fetch('/api/user/sub-licenses');
            if (subLicenseResponse.ok) {
              const { licenses: subLicenses } = await subLicenseResponse.json();




              // Check if the license key matches and is active
              isOwner = subLicenses.some((license: any) => {
                const matches = license.key === licenseKey;
                const isActive = license.status === "ACTIVE" || license.isActive === true;
                return matches && isActive;
              });

            } else {
              console.error('Sub-license response not ok:', subLicenseResponse.status);
            }
          } catch (err) {
            console.error('Error checking sub-licenses:', err);
            // Don't return here, continue with the authorization check
          }
        }

        if (!isOwner) {
          // Redirect to license selection page if user doesn't own this license
          console.log("User does not own this license, redirecting");
          router.push('/dashboard/brand/train');
          return;
        }

        setIsAuthorized(true);
        console.log("User is authorized for this license");

        // Now fetch the custom knowledge data if user is authorized
        console.log("Fetching custom knowledge data");
        const dataResponse = await fetch(`/api/license-key/${licenseKey}/custom-knowledge`);

        if (dataResponse.ok) {
          const data = await dataResponse.json();
          console.log("Custom knowledge data received:");
          setInitialData(data);
        } else if (dataResponse.status !== 404) {
          throw new Error('Failed to fetch data');
        } else {
          console.log("No existing custom knowledge data found (404)");
          setInitialData({});
        }

        setDataFetched(true);
      } catch (err) {
        console.error('Error fetching custom knowledge:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    checkOwnership();
  }, [licenseKey, router]);

  const handleSubmit = async (data: LicenseKeyCustomKnowledge) => {
    try {
      const method = initialData && Object.keys(initialData).length > 0 ? 'PUT' : 'POST';

      const response = await fetch(`/api/license-key/${licenseKey}/custom-knowledge`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save data');
      }

      const savedData = await response.json();
      console.log("Data saved successfully");
      setInitialData(savedData);
    } catch (err) {
      console.error('Error saving custom knowledge:', err);
      throw err;
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 py-20">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-red-200">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    // This should rarely be shown as we redirect unauthorized users
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 py-20">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-red-200">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Unauthorized</AlertTitle>
              <AlertDescription>You do not have permission to access this license. Redirecting...</AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  if (!dataFetched) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 py-20">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-blue-200">
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertTitle>Loading</AlertTitle>
              <AlertDescription>Fetching your brand voice configuration...</AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              {initialData && Object.keys(initialData).length > 0 ? 'Update' : 'Create'} Brand Profile
            </h1>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="p-8 lg:p-12">
              <LicenseKeyCustomKnowledgeForm
                licenseKey={licenseKey}
                onSubmit={handleSubmit}
                initialData={initialData || {}}
                onFormReady={() => setIsFormReady(true)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LicenseKeyCustomKnowledgePage;