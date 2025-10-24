"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Pen, UserPlus, Users, Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@repo/ui/components/ui/dialog";
import { listOrganizations } from "@/lib/actions/org-actions";
import UpdateOrganizationForm from "./org-form-update";
import InviteUserForm from "./org-invite";
import { useToast } from "@repo/ui/hooks/use-toast";

interface Organization {
  id: string;
  name: string;
}

interface OrganizationUser {
  organization: Organization;
  role: string;
}

interface ActionResult {
  error?: string;
  success?: OrganizationUser[];
}

export default function OrganizationList() {
  const [organizations, setOrganizations] = useState<OrganizationUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const abortController = new AbortController();
    const fetchTimeout = setTimeout(() => abortController.abort(), 13000);

    async function fetchOrganizations() {
      try {
        setIsLoading(true);

        const result = await listOrganizations();

        if (!abortController.signal.aborted) {
          if ("error" in result && result.error) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Something went wrong",
            });
          } else if ("success" in result && result.success) {
            setOrganizations(result.success);
          }
        }
      } catch (err: any) {
        if (!abortController.signal.aborted) {
          toast({
            variant: "destructive",
            title: "Error",
            description: err.message || "Failed to fetch organizations",
          });
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchOrganizations();

    return () => {
      clearTimeout(fetchTimeout);
      abortController.abort();
    };
  }, [toast]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <Card
            key={item}
            className="bg-white/80 backdrop-blur-sm hover:bg-white transition-colors duration-200"
          >
            <CardContent className="p-6">
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 w-full">
                    <div className="h-6 bg-gray-200 rounded-md w-3/4 animate-pulse" />
                    <div className="h-5 bg-blue-100 rounded-full w-20 animate-pulse" />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <div className="h-9 w-24 bg-gray-200 rounded-md animate-pulse" />
                  <div className="h-9 w-20 bg-gray-200 rounded-md animate-pulse" />
                  <div className="h-9 w-20 bg-gray-200 rounded-md animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {organizations.length === 0 ? (
        <Card className="bg-white/50 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Organizations Yet
            </h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Create your first organization to start managing your teams and
              projects.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {organizations.map((orgUser) => (
            <Card
              key={orgUser.organization.id}
              className="bg-white/80 backdrop-blur-sm hover:bg-white transition-colors duration-200"
            >
              <CardContent className="p-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {orgUser.organization.name}
                      </h3>
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {orgUser.role}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/orgs/${orgUser.organization.id}`}
                      className="inline-flex items-center justify-center"
                    >
                      <Button variant="default" size="sm" className="gap-2">
                        <Users className="h-4 w-4" />
                        Manage
                      </Button>
                    </Link>
                    {["OWNER", "ADMIN"].includes(orgUser.role) && (
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                            >
                              <Pen className="h-4 w-4" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <UpdateOrganizationForm
                              organizationId={orgUser.organization.id}
                              currentName={orgUser.organization.name}
                            />
                          </DialogContent>
                        </Dialog>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                            >
                              <UserPlus className="h-4 w-4" />
                              Invite
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <InviteUserForm
                              organizationId={orgUser.organization.id}
                            />
                          </DialogContent>
                        </Dialog>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
