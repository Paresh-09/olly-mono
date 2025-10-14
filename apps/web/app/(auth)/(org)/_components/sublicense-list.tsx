import React, { useState } from "react";
import { Key } from "lucide-react";
import { SubLicense } from "@/types/sublicense";
import { SublicenseItem } from "./sublicense-item";

interface SublicenseListProps {
  sublicenses: SubLicense[];
  userEmail: string;
  onRemoveLicense: (licenseId: string) => Promise<boolean>;
}

export const SublicenseList: React.FC<SublicenseListProps> = ({
  sublicenses,
  userEmail,
  onRemoveLicense,
}) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemoveLicense = async (licenseId: string) => {
    setIsRemoving(true);
    await onRemoveLicense(licenseId);
    setIsRemoving(false);
  };

  if (sublicenses.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg bg-gray-50">
        <Key className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">No sublicenses assigned</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {sublicenses.map((license) => (
        <SublicenseItem
          key={license.id}
          license={license}
          userEmail={userEmail}
          onRemove={handleRemoveLicense}
          isRemoving={isRemoving}
        />
      ))}
    </div>
  );
};
