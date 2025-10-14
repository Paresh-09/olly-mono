import React from 'react';
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Metadata } from 'next';
import { PricingNew } from '../_components/pricing-new';


export const metadata: Metadata = {
  title: 'Plans & Pricing | Olly.social',
  description: 'Choose the plan that fits your needs',
};

async function PlansPage() {
  const { user } = await validateRequest();

  if (!user) {
    return redirect("/login");
  }

  return (
    <div className="min-h-screen bg-white">
      <PricingNew />
    </div>
  );
}

export default PlansPage;