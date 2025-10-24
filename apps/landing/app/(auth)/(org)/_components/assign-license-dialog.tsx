import React from "react";
import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { SubLicense } from "@/types/sublicense";

interface AssignLicenseDialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableSubLicenses: SubLicense[];
  selectedSubLicenseId: string;
  onSelectSubLicense: (id: string) => void;
  onAssign: () => void;
  isAssigning: boolean;
  hasExistingLicenses: boolean;
  error: string;
}

export const AssignLicenseDialog: React.FC<AssignLicenseDialogProps> = ({
  children,
  open,
  onOpenChange,
  availableSubLicenses,
  selectedSubLicenseId,
  onSelectSubLicense,
  onAssign,
  isAssigning,
  hasExistingLicenses,
  error,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {hasExistingLicenses ? "Change Sublicense" : "Assign Sublicense"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Select
            value={selectedSubLicenseId}
            onValueChange={onSelectSubLicense}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a sublicense" />
            </SelectTrigger>
            <SelectContent>
              {availableSubLicenses.map((license) => (
                <SelectItem key={license.id} value={license.id}>
                  {license.key} {license.vendor ? `(${license.vendor})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button
            onClick={onAssign}
            disabled={isAssigning || !selectedSubLicenseId}
            className="w-full"
          >
            {isAssigning
              ? "Assigning..."
              : hasExistingLicenses
                ? "Change License"
                : "Assign License"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
