"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@repo/ui/components/ui/button";
import { PageBackground } from "../../_components/auth-background";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { LicenseCard } from "@/components/LicenseCard";


type License = {
  id: string;
  key: string;
  type: "main" | "sub";
  mainLicenseKey?: string;
  mainLicenseKeyId?: string;
  vendor?: string;
  tier?: string;
};

const styles = `
  @keyframes float-slow {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
  
  @keyframes float-medium {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
  }
  
  @keyframes float-fast {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes bounce-gentle {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  .animate-float-slow {
    animation: float-slow 4s ease-in-out infinite;
  }
  
  .animate-float-medium {
    animation: float-medium 3s ease-in-out infinite;
  }
  
  .animate-float-fast {
    animation: float-fast 2s ease-in-out infinite;
  }
  
  .animate-bounce-gentle {
    animation: bounce-gentle 2s ease-in-out infinite;
  }
`;

export default function ExtensionSelectLicense() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const apiKeyId = searchParams.get("apiKeyId");
  const isFreePlan = searchParams.get("isFreePlan") === "true";
  const code = searchParams.get("code");

  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLicense, setSelectedLicense] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedApiKey, setGeneratedApiKey] = useState<any>(null);

  // Function to generate a new API key
  const generateNewApiKey = async () => {
    try {
      const response = await fetch('/api/v2/key/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedApiKey(data.apiKey);
        return data.apiKey;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate API key");
      }
    } catch (error) {
      console.error('Error generating API key:', error);
      throw error;
    }
  };

  const handleContinue = useCallback(async () => {
    if (loading) return;

    if (isFreePlan) {
      setIsSubmitting(true);
      const redirectParams = new URLSearchParams();
      if (code) redirectParams.set("code", code);
      redirectParams.set("isExtensionLogin", "true");
      redirectParams.set("isConnected", "true");
      redirectParams.set("step", "1");
      redirectParams.set("isFreePlan", "true");
      router.push(`/onboarding?${redirectParams.toString()}`);
      return;
    }

    if (!selectedLicense) {
      setError("Missing license selection");
      return;
    }

    setIsSubmitting(true);

    try {
      const license = licenses.find(l => l.id === selectedLicense);
      if (!license) throw new Error('Selected license not found');

      // Use existing apiKeyId or generated API key
      let finalApiKeyId = apiKeyId;
      if (!finalApiKeyId) {
        if (!generatedApiKey) {
          // Generate a new API key if none exists
          const newApiKey = await generateNewApiKey();
          finalApiKeyId = newApiKey.id;
        } else {
          finalApiKeyId = generatedApiKey.id;
        }
      }

      const response = await fetch('/api/auth/extension/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenseId: license.id,
          apiKeyId: finalApiKeyId,
          isSubLicense: license.type === 'sub',
          mainLicenseKey: license.type === 'sub' ? license.mainLicenseKey : undefined,
          mainLicenseKeyId: license.type === 'sub' ? license.mainLicenseKeyId : undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Token generation error response:", errorData);
        throw new Error(`Failed to generate token: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.token) throw new Error('No token returned from server');

      const redirectParams = new URLSearchParams();
      redirectParams.set("code", data.token);
      if (code) redirectParams.set("onboarding_code", code);
      redirectParams.set("isExtensionLogin", "true");
      redirectParams.set("isConnected", "true");
      redirectParams.set("step", "1");

      router.push(`/login/extension-callback?${redirectParams.toString()}`);
    } catch (err: any) {
      setError(`Failed to generate authentication token: ${err.message || 'Unknown error'}`);
      console.error("Token generation error:", err);
      setIsSubmitting(false);
    }
  }, [isFreePlan, selectedLicense, apiKeyId, code, licenses, router, loading, generatedApiKey]);

  useEffect(() => {
    const fetchLicenses = async () => {
      if (isFreePlan) {
        setLoading(false);
        return;
      }

      if (loading && !isFreePlan) {
        try {
          // If no API key is provided, generate one automatically
          if (!apiKeyId) {
            try {
              await generateNewApiKey();
            } catch (err) {
              console.error("Error generating API key:", err);
              // Continue without API key for now, will be generated later if needed
            }
          }

          const response = await fetch('/api/auth/extension/licenses');
          if (!response.ok) throw new Error(`Failed to fetch licenses: ${response.status} ${response.statusText}`);

          const data = await response.json();
          if (!data.licenses || !Array.isArray(data.licenses)) throw new Error('Invalid license data format');

          const sortedLicenses = data.licenses.sort((a: License, b: License) => {
            if (a.type === 'sub' && b.type === 'main') return -1;
            if (a.type === 'main' && b.type === 'sub') return 1;
            return 0;
          });

          setLicenses(sortedLicenses);

          const subLicenses = sortedLicenses.filter((l: License) => l.type === 'sub');
          const mainLicenses = sortedLicenses.filter((l: License) => l.type === 'main');

          if (subLicenses.length > 0) {
            setSelectedLicense(subLicenses[0].id);
          } else if (mainLicenses.length === 1) {
            setSelectedLicense(mainLicenses[0].id);
          }
        } catch (err: any) {
          setError(`Error loading licenses: ${err.message || 'Unknown error'}`);
          console.error("License fetch error:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchLicenses();
  }, [isFreePlan, loading, apiKeyId]);

  useEffect(() => {
    if (!loading && !isFreePlan && selectedLicense && licenses.length > 0) {
      const selectedLicenseObj = licenses.find(l => l.id === selectedLicense);
      const subLicenses = licenses.filter(l => l.type === 'sub');
      const mainLicenses = licenses.filter(l => l.type === 'main');

      const shouldAutoContinue =
        (subLicenses.length === 1 && selectedLicenseObj?.type === 'sub') ||
        (subLicenses.length === 0 && mainLicenses.length === 1 && selectedLicenseObj?.type === 'main');

      if (shouldAutoContinue && !isSubmitting) {
        setTimeout(() => handleContinue(), 500);
      }
    }
  }, [loading, isFreePlan, selectedLicense, licenses, isSubmitting, handleContinue]);

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <PageBackground />
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-4">
            <Image
              src="/icon-2.png"
              alt="Olly Icon"
              width={56}
              height={56}
              className="transform transition-all duration-300 hover:scale-110"
            />
            <span className="text-3xl font-bold text-gray-800">
              Olly
            </span>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-8 text-center space-y-4">
              <div className="relative mx-auto w-12 h-12">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 border-4 border-primary rounded-full animate-spin" style={{ borderTopColor: 'transparent' }}></div>
              </div>
              <p className="text-muted-foreground">Loading your licenses...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="py-6 text-center space-y-4">
              <p className="text-destructive mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={() => {
                  setError(null);
                  setLoading(true);
                }}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : licenses.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center space-y-4">
              <p className="text-muted-foreground">No licenses found. Please contact support or purchase a license.</p>
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Set title for extension to detect no license state
                    document.title = "No Licenses Available";
                    router.push('/pricing');
                  }}
                >
                  View Pricing
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    // Set title for extension to detect dashboard redirect
                    document.title = "Redirecting to Dashboard";
                    router.push('/dashboard');
                  }}
                >
                  Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <LicenseCard
            licenses={licenses}
            selectedLicense={selectedLicense}
            onSelectLicense={setSelectedLicense}
            onContinue={handleContinue}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}