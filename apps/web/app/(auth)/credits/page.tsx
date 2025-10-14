import React from 'react';
import CreditPurchaseComponent from '../dashboard/_components/credit-purchase';
import CreditPurchaseParaExplanation from '../dashboard/_components/credits-explanation';

export default function PurchaseCreditsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-6">Credits</h1>
      <CreditPurchaseComponent />
      <CreditPurchaseParaExplanation />
    </div>
  );
}