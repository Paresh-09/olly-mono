// app/providers/app-provider.tsx
import { PropsWithChildren } from "react";
import { PostHogProvider } from "./PostHogProvider";
import { SessionProvider } from "./SessionProvider";
import { validateRequest } from "@/lib/auth";

export default async function AppProvider({ children }: PropsWithChildren) {
  const { user, session } = await validateRequest();
  return (
    <SessionProvider
      value={
        session && user ? { session, user } : { session: null, user: null }
      }
    >
      {children}
    </SessionProvider>
  );
}
