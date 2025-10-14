// app/(auth)/dashboard/auto-commenter/_components/auto-commenter-wrapper.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { AutoCommenterForm } from "./auto-commenter-form";
import { Loader2 } from "lucide-react";
import { CommentPlatform } from "@repo/db";

interface AutoCommenterWrapperProps {
  availableCredits: number;
  platform: CommentPlatform;
}

export function AutoCommenterWrapper({
  availableCredits,
  platform,
}: AutoCommenterWrapperProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [oauthStatus, setOauthStatus] = useState<
    "valid" | "expired" | "missing"
  >("missing");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkOAuthStatus();
  }, [platform]); // Add platform as dependency

  const checkOAuthStatus = async () => {
    try {
      const response = await fetch(
        `/api/auto-commenter/oauth-status?platform=${platform}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to check OAuth status");
      }

      const data = await response.json();

      if (!data.hasToken) {
        setOauthStatus("missing");
      } else if (data.isExpired) {
        setOauthStatus("expired");
      } else {
        setOauthStatus("valid");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to check OAuth status",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <AutoCommenterForm
      availableCredits={availableCredits}
      platform={platform}
    />
  );
}
