"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@repo/ui/components/ui/card';
import { Button } from '@repo/ui/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from '@repo/ui/hooks/use-toast';
import { AuditResults } from '../../../_components/audit/audit-tools/audit-result';
import { platformConfigs } from '@/utils/platform-icons';
import AuthPopup from '../../../_components/authentication';

interface ReportDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ReportDetailPage(props: ReportDetailPageProps) {
  const params = use(props.params);
  const { id } = params;
  const platform = "instagram"; // Hard-coded since we're in youtube-audit folder
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [auditData, setAuditData] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    fetchReportData();
  }, [id, isAuthenticated]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/user/auth');
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
    } catch (error) {
      console.error('Failed to check auth status:', error);
    }
  };

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tools/audit/${platform}/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast({ 
            title: "Report not found", 
            description: "The audit report you're looking for doesn't exist or isn't accessible", 
            variant: "destructive" 
          });
          router.push(`/tools/${platform}-audit`);
          return;
        }
        throw new Error("Failed to fetch report data");
      }
      
      const data = await response.json();
      if (data.success) {
        setAuditData(data.data);
      } else {
        throw new Error(data.error || "Failed to load report data");
      }
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Something went wrong", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    setShowAuthPopup(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthPopup(false);
    setIsAuthenticated(true);
    // After login, re-fetch the data to get the full report
    fetchReportData();
  };

  const handleClaimReport = async () => {
    if (!isAuthenticated || !auditData?.isAnonymous) return;
    
    try {
      const response = await fetch('/api/tools/audit/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportIds: [id] }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim report');
      }
      
      toast({
        title: "Report Claimed",
        description: "This report has been successfully added to your account.",
      });
      
      // Re-fetch data to get updated ownership status
      fetchReportData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to claim report",
        variant: "destructive",
      });
    }
  };

  // Get platform configuration for styling
  const getPlatformConfig = () => {
    const platformKey = platform.toLowerCase();
    return platformConfigs[platformKey] || {
      name: platform.charAt(0).toUpperCase() + platform.slice(1),
      color: "text-gray-500"
    };
  };

  const platformConfig = getPlatformConfig();
  const { name: platformName, color: platformColor } = platformConfig;

  const handleBack = () => {
    router.push(`/tools/${platform}-audit`);
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{platformName} Audit Report</h1>
      </div>
      
      {isLoading ? (
        <Card className="p-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading audit report...</p>
          </div>
        </Card>
      ) : auditData ? (
        <AuditResults 
          result={auditData} 
          platform={platform} 
          isAuthenticated={isAuthenticated}
          onLogin={handleLogin}
          onClaimReport={handleClaimReport}
        />
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Report not found or inaccessible</p>
          <Button className="mt-4" onClick={handleBack}>
            Back to {platformName} Audit
          </Button>
        </Card>
      )}
      
      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  )
}