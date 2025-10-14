"use client";

import { useState, useEffect } from 'react';
import { Input } from '@repo/ui/components/ui/input';
import { Button } from '@repo/ui/components/ui/button';
import { Loader2, Search, Users } from 'lucide-react';
import { toast } from '@repo/ui/hooks/use-toast';
import { AuditHistory } from '../../_components/audit/audit-tools/audit-history';
import { ClaimReports, AuditHistoryLoginPrompt } from '../../_components/audit/audit-tools/claim-report';
import AuthPopup from '../../_components/authentication';
import { PlatformAuditLayout } from '../../_components/audit/audit-tools/platform-audit-layout';
import { validateProfileUrl } from '@/lib/audit/profile-urls-validation';
import { BenefitsList } from '../mini-tools/benefits-list';
import { FakeFollowerResult } from './check-result';
import NotFound from '@/app/not-found';



type AllowedPlatform = "instagram" | "tiktok" | "linkedin";



export const FollowerCheckerComponent = ({ platform }: { platform: string }) => {
  const [profileUrl, setProfileUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<any | null>(null);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [auditHistory, setAuditHistory] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/user/auth');
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
      if (data.authenticated) {
        fetchAuditHistory();
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
    }
  };

  const fetchAuditHistory = async () => {
    if (!isAuthenticated) return;
    
    setIsHistoryLoading(true);
    try {
      const response = await fetch(`/api/tools/audit/history/${platform}`);
      const data = await response.json();
      if (data.success) {
        setAuditHistory(data.audits);
      }
    } catch (error) {
      console.error('Failed to fetch audit history:', error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const initiateAudit = async () => {
    // Validate URL
    if (!validateProfileUrl(platform, profileUrl)) {
      toast({ 
        title: "Error", 
        description: `Please enter a valid ${platform.charAt(0).toUpperCase() + platform.slice(1)} profile URL`, 
        variant: "destructive" 
      });
      return;
    }

    setIsLoading(true);
    setAuditResult(null);

    try {
      const response = await fetch(`/api/tools/follower-check/${platform}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileUrl }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate follower check');
      }

      // Process the result similar to other audit types
      setAuditResult({
        profile: {
          id: data.result.profileId,
          platform,
          profileUrl,
        },
        audit: {
          overallScore: data.result.fakeFollowerScore,
          summary: data.result.summary,
          strengths: data.result.strengths,
          weaknesses: data.result.weaknesses,
          recommendations: data.result.recommendations,
          keyMetrics: {
            totalFollowers: data.result.totalFollowers,
            realFollowers: data.result.realFollowers,
            fakeFollowers: data.result.fakeFollowers,
            followBackRatio: data.result.followBackRatio,
            fakeFollowerPercentage: data.result.fakeFollowerPercentage
          }
        }
      });

      setIsLoading(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setIsLoading(false);
    }
  };


  // Validate if the platform is allowed
  const isValidPlatform = (platform: string): platform is AllowedPlatform => {
    return ["instagram", "tiktok", "linkedin"].includes(platform);
  };

  if (!isValidPlatform(platform)) {
    return (
      <NotFound/>
    );
  }

  return (
    <PlatformAuditLayout
      title={`${platform.charAt(0).toUpperCase() + platform.slice(1)} Follower Checker`}
      description="Analyze the authenticity of your social media followers"
      icon={<Users className="h-6 w-6 text-white" />}
      color="bg-blue-500"
    >
      <div className="space-y-6">
        {/* Show claim reports option if user is logged in */}
        {isAuthenticated && (
          <ClaimReports 
            isAuthenticated={isAuthenticated}
            onLogin={() => setShowAuthPopup(true)}
            onSuccess={fetchAuditHistory}
          />
        )}
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder={`Enter ${platform.charAt(0).toUpperCase() + platform.slice(1)} profile URL`}
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && initiateAudit()}
              disabled={isLoading}
            />
            <Button
              onClick={initiateAudit}
              disabled={isLoading || !profileUrl}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              {isLoading ? 'Analyzing...' : 'Check Followers'}
            </Button>
          </div>

          {isLoading && (
            <div className="text-center p-6 border rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Analyzing followers...</h3>
              <p className="text-sm text-muted-foreground">
                Your follower audit is being processed. This may take a few minutes.
              </p>
            </div>
          )}
        </div>

        {auditResult && (
          <FakeFollowerResult 
            result={auditResult} 
            platform={platform} 
            isAuthenticated={isAuthenticated}
            onLogin={() => setShowAuthPopup(true)}
            onClaimReport={() => {
              // Implement claim report logic if needed
              if (isAuthenticated && auditResult.isAnonymous) {
                // Add claim report functionality
              }
            }}
          />
        )}

        {isAuthenticated ? (
          <AuditHistory 
            audits={auditHistory} 
            onRefresh={fetchAuditHistory} 
            isLoading={isHistoryLoading}
            platform={platform}
            isAudit= {false}
          />
        ) : (
          <AuditHistoryLoginPrompt onLogin={() => setShowAuthPopup(true)} />
        )}
      </div>

      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        onSuccess={() => {
          setShowAuthPopup(false);
          setIsAuthenticated(true);
          fetchAuditHistory();
        }}
      />
    </PlatformAuditLayout>
  );
};

// Page Component for each platform
export default function FollowerCheckerPage({ 
  platform 
}: { 
  platform: string 
}) {
  return (
    <div className="container py-8 space-y-8">
      <FollowerCheckerComponent platform={platform} />
      <div className="max-w-4xl mx-auto">
        <BenefitsList benefits={getPlatformBenefits(platform)} />
      </div>
    </div>
  );
}

// Utility function to get benefits based on platform
function getPlatformBenefits(platform: string) {
  const commonBenefits = [
    {
      title: 'Comprehensive Follower Analysis',
      description: 'Detailed breakdown of real vs. fake followers'
    },
    {
      title: 'Authenticity Scoring',
      description: 'Quantitative assessment of follower quality'
    },
    {
      title: 'Actionable Insights',
      description: 'Recommendations to improve follower base'
    },
    {
      title: 'Engagement Quality',
      description: 'Evaluate the genuine interaction potential of followers'
    }
  ];

  // Optional: Add platform-specific nuances
  const platformSpecificBenefits = {
    instagram: [
      ...commonBenefits,
      {
        title: 'Instagram-Specific Insights',
        description: 'Analyze follower authenticity unique to Instagrams ecosystem'
      }
    ],
    tiktok: [
      ...commonBenefits,
      {
        title: 'TikTok Content Relevance',
        description: 'Assess follower alignment with your content strategy'
      }
    ],
    linkedin: [
      ...commonBenefits,
      {
        title: 'Professional Network Analysis',
        description: 'Evaluate the quality of professional connections'
      }
    ]
  };

  return platformSpecificBenefits[platform as keyof typeof platformSpecificBenefits] || commonBenefits;
}