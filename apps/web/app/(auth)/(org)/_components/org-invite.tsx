'use client'

import { useActionState } from "react";


import { inviteUserToOrganization } from '@/lib/actions/org-actions';
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";

interface InviteUserFormProps {
  organizationId: string;
}

export default function InviteUserForm({ organizationId }: InviteUserFormProps) {
  const [state, formAction] = useActionState(inviteUserToOrganization, null);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Invite User</h2>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="organizationId" value={organizationId} />
        <Input type="email" name="email" placeholder="User Email" required />
        <Select name="role" required>
          <SelectTrigger>
            <SelectValue placeholder="Select Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="MEMBER">Member</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" className="w-full">Invite</Button>
      </form>
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {state?.success && (
        <Alert>
          <AlertDescription>{state.success}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}