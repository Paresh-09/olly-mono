'use client'

import { updateOrganization } from '@/lib/actions/org-actions';
import { useState, useEffect, useActionState } from 'react';
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";

interface UpdateOrganizationFormProps {
  organizationId: string;
  currentName: string;
}

export default function UpdateOrganizationForm({
  organizationId,
  currentName,
}: UpdateOrganizationFormProps) {
  const [state, formAction] = useActionState(updateOrganization, null);
  const [name, setName] = useState(currentName);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (state?.error) {
      setErrorMessage(state.error);
    } else {
      setErrorMessage(null);
    }
  }, [state]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    formAction(new FormData(e.currentTarget));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Update Organization</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="organizationId" value={organizationId} />
        <Input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Organization Name"
          required
          minLength={3}
        />
        <Button type="submit" className="w-full">Update</Button>
      </form>
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      {state?.success && (
        <Alert>
          <AlertDescription>Organization updated successfully!</AlertDescription>
        </Alert>
      )}
    </div>
  );
}