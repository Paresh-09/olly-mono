"use client";

import React, { useState } from "react";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@repo/ui/hooks/use-toast";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface DashboardRedeemFormProps {
  user: User;
}

export default function DashboardRedeemForm({
  user,
}: DashboardRedeemFormProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Please enter a redeem code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // const response = await fetch("/api/dashboard/redeem", {
      const response = await fetch("/api/redeem-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: code, userId: user.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error status codes
        if (response.status === 409) {
          throw new Error("This redeem code has already been claimed");
        } else if (response.status === 404) {
          throw new Error("Invalid redeem code");
        } else if (response.status === 503 && retryCount < 2) {
          // Server is busy, retry automatically
          setRetryCount((prev) => prev + 1);
          setError("Server is busy. Retrying...");

          // Wait 2 seconds before retrying
          setTimeout(() => {
            handleSubmit(e);
          }, 2000);
          return;
        } else {
          throw new Error(data.error || "Failed to redeem license");
        }
      }

      // Success
      toast({
        title: "Success",
        description: "License key successfully redeemed!",
      });
      router.push("/dashboard");
      router.refresh(); // Refresh the page to update UI with new license
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
          <AlertCircle size={20} />
          <p className="text-sm">{error}</p>
        </div>
      )}
      <div className="flex space-x-2">
        <Input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter your redeem code"
          className="flex-grow"
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="whitespace-nowrap"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {retryCount > 0 ? `Retrying (${retryCount})...` : "Redeeming..."}
            </>
          ) : (
            "Redeem"
          )}
        </Button>
      </div>
    </form>
  );
}

