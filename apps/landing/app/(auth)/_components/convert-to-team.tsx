import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { Users, ArrowRight, AlertTriangle, Lock } from "lucide-react";
import { Input } from "@repo/ui/components/ui/input";

interface ConvertibleLicense {
  id: string;
  key: string;
  isActive: boolean;
  tier: number | null;
  vendor: string;
  lemonProductId?: number | null;
}

interface LicenseConversionProps {
  licenses: ConvertibleLicense[];
  onClose: () => void;
  onConvert: (licenseIds: string[]) => Promise<void>;
}

const CONFIRMATION_TEXT = "I agree this is not reversible";

const LicenseConversion = ({ licenses, onClose, onConvert }: LicenseConversionProps) => {
  const [selectedLicenses, setSelectedLicenses] = useState<Set<string>>(new Set());
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationInput, setConfirmationInput] = useState('');

  // Group active licenses by vendor
  const licensesByVendor = useMemo(() => {
    const convertibleLicenses = licenses.filter(license => license.isActive);
    return convertibleLicenses.reduce((acc, license) => {
      if (!acc[license.vendor]) {
        acc[license.vendor] = [];
      }
      acc[license.vendor].push(license);
      return acc;
    }, {} as Record<string, ConvertibleLicense[]>);
  }, [licenses]);

  // Check if a license is eligible for conversion
  const isEligibleLicense = (license: ConvertibleLicense) => {
    return license.tier === 1 || license.lemonProductId === 328561;
  };

  // Validate if current selection is valid for conversion
  const validateSelection = useMemo(() => {
    if (selectedLicenses.size < 2) {
      return { valid: false, message: 'Select at least 2 licenses' };
    }

    const selectedLicenseDetails = Array.from(selectedLicenses).map(
      id => licenses.find(l => l.id === id)!
    );

    // Check if all licenses are from the same vendor
    const vendors = new Set(selectedLicenseDetails.map(l => l.vendor));
    if (vendors.size > 1) {
      return { valid: false, message: 'Licenses must be from the same vendor' };
    }

    // Check if all selected licenses are eligible
    const allEligible = selectedLicenseDetails.every(isEligibleLicense);
    if (!allEligible) {
      return { 
        valid: false, 
        message: 'Only Tier 1 licenses or specific LemonSqueezy products can be combined' 
      };
    }

    return { valid: true, message: '' };
  }, [selectedLicenses, licenses]);

  const toggleLicense = (license: ConvertibleLicense) => {
    setSelectedLicenses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(license.id)) {
        newSet.delete(license.id);
      } else {
        newSet.add(license.id);
      }
      return newSet;
    });
  };

  const isConfirmationValid = confirmationInput === CONFIRMATION_TEXT;

  const handleConversion = async () => {
    if (!isConfirmationValid) {
      setError('Please type the confirmation text exactly as shown.');
      return;
    }

    if (!validateSelection.valid) {
      setError(validateSelection.message);
      return;
    }

    try {
      setIsConverting(true);
      setError(null);
      await onConvert(Array.from(selectedLicenses));
      onClose();
    } catch (err) {
      setError('Failed to convert licenses. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Convert Licenses to Team Plan</span>
          <ArrowRight className="h-4 w-4" />
          <Users className="h-4 w-4" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Alert variant="destructive" className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <span className="font-semibold block mb-1">Warning: This action cannot be undone!</span>
            Converting your licenses to a team plan is permanent. Your existing licenses will be deactivated
            and replaced with team seats. Make sure you want to proceed with this conversion.
          </AlertDescription>
        </Alert>
        
        <div className="text-sm text-gray-600">
          Select multiple licenses from the same vendor to convert them into a team plan. 
          Only Tier 1 licenses or specific LemonSqueezy products are eligible.
        </div>

        {Object.entries(licensesByVendor).map(([vendor, vendorLicenses]) => (
          <div key={vendor} className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">{vendor.toUpperCase()} Licenses</h3>
            {vendorLicenses.map((license) => {
              const isEligible = isEligibleLicense(license);
              
              return (
                <div 
                  key={license.id}
                  className={`flex items-center justify-between p-3 border rounded 
                    ${isEligible ? 'hover:bg-gray-50 cursor-pointer' : 'bg-gray-50 opacity-60'}`}
                  onClick={() => isEligible && toggleLicense(license)}
                >
                  <div className="flex items-center space-x-3">
                    {isEligible ? (
                      <input
                        type="checkbox"
                        checked={selectedLicenses.has(license.id)}
                        onChange={() => toggleLicense(license)}
                        className="h-4 w-4"
                      />
                    ) : (
                      <Lock className="h-4 w-4 text-gray-400" />
                    )}
                    <code className="text-sm font-mono">{license.key}</code>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100">
                      {license.tier ? `Tier ${license.tier}` : 'Standard'}
                    </span>
                    {!isEligible && (
                      <span className="text-xs text-gray-500">Not eligible for conversion</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {selectedLicenses.size >= 2 && validateSelection.valid && (
          <div className="space-y-2 border-t pt-4 mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Type &quot;{CONFIRMATION_TEXT}&quot; to confirm:
            </label>
            <Input
              type="text"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder="Type the confirmation text..."
              className="w-full"
            />
            {confirmationInput && !isConfirmationValid && (
              <p className="text-xs text-red-600">
                Text must match exactly
              </p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between space-x-3">
        <div className="text-sm text-gray-500">
          {!validateSelection.valid && selectedLicenses.size > 0 && (
            <span className="text-red-500">{validateSelection.message}</span>
          )}
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleConversion}
            disabled={!validateSelection.valid || isConverting || !isConfirmationValid}
            className="flex items-center space-x-2"
          >
            {isConverting ? (
              <span>Converting...</span>
            ) : (
              <>
                <Users className="h-4 w-4 mr-2" />
                <span>Convert to Team Plan ({selectedLicenses.size} seats)</span>
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LicenseConversion;