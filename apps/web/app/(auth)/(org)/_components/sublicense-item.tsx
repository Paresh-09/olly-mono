import React from "react";
import { User2, CalendarClock, Activity } from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/components/ui/alert-dialog";
import { SubLicense, SubLicenseGoal } from "@/types/sublicense";

interface SublicenseItemProps {
  license: SubLicense;
  userEmail: string;
  onRemove: (licenseId: string) => Promise<void>;
  isRemoving: boolean;
}

export const SublicenseItem: React.FC<SublicenseItemProps> = ({
  license,
  userEmail,
  onRemove,
  isRemoving,
}) => {
  const getBadgeVariant = (
    status: string,
  ): "default" | "secondary" | "outline" | "destructive" => {
    return status === "ACTIVE" ? "default" : "secondary";
  };

  const renderGoals = (goals: SubLicenseGoal[] | undefined) => {
    if (!goals || goals.length === 0) return null;

    return (
      <div className="text-sm">
        <span className="text-gray-500">Goals: </span>
        {goals.map((goal, index) => (
          <span key={goal.id} className="text-gray-600">
            {goal.description}
            {index < goals.length - 1 ? ", " : ""}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="border rounded-lg p-3 space-y-2 bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-[70%]">
          <span className="font-medium text-sm truncate max-w-[200px]">
            {license.key}
          </span>
          <Badge variant={getBadgeVariant(license.status)}>
            {license.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {license.vendor && (
            <span className="text-sm text-gray-500">{license.vendor}</span>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isRemoving}>
                Remove
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Sublicense</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove this sublicense from{" "}
                  {userEmail}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onRemove(license.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isRemoving ? "Removing..." : "Remove License"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Activity className="h-3 w-3" />
          <span>{license.activationCount} uses </span>
        </div>
        <div className="flex items-center gap-1">
          <CalendarClock className="h-3 w-3" />
          <span>{new Date(license.createdAt)?.toLocaleDateString()}</span>
        </div>
        {license.assignedUser && (
          <div className="flex items-center gap-1">
            <User2 className="h-3 w-3" />
            <span className="truncate">{license.assignedUser.email}</span>
          </div>
        )}
      </div>

      {renderGoals(license.subLicenseGoals)}
    </div>
  );
};
