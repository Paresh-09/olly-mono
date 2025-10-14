import React from "react";
import { CreditCard } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { ExtendedUser, UserRole } from "@/types/orgs";

interface UserInfoProps {
  user: ExtendedUser;
  role: UserRole;
  isOwner: boolean;
  onRoleUpdate: (newRole: UserRole) => void;
  onRemoveUser: () => void;
}

export const UserInfo: React.FC<UserInfoProps> = ({
  user,
  role,
  isOwner,
  onRoleUpdate,
  onRemoveUser,
}) => {
  return (
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">{user.username || user.email}</h3>
        <p className="text-sm text-gray-500">{user.email}</p>
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">
            {user.credit?.balance ?? 0} credits
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Select value={role} onValueChange={onRoleUpdate} disabled={isOwner}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="OWNER">Owner</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="MEMBER">Member</SelectItem>
          </SelectContent>
        </Select>
        {!isOwner && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onRemoveUser}
            disabled={isOwner}
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  );
};
