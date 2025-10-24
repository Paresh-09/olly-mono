"use client";

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { toast } from '@repo/ui/hooks/use-toast';
import { Card } from '@repo/ui/components/ui/card';
import { Badge } from '@repo/ui/components/ui/badge';
import { LogIn } from 'lucide-react';

interface ClaimReportsProps {
  isAuthenticated: boolean;
  onLogin: () => void;
  onSuccess?: () => void;
}

export const ClaimReports = ({ isAuthenticated, onLogin, onSuccess }: ClaimReportsProps) => {
  const [anonymousReports, setAnonymousReports] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load anonymous reports from localStorage
  useEffect(() => {
    if (isAuthenticated) {
      const storedReports = localStorage.getItem('anonymousReports');
      if (storedReports) {
        setAnonymousReports(JSON.parse(storedReports));
      }
    }
  }, [isAuthenticated]);

  // Skip if there are no reports to claim
  if (!isAuthenticated || anonymousReports.length === 0) {
    return null;
  }

  const handleClaimReports = async () => {
    if (anonymousReports.length === 0) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/tools/audit/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportIds: anonymousReports }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim reports');
      }

      // Clear the localStorage entry once claimed
      localStorage.removeItem('anonymousReports');
      setAnonymousReports([]);

      // Show appropriate message with counts
      toast({
        title: "Reports Processed",
        description: data.message || `Successfully claimed ${data.claimedCount} reports.`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 border-yellow-200 bg-yellow-50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-medium mb-1">You have unclaimed reports</h3>
          <p className="text-sm text-muted-foreground">
            We found {anonymousReports.length} report{anonymousReports.length !== 1 ? 's' : ''} created before you logged in.
          </p>
        </div>
        <div className="flex items-center">
          <Badge variant="outline" className="mr-2">
            {anonymousReports.length} unclaimed
          </Badge>
          <Button
            onClick={handleClaimReports}
            disabled={isLoading}
          >
            {isLoading ? 'Claiming...' : 'Claim All Reports'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Component to display on the history page when user is not logged in
export const AuditHistoryLoginPrompt = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <Card className="p-8 text-center">
      <LogIn className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold mb-2">Login to View Audit History</h3>
      <p className="text-muted-foreground mb-4">
        Sign in to see your previous audits and reports. Your anonymous reports will be saved to your account.
      </p>
      <Button onClick={onLogin}>Log in Now</Button>
    </Card>
  );
};