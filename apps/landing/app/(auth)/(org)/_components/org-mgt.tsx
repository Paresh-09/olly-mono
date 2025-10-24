'use client'

import React, { useState, useEffect, useActionState } from 'react';
import { listOrganizations, createOrganization, updateOrganization, inviteUserToOrganization } from '@/lib/actions/org-actions';
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@repo/ui/components/ui/accordion";

interface Organization {
  id: string;
  name: string;
}

interface OrganizationUser {
  organization: Organization;
  role: string;
}

export default function OrganizationManagement() {
  const [organizations, setOrganizations] = useState<OrganizationUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [createState, createAction] = useActionState(createOrganization, null);
  const [updateState, updateAction] = useActionState(updateOrganization, null);
  const [inviteState, inviteAction] = useActionState(inviteUserToOrganization, null);

  useEffect(() => {
    async function fetchOrganizations() {
      const result = await listOrganizations();
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setOrganizations(result.success);
      }
    }
    fetchOrganizations();
  }, [createState, updateState]);

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-md mx-auto mt-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Organization Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create Organization Form */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Create New Organization</h3>
          <form action={createAction} className="flex space-x-2">
            <Input type="text" name="name" placeholder="Organization Name" required className="flex-grow" />
            <Button type="submit">Create</Button>
          </form>
          {createState?.error && <Alert variant="destructive" className="mt-2"><AlertDescription>{createState.error}</AlertDescription></Alert>}
          {createState?.success && <Alert className="mt-2"><AlertDescription>Organization created successfully!</AlertDescription></Alert>}
        </div>

        {/* Organizations List */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Your Organizations</h3>
          {organizations.length === 0 ? (
            <p className="text-gray-500">You are not part of any organizations.</p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {organizations.map((orgUser) => (
                <AccordionItem key={orgUser.organization.id} value={orgUser.organization.id}>
                  <AccordionTrigger className="text-left">
                    <div>
                      <span className="font-semibold">{orgUser.organization.name}</span>
                      <p className="text-sm text-gray-500">Role: {orgUser.role}</p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {['OWNER', 'ADMIN'].includes(orgUser.role) && (
                      <div className="space-y-4 mt-4">
                        {/* Update Organization Form */}
                        <form action={updateAction} className="flex space-x-2">
                          <input type="hidden" name="organizationId" value={orgUser.organization.id} />
                          <Input type="text" name="name" defaultValue={orgUser.organization.name} required className="flex-grow" />
                          <Button type="submit">Update</Button>
                        </form>
                        {updateState?.error && <Alert variant="destructive" className="mt-2"><AlertDescription>{updateState.error}</AlertDescription></Alert>}
                        {updateState?.success && <Alert className="mt-2"><AlertDescription>Organization updated successfully!</AlertDescription></Alert>}

                        {/* Invite User Form */}
                        <form action={inviteAction} className="space-y-2">
                          <input type="hidden" name="organizationId" value={orgUser.organization.id} />
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
                          <Button type="submit" className="w-full">Invite User</Button>
                        </form>
                        {inviteState?.error && <Alert variant="destructive" className="mt-2"><AlertDescription>{inviteState.error}</AlertDescription></Alert>}
                        {inviteState?.success && <Alert className="mt-2"><AlertDescription>{inviteState.success}</AlertDescription></Alert>}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </CardContent>
    </Card>
  );
}