
import { Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { cookies } from "next/headers";
import { cache } from "react";
import prismadb from "./prismadb";

import type { Session, User } from "lucia";
//test

const adapter = new PrismaAdapter(prismadb.session, prismadb.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
      email: attributes.email,
      username: attributes.username,
      isAdmin: attributes.isAdmin,
      isSuperAdmin: attributes.isSuperAdmin,
      isBetaTester: attributes.isBetaTester,
      isSupport: attributes.isSupport,
      isSales: attributes.isSales,
      onboardingComplete: attributes.onboardingComplete,
      thumbnailCredits: attributes.thumbnailCredits,
      isEmailVerified: attributes.isEmailVerified,
      picture: attributes.picture,
    };
  },
});

export const validateRequest = cache(
  async (): Promise<
    { user: ExtendedUser; session: Session } | { user: null; session: null }
  > => {
    const sessionId = (await cookies()).get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }

    const result = await lucia.validateSession(sessionId);
    try {
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        (await cookies()).set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        (await cookies()).set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }
    } catch {}

    if (result.user) {
      const extendedUser = await getExtendedUserDetails(result.user.id);
      return { ...result, user: extendedUser };
    }

    return result;
  },
);

async function getExtendedUserDetails(userId: string): Promise<ExtendedUser> {
  const user = await prismadb.user.findUnique({
    where: { id: userId },
    include: {
      organizations: {
        include: {
          organization: true,
        },
      },
    },
  });

  if (!user) throw new Error("User not found");

  return {
    id: user.id,
    email: user.email || "",
    username: user.username || "",
    isAdmin: user.isAdmin || false,
    isSuperAdmin: user.isSuperAdmin || false,
    isBetaTester: user.isBetaTester || false,
    createdAt: user.createdAt || new Date(),
    isSupport: user.isSupport || false,
    isSales: user.isSales || false,
    onboardingComplete: user.onboardingComplete || false,
    thumbnailCredits: user.thumbnailCredits || 0,
    isEmailVerified: user.isEmailVerified || false,
    picture: user.picture || "",
    organizations: user.organizations.map((org) => ({
      id: org.organization.id,
      name: org.organization.name,
      role: org.role,
      type: org.organization.isPremium ? "premium" : "standard",
    })),
  };
}

export interface ExtendedUser extends Omit<User, "email" | "username"> {
  email: string;
  username: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isBetaTester: boolean;
  isSupport: boolean;
  isSales: boolean;
  createdAt: Date;
  onboardingComplete: boolean;
  thumbnailCredits: number;
  isEmailVerified: boolean;
  picture: string;
  organizations: {
    id: string;
    name: string;
    role: string;
    type: "premium" | "standard";
  }[];
}

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      id: string;
      email: string | null;
      username: string | null;
      isBetaTester: boolean;
      isSuperAdmin: boolean;
      isAdmin: boolean;
      isSupport: boolean;
      isSales: boolean;
      onboardingComplete: boolean;
      thumbnailCredits: number | null;
      isEmailVerified: boolean;
      picture: string;
    };
  }
}

export type Auth = typeof lucia;
