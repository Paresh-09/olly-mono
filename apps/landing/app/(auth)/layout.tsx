// AuthLayout.tsx
import React from "react";
import { validateRequest } from "@/lib/auth";
import Navbar from "./_components/auth-navbar";
import prismadb from "@/lib/prismadb";
import { cookies } from "next/headers";
import { OrganizationRole } from "@repo/db";

interface Organization {
  id: string;
  name: string;
  role: OrganizationRole;
  type: "premium" | "standard";
}

interface NavbarUser {
  username: string;
  userInitial: string;
  level: number;
  totalComments: number;
  organizations: Organization[];
  credits: number;
  picture: string;
}

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  let leaderboard;
  let organizations: Organization[] = [];
  let activeOrg: Organization | null = null;
  let userCredits = 0;

  try {
    const result = await validateRequest();
    user = result.user;
    if (user) {
      leaderboard = await prismadb.leaderboard.findUnique({
        where: { userId: user.id },
      });

      const orgUsers = await prismadb.organizationUser.findMany({
        where: { userId: user.id },
        include: {
          organization: true,
        },
      });

      organizations = orgUsers.map((orgUser) => ({
        id: orgUser.organization.id,
        name: orgUser.organization.name,
        role: orgUser.role,
        type: orgUser.organization.isPremium
          ? ("premium" as const)
          : ("standard" as const),
      }));

      // Get active org from cookie or default to first org
      const activeOrgId = (await cookies()).get("activeOrgId")?.value;
      activeOrg =
        organizations.find((org) => org.id === activeOrgId) ||
        organizations[0] ||
        null;

      // Fetch user credits
      const userCredit = await prismadb.userCredit.findUnique({
        where: { userId: user.id },
      });
      userCredits = userCredit?.balance ?? 0;
    }
  } catch (error) {
    console.error("Error in validateRequest:", error);
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar user={null} />
        <main className="flex-grow">{children}</main>
      </div>
    );
  }

  let navbarProps: NavbarUser | null = null;
  let journeyProps = null;

  if (user) {
    try {
      const username =
        typeof user.username === "string" && user.username.trim() !== ""
          ? user.username
          : null;
      const firstName = username ? username.split(" ")[0] : "";
      const initial = firstName ? firstName.charAt(0).toUpperCase() : "";

      navbarProps = {
        username: username || "",
        userInitial: initial,
        level: leaderboard?.level || 1,
        totalComments: leaderboard?.totalComments || 0,
        organizations,
        credits: userCredits,
        picture: user.picture,
      };

      // Prepare user data for journey tracking
      journeyProps = {
        userId: user.id,
        email: user.email,
        name: username || user.email,
        userType: activeOrg?.type || "standard",
        createdAt: user.createdAt,
        level: leaderboard?.level || 1,
        totalComments: leaderboard?.totalComments || 0,
        credits: userCredits,
        organizationCount: organizations.length,
        isPremium: activeOrg?.type === "premium",
        role: activeOrg?.role || "MEMBER",
      };
    } catch (error) {
      console.error("Error processing user data for navbar:", error);
      navbarProps = null;
      journeyProps = null;
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={navbarProps} activeOrg={activeOrg} />
      <main className="flex-grow">{children}</main>
    </div>
  );
}
