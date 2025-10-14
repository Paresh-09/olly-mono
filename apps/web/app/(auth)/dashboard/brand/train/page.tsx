'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/components/ui/button';
import { Card } from '@repo/ui/components/ui/card';
import { CheckCircle, ArrowRight, LucideIcon, Key, AlertCircle, FileText, Lock } from 'lucide-react';
import { Skeleton } from '@repo/ui/components/ui/skeleton';
import { Alert, AlertDescription } from '@repo/ui/components/ui/alert';
import Link from 'next/link';

interface License {
  id: string;
  key: string;
  maskedKey: string;
  isActive: boolean;
  tier: string;
  vendor: string;
  hasCustomKnowledge: boolean;
  isSubLicense: boolean;
  assignedToName?: string;
}

const BrandTrainPage = () => {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchLicenses = async () => {
      try {
        // Fetch main licenses
        const response = await fetch('/api/user/licenses');
        if (!response.ok) {
          throw new Error('Failed to fetch licenses');
        }
        
        const data = await response.json();
        
        // Fetch custom knowledge status for each license
        const licensesWithKnowledgeStatus = await Promise.all(
          data.licenses.map(async (license: any) => {
            try {
              // First check if custom knowledge exists
              const knowledgeResponse = await fetch(`/api/license-key/${license.key}/custom-knowledge`);
              
              // Then check if any summaries exist
              const summaryResponse = await fetch(`/api/license-key/${license.key}/fetch-summaries`);
              let summariesData = [];
              if (summaryResponse.ok) {
                summariesData = await summaryResponse.json();
              }
              
              // Brand voice exists if there are summaries
              const hasCustomKnowledge = summariesData.length > 0;
              
              return {
                ...license,
                hasCustomKnowledge,
                isSubLicense: false
              };
            } catch (err) {
              console.error(`Error checking knowledge for license ${license.key}:`, err);
              return {
                ...license,
                hasCustomKnowledge: false,
                isSubLicense: false
              };
            }
          })
        );
        
        // Fetch sub-licenses if available
        let subLicenses: License[] = [];
        try {
          const subLicenseResponse = await fetch('/api/user/sub-licenses');
          if (subLicenseResponse.ok) {
            const subLicenseData = await subLicenseResponse.json();
            
            // Check custom knowledge status for sub-licenses
            subLicenses = await Promise.all(
              subLicenseData.licenses.map(async (license: any) => {
                try {
                  // First check if custom knowledge exists
                  const knowledgeResponse = await fetch(`/api/license-key/${license.key}/custom-knowledge`);
                  
                  // Then check if any summaries exist
                  const summaryResponse = await fetch(`/api/license-key/${license.key}/fetch-summaries`);
                  let summariesData = [];
                  if (summaryResponse.ok) {
                    summariesData = await summaryResponse.json();
                  }
                  
                  // Brand voice exists if there are summaries
                  const hasCustomKnowledge = summariesData.length > 0;
                  
                  return {
                    ...license,
                    hasCustomKnowledge,
                    isSubLicense: true
                  };
                } catch (err) {
                  console.error(`Error checking knowledge for sub-license ${license.key}:`, err);
                  return {
                    ...license,
                    hasCustomKnowledge: false,
                    isSubLicense: true
                  };
                }
              })
            );
          }
        } catch (err) {
          console.error('Error fetching sub-licenses:', err);
        }
        
        // Combine main licenses and sub-licenses
        setLicenses([...licensesWithKnowledgeStatus, ...subLicenses]);
      } catch (err) {
        console.error('Error fetching licenses:', err);
        setError('Failed to load licenses. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLicenses();
  }, []);

  const handleSelectLicense = (licenseKey: string) => {
    router.push(`/dashboard/brand/train/${licenseKey}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Select License</h1>
            <p className="text-gray-600">Choose a license to create or edit its brand voice</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <Skeleton className="h-9 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (licenses.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Select License</h1>
            <p className="text-gray-600">Choose a license to create or edit its brand voice</p>
          </div>
        </div>
        
        <Card className="p-6">
          <div className="text-center py-8">
            <Lock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Licenses Available</h3>
            <p className="text-gray-600 mb-4">You don't have any licenses available to configure brand voice.</p>
            <Link href="/plans">
              <Button>Purchase a License</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Select License</h1>
          <p className="text-gray-600">Choose a license to create or edit its brand voice</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {licenses.map((license) => (
          <Card 
            key={license.id} 
            className={`p-6 hover:shadow-md transition-shadow cursor-pointer ${license.hasCustomKnowledge ? 'border-green-200' : ''}`}
            onClick={() => handleSelectLicense(license.key)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`rounded-full p-2 ${license.hasCustomKnowledge ? 'bg-green-100' : 'bg-blue-100'}`}>
                {license.hasCustomKnowledge ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Key className="h-5 w-5 text-blue-600" />
                )}
              </div>
              {license.isSubLicense && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Sub-license
                </span>
              )}
            </div>
            
            <h3 className="font-semibold mb-1">{license.maskedKey}</h3>
            <p className="text-sm text-gray-600 mb-4">
              {license.vendor || 'Standard'} - {license.tier || 'License'}
              {license.assignedToName && ` • Assigned to ${license.assignedToName}`}
            </p>
            
            <div className="flex justify-between items-center">
              <span className={`text-sm font-medium ${license.hasCustomKnowledge ? 'text-green-600' : 'text-gray-500'}`}>
                {license.hasCustomKnowledge ? 'Brand voice ready' : 'Not configured yet'}
              </span>
              <Button size="sm" variant="ghost" className="flex items-center gap-1">
                {license.hasCustomKnowledge ? 'Edit' : 'Configure'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BrandTrainPage; 