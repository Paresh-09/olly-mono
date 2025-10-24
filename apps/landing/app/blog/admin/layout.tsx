import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";

const AdminBlogLayout = async ({ children }: { children: React.ReactNode }) => {
  const { user } = await validateRequest();

  if (!user?.isAdmin) {
    redirect("/blog");
  }

  if (!user?.isSuperAdmin) {
    redirect("/blog");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pt-16 pb-12">{children}</div>
    </div>
  );
};

export default AdminBlogLayout;

