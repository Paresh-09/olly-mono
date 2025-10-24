"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@repo/ui/components/ui/dialog";
import { Users, UserPlus } from "lucide-react";
import {
  OrganizationUser,
  TransferLog,
  TransferCreditsFormData,
  UserRole,
} from "@/types/orgs";
import InviteUserForm from "./org-invite";
import {
  listOrganizationUsers,
  updateUserRole,
  removeUserFromOrganization,
  transferCredits,
} from "@/lib/actions/org-actions";
import TransferCreditsDialog from "./transfer-credit-dialog";
import TransferHistoryTable from "./transfer-history-table";
import { useSession } from "@/providers/SessionProvider";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import UserCard from "./user-card";

const UserCardSkeleton: React.FC = () => (
  <div className="p-6 rounded-lg border bg-white shadow-sm">
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  </div>
);

const TransferHistorySkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="rounded-lg border bg-white">
      <div className="p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const OrganizationDetails: React.FC = () => {
  const { session } = useSession();
  const params = useParams();
  const orgId = params.orgId as string;

  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [transferLogs, setTransferLogs] = useState<TransferLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transferData, setTransferData] = useState<TransferCreditsFormData>({
    fromUserId: "",
    toUserId: "",
    amount: 0,
  });
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [isTransferring, setIsTransferring] = useState(false);

  if (!session || !session.userId) {
    return null;
  }

  useEffect(() => {
    fetchUsers();
  }, [orgId]);

  async function fetchUsers() {
    try {
      setIsLoading(true);
      const result = await listOrganizationUsers(orgId);
      if ("error" in result && result.error) {
        setError(result.error);
      } else if ("success" in result && result.success) {
        setUsers(JSON.parse(result.success));
      }
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTransferCredits() {
    try {
      setIsTransferring(true);
      setError(null);

      if (!session?.userId) {
        setError("Authentication required to transfer credits");
        return;
      }

      const result = await transferCredits(
        transferData.fromUserId,
        transferData.toUserId,
        transferData.amount,
        orgId,
        session.userId,
      );

      if (result.error) {
        setError(result.error);
      } else {
        setIsTransferDialogOpen(false);
        setTransferData({ fromUserId: "", toUserId: "", amount: 0 });
        await Promise.all([fetchUsers()]);
      }
    } catch (err) {
      setError("Failed to transfer credits");
    } finally {
      setIsTransferring(false);
    }
  }

  async function handleRoleUpdate(userId: string, newRole: UserRole) {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("organizationId", orgId);
      formData.append("userId", userId);
      formData.append("role", newRole);
      const result = await updateUserRole(null, formData);
      if ("error" in result && result.error) {
        setError(result.error);
      } else {
        await fetchUsers();
      }
    } catch (err) {
      setError("Failed to update user role");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRemoveUser(userId: string) {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("organizationId", orgId);
      formData.append("userId", userId);
      const result = await removeUserFromOrganization(null, formData);
      if ("error" in result && result.error) {
        setError(result.error);
      } else {
        await fetchUsers();
      }
    } catch (err) {
      setError("Failed to remove user");
    } finally {
      setIsLoading(false);
    }
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mx-auto max-w-2xl mt-8">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <TabsList className="grid grid-cols-2 w-96">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger
                value="transfers"
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Transfer History
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    className="flex items-center gap-2"
                    disabled={isLoading}
                  >
                    <UserPlus className="h-4 w-4" />
                    Invite User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <InviteUserForm organizationId={orgId} />
                </DialogContent>
              </Dialog>

              <TransferCreditsDialog
                isOpen={isTransferDialogOpen}
                onOpenChange={setIsTransferDialogOpen}
                users={users}
                transferData={transferData}
                onTransferDataChange={setTransferData}
                onTransferCredits={handleTransferCredits}
                isTransferring={isTransferring}
              />
            </div>
          </div>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading ? (
                <>
                  <UserCardSkeleton />
                  <UserCardSkeleton />
                  <UserCardSkeleton />
                  <UserCardSkeleton />
                </>
              ) : (
                users.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onRoleUpdate={handleRoleUpdate}
                    onRemoveUser={handleRemoveUser}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="transfers">
            {isLoading ? (
              <TransferHistorySkeleton />
            ) : (
              <TransferHistoryTable transferLogs={transferLogs} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OrganizationDetails;
