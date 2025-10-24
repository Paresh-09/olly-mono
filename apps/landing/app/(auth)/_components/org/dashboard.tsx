'use client';

import { useState, useMemo } from 'react';
import { Button } from "@repo/ui/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { createSubLicense } from '@/lib/actions/org-actions';
import UsageLogs from '../user-logs';
import LicensesList from '../license-list';

interface Organization {
  id: string;
  name: string;
  isPremium: boolean;
}

interface LicenseKey {
  id: string;
  key: string;
  isActive: boolean;
  tier: number | null;
  vendor: string;
  lemonProductId: number | null;
}

interface License {
  licenseKey: {
    id: string;
    key: string;
    isActive: boolean;
    tier: number | null;
    vendor: string;
    lemonProductId: number | null;
  };
  userId: string;
  licenseKeyId: string;
  assignedAt: Date;
}

interface SubLicense {
  id: string;
  key: string;
  status: string;
  assignedEmail: string | null;
  mainLicenseKey: {
    id: string;
    tier: number | null;
    vendor: string;
    lemonProductId: number | null;
  };
}

interface UsageLog {
  date: string;
  total: number;
  [platform: string]: number | string | { [action: string]: number };
}

interface OrgDashboardProps {
  organization: Organization;
  licenses: LicenseKey[];
  subLicenses: SubLicense[];
  usageLogs: UsageLog[];
  userRole: 'OWNER' | 'ADMIN' | 'MEMBER';
}

export default function OrgDashboard({ organization, licenses, subLicenses, usageLogs, userRole }: OrgDashboardProps) {
  const [isCreateSubLicenseOpen, setIsCreateSubLicenseOpen] = useState(false);
  const [newSubLicenseKey, setNewSubLicenseKey] = useState('');

  const handleCreateSubLicense = async () => {
    const result = await createSubLicense(organization.id);
    if (result.success && result.licenseKey) {
      setNewSubLicenseKey(result.licenseKey);
      setIsCreateSubLicenseOpen(true);
    } else {
      console.error(result.error);
    }
  };

  const formattedLicenses = useMemo(() => {
    return licenses.map(license => ({
      licenseKey: {
        id: license.id,
        key: license.key,
        isActive: license.isActive,
        tier: license.tier,
        vendor: license.vendor,
        lemonProductId: license.lemonProductId
      },
      userId: '',  // Default empty string for userId
      licenseKeyId: license.id,
      assignedAt: new Date(),  // Current date as default
    }));
  }, [licenses]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">{organization.name} Dashboard</h1>
      
      <div className="space-y-4">
        <div className="h-[300px]">
          <UsageLogs 
            usageLogs={usageLogs} 
            licenseKeys={licenses.map(license => license.key)} 
            licenses={formattedLicenses}
            isLoading={false}
          />
        </div>

        <div className="h-[250px] overflow-auto">
          <LicensesList licenses={formattedLicenses} subLicenses={subLicenses} />
        </div>

        {organization.isPremium && userRole === 'OWNER' && (
          <Button onClick={handleCreateSubLicense}>Create Sublicense</Button>
        )}
      </div>

      <Dialog open={isCreateSubLicenseOpen} onOpenChange={setIsCreateSubLicenseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Sublicense Created</DialogTitle>
            <DialogDescription>
              Your new sublicense has been created successfully. Please copy the license key below:
            </DialogDescription>
          </DialogHeader>
          <Input value={newSubLicenseKey} readOnly />
          <DialogFooter>
            <Button onClick={() => setIsCreateSubLicenseOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}