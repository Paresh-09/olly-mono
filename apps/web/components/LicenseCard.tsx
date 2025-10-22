import { useState } from 'react';
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/ui/card";
import Image from "next/image";

type License = {
  id: string;
  key: string;
  type: "main" | "sub";
  mainLicenseKey?: string;
  mainLicenseKeyId?: string;
  vendor?: string;
  tier?: string;
};

interface LicenseCardProps {
  licenses: License[];
  selectedLicense: string | null;
  onSelectLicense: (id: string) => void;
  onContinue: () => void;
  isSubmitting: boolean;
}

export function LicenseCard({ licenses, selectedLicense, onSelectLicense, onContinue, isSubmitting }: LicenseCardProps) {
  // Helper function to get license display info
  const getLicenseDisplayInfo = (license: License) => {
    const shortKey = `${license.key.substring(0, 8)}...${license.key.substring(license.key.length - 4)}`;

    if (license.type === 'sub') {
      return {
        title: shortKey,
        subtitle: license.vendor || 'Sublicense',
        badge: 'Sublicense',
        badgeVariant: 'default' as const,
        description: license.mainLicenseKey ? `Under: ${license.mainLicenseKey.substring(0, 8)}...` : undefined
      };
    } else {
      return {
        title: shortKey,
        subtitle: license.vendor || 'Main License',
        badge: license.tier || 'Main License',
        badgeVariant: 'outline' as const,
        description: license.tier ? `Tier: ${license.tier}` : undefined
      };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select License</CardTitle>
        <CardDescription>Choose which license you want to use with the Olly extension</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Show info based on license composition */}
        {licenses.some(l => l.type === 'sub') && licenses.some(l => l.type === 'main') && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
            <p className="text-sm text-blue-700">
              💡 You have sublicenses available. Sublicenses are recommended for extension use.
            </p>
          </div>
        )}

        {licenses.filter(l => l.type === 'sub').length > 1 && !licenses.some(l => l.type === 'main') && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
            <p className="text-sm text-blue-700">
              🔑 You have multiple sublicenses. Choose the one you'd like to use with the extension.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {licenses.map((license) => {
            const displayInfo = getLicenseDisplayInfo(license);
            const isSubLicense = license.type === 'sub';

            return (
              <div
                key={license.id}
                onClick={() => onSelectLicense(license.id)}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  selectedLicense === license.id
                    ? isSubLicense
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-primary/5 border-2 border-primary'
                    : isSubLicense
                      ? 'border border-blue-200 hover:border-blue-300 hover:bg-blue-50/50'
                      : 'border border-input hover:border-primary/50 hover:bg-accent/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${
                      selectedLicense === license.id
                        ? isSubLicense ? 'bg-blue-500' : 'bg-primary'
                        : 'bg-muted'
                    }`} />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate max-w-[200px]">
                        {displayInfo.title}
                      </div>
                      <div className="flex items-center mt-1 space-x-2">
                        <Badge
                          variant={displayInfo.badgeVariant}
                          className={`text-xs ${
                            isSubLicense
                              ? 'border-blue-200 text-blue-700 bg-blue-50'
                              : 'border-primary/20 text-primary bg-primary/5'
                          }`}
                        >
                          {displayInfo.badge}
                        </Badge>
                        <span className="text-xs text-muted-foreground truncate">
                          {displayInfo.subtitle}
                        </span>
                      </div>
                      {displayInfo.description && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {displayInfo.description}
                        </div>
                      )}
                    </div>
                  </div>
                  {isSubLicense && (
                    <div className="ml-2">
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-600">
                        Recommended
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Button
          className={`w-full ${
            licenses.find(l => l.id === selectedLicense)?.type === 'sub'
              ? 'bg-blue-500 hover:bg-blue-600'
              : ''
          }`}
          disabled={!selectedLicense || isSubmitting}
          onClick={onContinue}
        >
          {isSubmitting ? 'Connecting...' : 'Continue with Selected License'}
        </Button>
      </CardContent>
    </Card>
  );
} 