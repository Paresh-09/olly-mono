
"use client";
import { useActionState } from "react";

import { createOrganization } from "@/lib/actions/org-actions";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Plus, Building2 } from "lucide-react";

export default function CreateOrganizationForm() {
  const [state, formAction] = useActionState(createOrganization, null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2 shadow-sm">
          <Plus className="h-5 w-5" />
          New Organization
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Building2 className="h-6 w-6" />
            Create New Organization
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="org-name"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Organization Name
              </label>
              <Input
                id="org-name"
                type="text"
                name="name"
                placeholder="Enter organization name"
                className="w-full"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Create Organization
            </Button>
          </form>
          {state?.error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          {state?.success && (
            <Alert className="mt-4 bg-green-50 text-green-800 border-green-200">
              <AlertDescription>
                Organization created successfully!
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

