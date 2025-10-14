"use client"

import { Button } from "@/components/Button";
import FAQDataMain from "./data/faq-data";
import React, { useState } from "react";
import { ChevronDownIcon, Plus, Minus } from "lucide-react";

export default function FAQs() {
  const [showAll, setShowAll] = useState(false);
  const [openItems, setOpenItems] = useState<number[]>([]);

  const initiallyShown = 8;

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const displayedFAQs = showAll ? FAQDataMain : FAQDataMain.slice(0, initiallyShown);

  return (
    <div className="py-20 sm:py-32" id="faq">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Everything you need to know about Olly. Can't find what you're looking for?
            <br />
            <span className="text-teal-600 font-medium hover:text-teal-700 cursor-pointer transition-colors">
              Contact our support team →
            </span>
          </p>
        </div>

        {/* FAQ List - Single Column */}
        <div className="space-y-4">
          {displayedFAQs.map((faq, index) => (
            <div
              key={faq.question}
              className="group border border-gray-200 rounded-2xl hover:border-gray-300 transition-all duration-200 overflow-hidden bg-white/50 backdrop-blur-sm"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-8 py-6 text-left focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:rounded-2xl"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 pr-8 leading-tight group-hover:text-teal-600 transition-colors duration-200">
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-teal-50 flex items-center justify-center transition-all duration-200">
                      {openItems.includes(index) ? (
                        <Minus className="w-4 h-4 text-gray-600 group-hover:text-teal-600 transition-colors duration-200" />
                      ) : (
                        <Plus className="w-4 h-4 text-gray-600 group-hover:text-teal-600 transition-colors duration-200" />
                      )}
                    </div>
                  </div>
                </div>
              </button>

              {/* Animated Answer */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-out ${openItems.includes(index)
                  ? 'max-h-96 opacity-100'
                  : 'max-h-0 opacity-0'
                  }`}
              >
                <div className="px-8 pb-6">
                  <div className="h-px bg-gray-200 mb-6"></div>
                  <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show More/Less Button */}
        {FAQDataMain.length > initiallyShown && (
          <div className="text-center mt-12">
            <button
              onClick={toggleShowAll}
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium text-lg transition-colors duration-200 group"
            >
              {showAll ? "Show Less" : `Show ${FAQDataMain.length - initiallyShown} More Questions`}
              <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${showAll ? 'rotate-180' : ''} group-hover:translate-y-0.5`} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}


