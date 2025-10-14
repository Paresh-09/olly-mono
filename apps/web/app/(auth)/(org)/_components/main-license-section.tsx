import React from "react";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { Badge } from "@repo/ui/components/ui/badge";

export interface MainLicense {
  id: string;
  key: string;
  isActive: boolean;
  tier: number;
}

interface MainLicenseSectionProps {
  licenses: MainLicense[];
  userEmail: string;
  error: string;
}

export const MainLicenseSection: React.FC<MainLicenseSectionProps> = ({
  licenses,
  userEmail,
  error,
}) => {
  if (licenses.length === 0) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-500">No main licenses available.</p>
      </div>
    );
  }

  const getTierLabel = (tier: number) => {
    switch (tier) {
      case 1:
        return "Basic";
      case 2:
        return "Standard";
      case 3:
        return "Premium";
      case 4:
        return "Enterprise";
      default:
        return `Tier ${tier}`;
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2">Main Licenses</h3>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-3">
        {licenses.map((license) => (
          <div
            key={license.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{license.key}</span>
                <Badge
                  variant={license.isActive ? "default" : "secondary"}
                  className={`text-xs ${license.isActive ? "bg-green-100 text-green-800" : ""}`}
                >
                  {license.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {getTierLabel(license.tier)}
                </Badge>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                <span>License ID: {license.id}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
