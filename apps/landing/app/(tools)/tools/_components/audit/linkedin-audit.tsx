"use client";

import { useState, useEffect } from 'react';
import { Card } from '@repo/ui/components/ui/card';
import { Input } from '@repo/ui/components/ui/input';
import { Button } from '@repo/ui/components/ui/button';
import { Loader2, Search, Linkedin } from 'lucide-react';
import { toast } from '@repo/ui/hooks/use-toast';
import { AuditHistory } from '../../_components/audit/audit-tools/audit-history';
import { ClaimReports, AuditHistoryLoginPrompt } from '../../_components/audit/audit-tools/claim-report';
import AuthPopup from '../authentication';
import { PlatformAuditLayout } from '../../_components/audit/audit-tools/platform-audit-layout';
import { useRouter } from 'next/navigation';

export const LinkedInAuditComponent = () => {
  const [profileUrl, setProfileUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [auditHistory, setAuditHistory] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const router = useRouter();

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
      const response = await fetch('/api/tools/audit/history/linkedin');
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

  const processAuditResponse = (data: any) => {
    if (data.status === 'COMPLETED') {
      // Redirect to the report page immediately if processing is already complete
      router.push(`/tools/linkedin-audit/report/${data.data.reportId}`);
    } else if (data.status === 'PROCESSING') {
      setAuditId(data.data.jobId);
      toast({
        title: "Processing Audit",
        description: "Your audit is being processed. You'll be redirected when it's ready.",
      });
      pollAuditStatus(data.data.jobId);
    }
  };

  const initiateAudit = async () => {
    if (!profileUrl) {
      toast({ title: "Error", description: "Please enter a LinkedIn profile URL", variant: "destructive" });
      return;
    }

    if (!profileUrl.includes('linkedin.com')) {
      toast({ title: "Error", description: "Please enter a valid LinkedIn URL", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/tools/audit/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileUrl }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate audit');
      }

      processAuditResponse(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setIsLoading(false);
    }
  };

  const pollAuditStatus = async (id: string) => {
    const maxAttempts = 24; // 6 minutes total (15s * 24)
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/tools/audit/status/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to check status');
        }

        if (data.status === 'COMPLETED') {
          setIsLoading(false);
          setAuditId(null);
          
          // Redirect to the report page when complete
          router.push(`/tools/linkedin-audit/report/${id}`);
          
          if (isAuthenticated) {
            fetchAuditHistory();
          }
          return true;
        }

        if (data.status === 'ERROR') {
          throw new Error(data.message || 'Audit failed');
        }

        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error('Audit timed out');
        }

        return false;
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        setIsLoading(false);
        setAuditId(null);
        return true;
      }
    };

    while (!(await poll()) && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 15000)); // Poll every 15 seconds
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      initiateAudit();
    }
  };
  
  const handleLogin = () => {
    setShowAuthPopup(true);
  };
  
  const handleAuthSuccess = () => {
    setShowAuthPopup(false);
    setIsAuthenticated(true);
    fetchAuditHistory();
  };
  
  // Claim anonymous reports when logged in
  const handleClaimSuccess = () => {
    fetchAuditHistory();
    toast({
      title: "Reports Claimed",
      description: "Your anonymous reports have been added to your account.",
    });
  };

  return (
    <PlatformAuditLayout
      title="LinkedIn Profile Audit"
      description="Analyze professional profile performance and get optimization recommendations"
      icon={<Linkedin className="h-6 w-6 text-white" />}
      color="bg-blue-700"
    >
      <div className="space-y-8">
        {/* Show claim reports option if user is logged in */}
        {isAuthenticated && (
          <ClaimReports 
            isAuthenticated={isAuthenticated}
            onLogin={handleLogin}
            onSuccess={handleClaimSuccess}
          />
        )}
        
        <Card className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="profile-url" className="text-sm font-medium">
                LinkedIn Profile URL
              </label>
              <div className="flex gap-2">
                <Input
                  id="profile-url"
                  placeholder="https://linkedin.com/in/username"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={initiateAudit}
                  disabled={isLoading || !profileUrl}
                  className="min-w-[120px]"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? 'Analyzing...' : 'Analyze'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter your LinkedIn profile URL to get started with the audit
              </p>
            </div>

            {isLoading && auditId && (
              <div className="text-center p-8 border rounded-lg bg-muted/50">
                <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-blue-600" />
                <h3 className="text-xl font-semibold mb-3">Analyzing Profile</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Your LinkedIn profile audit is being processed. You'll be redirected to the report when it's ready.
                  This may take a few minutes depending on the profile size.
                </p>
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Audit History</h2>
          {isAuthenticated ? (
            <AuditHistory 
              audits={auditHistory} 
              onRefresh={fetchAuditHistory} 
              isLoading={isHistoryLoading}
              platform="linkedin"
              isAudit={true}
            />
          ) : (
            <Card className="p-6">
              <AuditHistoryLoginPrompt onLogin={handleLogin} />
            </Card>
          )}
        </div>
      </div>

      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        onSuccess={handleAuthSuccess}
      />
    </PlatformAuditLayout>
  );
};