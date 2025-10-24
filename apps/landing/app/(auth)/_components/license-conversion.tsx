// license-conversion.tsx
'use client';

import React, { useState } from 'react';
import { Button } from "@repo/ui/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react';

interface License {
  id: string;
  key: string;
  vendor: string;
  lemonProductId: number | null;
}

interface LicenseConversionProps {
  licenses: License[];
  onClose: () => void;
  onConvert: (licenseIds: string[]) => Promise<void>;
}

export default function LicenseConversion({ licenses, onClose, onConvert }: LicenseConversionProps) {
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleConversion = async () => {
    setIsConverting(true);
    setError(null);
    try {
      const licenseIds = licenses.map(license => license.id);
      await onConvert(licenseIds);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert licenses');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Convert to Team License
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success ? (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              Your licenses have been successfully converted to a team license.
              Redirecting...
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                You&apos;re about to convert {licenses.length} individual licenses into a team license.
                This action cannot be undone.
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Licenses to be converted:</h3>
              <ul className="space-y-2">
                {licenses.map((license) => (
                  <li key={license.id} className="flex items-center justify-between text-sm">
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      {license.key}
                    </code>
                    <span className="text-gray-500">
                      {license.vendor}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-blue-800">Benefits of Team License:</h3>
              <ul className="list-disc pl-5 space-y-1 text-blue-700">
                <li>Centralized license management</li>
                <li>Easy user onboarding and offboarding</li>
                <li>Advanced usage analytics</li>
                <li>Team-wide settings and configurations</li>
                <li>Priority support</li>
              </ul>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex justify-end space-x-2 bg-gray-50 px-6 py-4">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isConverting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConversion}
          disabled={isConverting || success}
          className="min-w-[120px]"
        >
          {isConverting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Converting...
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Converted!
            </>
          ) : (
            'Convert Licenses'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}