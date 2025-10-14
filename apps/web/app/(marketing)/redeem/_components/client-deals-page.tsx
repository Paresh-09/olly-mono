"use client";

import React, { Suspense } from 'react';
import LoadingSpinner from '../../appsumo/_components/appsumo-loader';
import RedemptionFlow from './redemption-flow';

export default function ClientDealsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Redeem Your Olly Code</h1>
      <Suspense fallback={<LoadingSpinner />}>
        <RedemptionFlow />
      </Suspense>
    </div>
  );
}