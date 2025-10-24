'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@repo/ui/hooks/use-toast";
import { ExtendedUser } from "@/lib/auth";

interface Props {
  userEmail: string;
  userName: string;
  licenseKey: string;
  accessToken?: string;
}

export default function LicenseConfirmationClient({ userEmail, userName, licenseKey, accessToken }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/appsumo-redeem-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          name: userName,
          licenseKey,
          accessToken,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to activate license");
      }

      if (responseData.alreadyActivated) {
        toast({
          title: "License Already Activated",
          description: responseData.message,
          variant: "default",
          duration: 7000,
        });
        router.push('/onboarding');
        return;
      }

      router.push('/onboarding');
    } catch (error) {
      toast({
        title: "Activation Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    router.push('/onboarding');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm License Activation</DialogTitle>
          <DialogDescription>
            You are logged in as {userEmail}. Would you like to activate the AppSumo license for this account?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Activating..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}