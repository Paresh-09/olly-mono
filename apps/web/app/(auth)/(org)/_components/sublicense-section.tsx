import React, { useState } from "react";
import { Key, Plus } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { SubLicense } from "@/types/sublicense";
import { SublicenseList } from "./sublicense-list";
import { AssignLicenseDialog } from "./assign-license-dialog";

interface SublicenseSectionProps {
  sublicenses: SubLicense[];
  availableSubLicenses: SubLicense[];
  userEmail: string;
  onAssignLicense: (subLicenseId: string) => Promise<boolean>;
  onRemoveLicense: (licenseId: string) => Promise<boolean>;
  error: string;
}

export const SublicenseSection: React.FC<SublicenseSectionProps> = ({
  sublicenses,
  availableSubLicenses,
  userEmail,
  onAssignLicense,
  onRemoveLicense,
  error,
}) => {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedSubLicenseId, setSelectedSubLicenseId] = useState("");

  const activeSublicenses = sublicenses.filter(
    (license) => license.status === "ACTIVE",
  );

  const handleAssignLicense = async () => {
    if (!selectedSubLicenseId) return;

    setIsAssigning(true);
    const success = await onAssignLicense(selectedSubLicenseId);

    if (success) {
      setAssignDialogOpen(false);
      setSelectedSubLicenseId("");
    }

    setIsAssigning(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-gray-500" />
          <span className="font-medium">
            Sublicenses ({activeSublicenses.length} active)
          </span>
        </div>

        <AssignLicenseDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          availableSubLicenses={availableSubLicenses}
          selectedSubLicenseId={selectedSubLicenseId}
          onSelectSubLicense={setSelectedSubLicenseId}
          onAssign={handleAssignLicense}
          isAssigning={isAssigning}
          hasExistingLicenses={sublicenses.length > 0}
          error={error}
        >
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={availableSubLicenses.length === 0}
          >
            <Plus className="h-4 w-4" />
            {sublicenses.length > 0 ? "Change License" : "Assign License"}
          </Button>
        </AssignLicenseDialog>
      </div>

      <SublicenseList
        sublicenses={sublicenses}
        userEmail={userEmail}
        onRemoveLicense={onRemoveLicense}
      />
    </div>
  );
};
