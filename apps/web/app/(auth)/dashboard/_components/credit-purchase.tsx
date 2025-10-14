"use client"

import React, { useState, useEffect } from 'react';
import { Slider } from "@repo/ui/components/ui/slider";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import axios from 'axios';
import { calculateCreditPrice } from '@/lib/utils';

const CreditPurchaseComponent = () => {
  const [credits, setCredits] = useState(500);
  const [price, setPrice] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setPrice(calculateCreditPrice(credits));
  }, [credits]);

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/checkout/credits', {
        customPrice: Math.round(price * 100),
        productOptions: {
          name: `${credits} Credits`,
          description: `Purchase ${credits} credits for your account`,
        },
        checkoutData: {
          custom: {
            credits: credits,
          },
        },
      });

      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative rounded-2xl sm:rounded-3xl border border-gray-200 bg-white/50 backdrop-blur-sm hover:border-gray-300 hover:shadow-lg transition-all duration-300">
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Credit Selection */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Select Credits Amount
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={credits}
                    onChange={(e) =>
                      setCredits(
                        Math.max(10, parseInt(e.target.value) || 10),
                      )
                    }
                    min="10"
                    className="h-12 text-lg font-medium border-2 border-gray-200 focus:border-[#0C9488] focus:ring-[#0C9488]/20 rounded-xl"
                    placeholder="Enter credit amount"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    credits
                  </span>
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <Slider
                    value={[credits]}
                    onValueChange={(value) => setCredits(value[0])}
                    min={10}
                    max={10000}
                    step={10}
                    className="my-6"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span>10</span>
                  <span>2,500</span>
                  <span>5,000</span>
                  <span>7,500</span>
                  <span>10,000+</span>
                </div>
              </div>

              {/* Quick Select Options */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Quick Select
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {[100, 500, 1000, 5000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setCredits(amount)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${credits === amount
                        ? "bg-[#0C9488] text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      {amount.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Purchase Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl sm:rounded-2xl p-6 border border-gray-200/50 h-full flex flex-col">
                <div className="text-center mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Purchase Summary
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Credits:</span>
                      <span className="font-medium">{credits.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rate:</span>
                      <span className="font-medium">${(price / credits).toFixed(4)}/credit</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Total:</span>
                        <span className="text-2xl font-bold text-[#0C9488]">${price}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto">
                  <button
                    onClick={handlePurchase}
                    disabled={isLoading}
                    className="w-full bg-[#0C9488] text-white py-3 sm:py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 hover:bg-[#0a7d73] shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      "Buy Credits"
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center mt-3 leading-relaxed">
                    Secure payment via Lemon Squeezy. Credits are instantly added to your account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditPurchaseComponent;