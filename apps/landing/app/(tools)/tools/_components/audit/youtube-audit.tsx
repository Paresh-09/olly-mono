"use client";

import { useState, useEffect } from 'react';
import { Card } from '@repo/ui/components/ui/card';
import { Input } from '@repo/ui/components/ui/input';
import { Button } from '@repo/ui/components/ui/button';
import { Loader2, Search, Youtube } from 'lucide-react';
import { toast } from '@repo/ui/hooks/use-toast';
import { AuditResults } from '../audit/audit-tools/audit-result';
import { AuditHistory } from '../audit/audit-tools/audit-history';
import { ClaimReports, AuditHistoryLoginPrompt } from '../audit/audit-tools/claim-report';
import AuthPopup from '../authentication';
import { PlatformAuditLayout } from '../audit/audit-tools/platform-audit-layout';

export const YoutubeAuditComponent = () => {
  const [profileUrl, setProfileUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<any | null>(null);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [auditHistory, setAuditHistory] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isClaimingReport, setIsClaimingReport] = useState(false);

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
      const response = await fetch('/api/tools/audit/history/youtube');
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
      setAuditResult(data.data);
      setAuditId(null);
      setIsLoading(false);
    } else if (data.status === 'PROCESSING') {
      setAuditId(data.data.jobId);
      toast({
        title: "Processing Audit",
        description: "Your audit is being processed. Please wait...",
      });
      pollAuditStatus(data.data.jobId);
    }
  };

  const initiateAudit = async () => {
    if (!profileUrl) {
      toast({ title: "Error", description: "Please enter a YouTube channel URL", variant: "destructive" });
      return;
    }

    if (!profileUrl.includes('youtube.com') && !profileUrl.includes('youtu.be')) {
      toast({ title: "Error", description: "Please enter a valid YouTube URL", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setAuditResult(null);

    try {
      const response = await fetch('/api/tools/audit/youtube', {
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
          setAuditResult(data.data);
          setIsLoading(false);
          setAuditId(null);

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
  const handleClaimReport = () => {
    if (!isAuthenticated || !auditResult?.isAnonymous) return;

    const claimReport = async () => {
      try {
        setIsClaimingReport(true);

        const response = await fetch('/api/tools/audit/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reportIds: [auditResult.reportId] }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to claim report');
        }

        // Show message with appropriate feedback
        if (data.claimedCount > 0) {
          toast({
            title: "Report Claimed",
            description: data.message || "This report has been successfully added to your account.",
          });
        } else if (data.skippedCount > 0) {
          toast({
            title: "Report Already in Account",
            description: "You already have this report in your account.",
          });
        }

        // Refresh the audit result to update ownership
        const refreshResponse = await fetch(`/api/tools/audit/youtube/${auditResult.reportId}`);
        const refreshData = await refreshResponse.json();

        if (refreshData.success) {
          setAuditResult(refreshData.data);
        }

        fetchAuditHistory();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to claim report",
          variant: "destructive",
        });
      } finally {
        setIsClaimingReport(false);
      }
    };

    claimReport();
  };

  const handleClaimSuccess = () => {
    fetchAuditHistory();
    toast({
      title: "Reports Claimed",
      description: "Your anonymous reports have been added to your account.",
    });
  };

  return (
    <PlatformAuditLayout
      title="YouTube Channel Audit"
      description="Analyze channel performance and get optimization recommendations"
      icon={<Youtube className="h-6 w-6 text-white" />}
      color="bg-red-500"
    >
      <div className="space-y-6">
        {/* Show claim reports option if user is logged in */}
        {isAuthenticated && (
          <ClaimReports
            isAuthenticated={isAuthenticated}
            onLogin={handleLogin}
            onSuccess={handleClaimSuccess}
          />
        )}

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter YouTube channel URL (e.g. https://youtube.com/@channelname)"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              onKeyDown={handleKeyDown}
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
              {isLoading ? 'Analyzing...' : 'Analyze'}
            </Button>
          </div>

          {isLoading && auditId && (
            <div className="text-center p-6 border rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Analyzing channel...</h3>
              <p className="text-sm text-muted-foreground">
                Your YouTube channel audit is being processed. This may take a few minutes depending on the channel size.
              </p>
            </div>
          )}
        </div>

        {auditResult && (
          <AuditResults
            result={auditResult}
            platform="youtube"
            isAuthenticated={isAuthenticated}
            onLogin={handleLogin}
            onClaimReport={handleClaimReport}
          />
        )}

        {isAuthenticated ? (
          <AuditHistory
            audits={auditHistory}
            onRefresh={fetchAuditHistory}
            isLoading={isHistoryLoading}
            platform="youtube"
            isAudit={true}
          />
        ) : (
          <AuditHistoryLoginPrompt onLogin={handleLogin} />
        )}
      </div>

      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        onSuccess={handleAuthSuccess}
      />
    </PlatformAuditLayout>
  );
};