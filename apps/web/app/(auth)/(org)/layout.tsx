import React from "react";
import { redirect } from "next/navigation";
import Navbar from "../_components/auth-navbar";
import { validateRequest } from "@/lib/auth";

export default async function OrgLayout({
  children,
}: {
  children: React.ReactNode
}) {  
  const { user } = await validateRequest();
  
  if (!user) {
    redirect("/login");
  }


  return (
    <div>
      <main className="flex-grow">{children}</main>
    </div>
  );
};