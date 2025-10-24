"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { ArrowLeftRight, CreditCard, Loader2 } from "lucide-react";
import { OrganizationUser, TransferCreditsFormData } from "@/types/orgs";

interface TransferCreditsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  users: OrganizationUser[];
  transferData: TransferCreditsFormData;
  onTransferDataChange: (data: TransferCreditsFormData) => void;
  onTransferCredits: () => void;
  isTransferring: boolean;
}

const TransferCreditsDialog: React.FC<TransferCreditsDialogProps> = ({
  isOpen,
  onOpenChange,
  users,
  transferData,
  onTransferDataChange,
  onTransferCredits,
  isTransferring,
}) => {
  const fromUserBalance =
    users.find((u) => u.user.id === transferData.fromUserId)?.user.credit
      ?.balance ?? 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4" />
          Transfer Credits
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Transfer Credits
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>From User</Label>
            <Select
              value={transferData.fromUserId}
              onValueChange={(value: string) => {
                onTransferDataChange({
                  ...transferData,
                  fromUserId: value,
                  toUserId:
                    transferData.toUserId === value
                      ? ""
                      : transferData.toUserId,
                });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select user to transfer from" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem
                    key={user.user.id}
                    value={user.user.id}
                    className="flex items-center justify-between"
                  >
                    <span>{user.user.username || user.user.email}</span>
                    <span className="text-sm text-blue-600 font-medium pl-2">
                      {user.user.credit?.balance ?? 0} credits
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>To User</Label>
            <Select
              value={transferData.toUserId}
              onValueChange={(value: string) =>
                onTransferDataChange({
                  ...transferData,
                  toUserId: value,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select user to transfer to" />
              </SelectTrigger>
              <SelectContent>
                {users
                  .filter((user) => user.user.id !== transferData.fromUserId)
                  .map((user) => (
                    <SelectItem
                      key={user.user.id}
                      value={user.user.id}
                      className="flex items-center justify-between"
                    >
                      <span>{user.user.username || user.user.email}</span>
                      <span className="text-sm text-blue-600 font-medium pl-2">
                        {user.user.credit?.balance ?? 0} credits
                      </span>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              min="1"
              value={transferData.amount}
              onChange={(e) =>
                onTransferDataChange({
                  ...transferData,
                  amount: parseInt(e.target.value) || 0,
                })
              }
              className="w-full"
            />
            {transferData.fromUserId && (
              <p className="text-sm text-gray-500 mt-1">
                Available credits: {fromUserBalance}
              </p>
            )}
          </div>
          <Button
            className="w-full"
            onClick={onTransferCredits}
            disabled={
              !transferData.fromUserId ||
              !transferData.toUserId ||
              transferData.amount <= 0 ||
              transferData.fromUserId === transferData.toUserId ||
              transferData.amount > fromUserBalance
            }
          >
            {isTransferring ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Transferring...
              </>
            ) : (
              "Transfer Credits"
            )}
          </Button>
          {transferData.fromUserId === transferData.toUserId && (
            <p className="text-sm text-red-500 text-center">
              Cannot transfer credits to the same account
            </p>
          )}
          {transferData.amount > fromUserBalance && (
            <p className="text-sm text-red-500 text-center">
              Amount exceeds available credits
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransferCreditsDialog;
