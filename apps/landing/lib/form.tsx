"use client";
import { useActionState } from "react";

import { SubLicenseGoal } from "@repo/db";

export function Form({
  children,
  action,
}: {
  children: React.ReactNode;
  action: (prevState: any, formData: FormData) => Promise<ActionResult>;
}) {
  const [state, formAction] = useActionState(action, {
    error: null,
  });
  return (
    <form action={formAction}>
      {children}
      <p>{state.error}</p>
    </form>
  );
}

export interface ActionResult {
  error?: string | null;
  success?: string | null | any;
  userId?: string | null;
  licenseKey?: string;
  goal?: SubLicenseGoal;
  extensionAuth?: boolean;
  authCode?: string;
  noLicenseKey?: boolean;
}
