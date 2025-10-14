"use client"

import React from 'react';
import { Button } from "@repo/ui/components/ui/button";

const CustomPricingTable = () => {
  return (
    <div className="py-16 border-t">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Custom Pricing for Larger Teams
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            For teams of 20+ members, we offer tailored solutions to meet your specific needs.
          </p>
        </div>

        <div className="mt-10">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Enterprise-Grade Features
            </h3>
            <ul className="space-y-2 text-gray-600 mb-6">
              <li>• Dedicated account manager</li>
              <li>• Custom AI model fine-tuning</li>
              <li>• Advanced analytics and reporting</li>
              <li>• Priority support with 24/7 availability</li>
              <li>• Custom integrations and API access</li>
              <li>• Personalized onboarding and training</li>
            </ul>
            <Button
              onClick={() => window.location.href = 'mailto:support@explainx.ai'}
              className="w-full"
            >
              Contact Us for Custom Pricing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomPricingTable;