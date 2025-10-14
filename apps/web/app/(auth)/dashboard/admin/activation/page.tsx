import React from 'react';
import { validateRequest } from "@/lib/auth";
import { redirect } from 'next/navigation';
import LicenseActivationsTable from '../../_components/admin-activation-table';

export default async function LicenseActivationsPage() {
  const { user } = await validateRequest();

  if (!user || !user.isAdmin) {
    redirect('/');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">License Activations</h1>
      <LicenseActivationsTable />
    </div>
  );
}