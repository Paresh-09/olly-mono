"use client";

import { useState, useEffect } from 'react';
import { Input } from '@repo/ui/components/ui/input';
import { Button } from '@repo/ui/components/ui/button';
import { Loader2, Search, Instagram } from 'lucide-react';
import { toast } from '@repo/ui/hooks/use-toast';
import { AuditHistory } from './audit-tools/audit-history';
import { ClaimReports, AuditHistoryLoginPrompt } from './audit-tools/claim-report';
import AuthPopup from '../authentication';
import { PlatformAuditLayout } from './audit-tools/platform-audit-layout';
import { useRouter } from 'next/navigation';

export const InstagramAuditComponent = () => {
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
      const response = await fetch('/api/tools/audit/history/instagram');
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
      router.push(`/tools/instagram-audit/report/${data.data.reportId}`);
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
      toast({ title: "Error", description: "Please enter an Instagram profile URL", variant: "destructive" });
      return;
    }

    if (!profileUrl.includes('instagram.com')) {
      toast({ title: "Error", description: "Please enter a valid Instagram URL", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/tools/audit/instagram', {
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
          router.push(`/tools/instagram-audit/report/${id}`);
          
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
      title="Instagram Profile Audit"
      description="Analyze profile performance and get optimization recommendations"
      icon={<Instagram className="h-6 w-6 text-white" />}
      color="bg-gradient-to-r from-purple-500 to-pink-500"
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
              placeholder="Enter Instagram profile URL (e.g. https://instagram.com/username)"
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
              <h3 className="text-lg font-medium mb-2">Analyzing profile...</h3>
              <p className="text-sm text-muted-foreground">
                Your Instagram profile audit is being processed. You'll be redirected to the report when it's ready.
                This may take a few minutes depending on the profile size.
              </p>
            </div>
          )}
        </div>

        {isAuthenticated ? (
          <AuditHistory 
            audits={auditHistory} 
            onRefresh={fetchAuditHistory} 
            isLoading={isHistoryLoading}
            platform="instagram"
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