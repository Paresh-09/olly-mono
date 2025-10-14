import React from 'react';
import { CheckIcon, MinusIcon, HelpCircleIcon, ZapIcon, StarIcon, ShieldIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/ui/table";
import { Badge } from "@repo/ui/components/ui/badge";
import { Card } from "@repo/ui/components/ui/card";

interface SavingsPeriod {
  monthly: number;
  lifetime: number;
}

interface SavingsData {
  [key: string]: SavingsPeriod;
}

interface BaseFeature {
  name: string;
  description?: string;
}

interface NumericFeature extends BaseFeature {
  free: string;
  lifetime: string;
  monthly: string;
  models?: never;
}

interface BooleanFeature extends BaseFeature {
  free: boolean;
  lifetime: boolean;
  monthly: boolean;
  models?: string[];
}

type Feature = NumericFeature | BooleanFeature;

interface FeatureSection {
  section: string;
  icon: React.ReactNode;
  description?: string;
  items: Feature[];
}

// Savings Calculator Component
const SavingsComparison = () => {
  const savings: SavingsData = {
    "6 months": { monthly: 59.94, lifetime: 49.99 },
    "1 year": { monthly: 119.88, lifetime: 49.99 },
    "2 years": { monthly: 239.76, lifetime: 49.99 }
  };

  return (
    <Card className="p-6 mt-8 border-2 border-blue-100">
      <div className="flex items-center gap-2 mb-4">
        <ZapIcon className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Save More with Lifetime Access</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-base">Time Period</TableHead>
            <TableHead className="text-base">Monthly Plan Cost</TableHead>
            <TableHead className="text-base">Lifetime Plan Cost</TableHead>
            <TableHead className="text-base">Your Savings</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(savings).map(([period, costs]) => (
            <TableRow key={period}>
              <TableCell className="font-medium">{period}</TableCell>
              <TableCell>${costs.monthly}</TableCell>
              <TableCell>${costs.lifetime}</TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md">
                  <span className="font-semibold">${(costs.monthly - costs.lifetime).toFixed(2)}</span>
                  saved
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="text-sm text-muted-foreground mt-4 text-center">
        Based on single user pricing. Team plans may vary.
      </p>
    </Card>
  );
};

// Main Pricing Table Component
const PricingComparisonTable = () => {
  const features: FeatureSection[] = [
    { 
      section: "Usage Limits",
      icon: <ZapIcon className="h-5 w-5" />,
      items: [
        { 
          name: "AI Comments / Day", 
          free: "5", 
          lifetime: "Unlimited", 
          monthly: "Unlimited",
          description: "Number of AI-generated comments you can create daily"
        },
        { 
          name: "LLM Credits", 
          free: "5", 
          lifetime: "100-2000", 
          monthly: "15-300/mo",
          description: "Credits for using advanced language models"
        },
        { 
          name: "Price per 10 Credits", 
          free: "-", 
          lifetime: "$0.25", 
          monthly: "$0.25"
        },
        { 
          name: "Users", 
          free: "1", 
          lifetime: "1-20", 
          monthly: "1-20",
          description: "Number of team members who can access the platform"
        }
      ]
    },
    {
      section: "Core Features",
      icon: <StarIcon className="h-5 w-5" />,
      items: [
        { 
          name: "Priority Support", 
          free: false, 
          lifetime: true, 
          monthly: true,
          description: "Get faster responses from our dedicated support team"
        },
        { 
          name: "Bring Your Own API Key", 
          free: false, 
          lifetime: true, 
          monthly: true, 
          models: [
            "OpenAI (GPT-3.5, GPT-4)",
            "Claude (Claude 3)",
            "Gemini",
            "Ollama (Local)",
            "Straico",
            "Groq",
            "OpenRouter"
          ]
        },
        { 
          name: "Model Selection", 
          free: false, 
          lifetime: true, 
          monthly: true,
          description: "Choose from various AI models for different use cases"
        },
        { 
          name: "Custom Voice/Tone", 
          free: false, 
          lifetime: true, 
          monthly: true 
        },
        { 
          name: "Multi-language Support", 
          free: false, 
          lifetime: true, 
          monthly: true 
        }
      ]
    },
    {
      section: "Premium Features",
      icon: <ShieldIcon className="h-5 w-5" />,
      items: [
        { 
          name: "AI Personalities", 
          free: false, 
          lifetime: true, 
          monthly: true,
          description: "Create and save custom AI personalities"
        },
        { 
          name: "Custom Actions", 
          free: false, 
          lifetime: true, 
          monthly: true,
          description: "Automate repetitive tasks with custom workflows"
        },
        { 
          name: "Virality Score", 
          free: false, 
          lifetime: true, 
          monthly: true,
          description: "Predict content performance before posting"
        },
        { 
          name: "One-click Comments", 
          free: false, 
          lifetime: true, 
          monthly: true,
          description: "Generate engaging comments with a single click"
        }
      ]
    }
  ];

  return (
    <div>
      <Table className="border rounded-lg overflow-hidden">
        <TableHeader className="bg-gray-50">
          <TableRow className="hover:bg-transparent border-b-2">
            <TableHead className="w-[300px]">Features</TableHead>
            <TableHead>
              <div className="font-medium mb-1">Free</div>
              <div className="text-xl font-bold mb-1">$0</div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2 font-medium mb-1">
                Lifetime
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">Popular</Badge>
              </div>
              <div className="text-xl font-bold mb-1">$49.99</div>
            </TableHead>
            <TableHead>
              <div className="font-medium mb-1">Monthly</div>
              <div className="text-xl font-bold mb-1">$9.99</div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {features.map((section) => (
            <React.Fragment key={section.section}>
              <TableRow className="bg-gray-50">
                <TableCell colSpan={4} className="py-2">
                  <div className="flex items-center gap-2 font-medium">
                    {section.icon}
                    {section.section}
                  </div>
                </TableCell>
              </TableRow>
              {section.items.map((feature, index) => {
                const showTooltip = Boolean(feature.description || (typeof feature.models !== 'undefined'));
                return (
                  <TableRow key={`${section.section}-${index}`} className="hover:bg-gray-50">
                    <TableCell className="py-3">
                      <div className="flex items-start gap-1">
                        <span>{feature.name}</span>
                        {showTooltip && (
                          <HelpCircleIcon className="h-4 w-4 text-gray-400 inline-block cursor-help" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {typeof feature.free === 'boolean' ? 
                        (feature.free ? 
                          <CheckIcon className="h-5 w-5 text-green-500" /> : 
                          <MinusIcon className="h-5 w-5 text-gray-300" />) : 
                        feature.free}
                    </TableCell>
                    <TableCell>
                      {typeof feature.lifetime === 'boolean' ? 
                        (feature.lifetime ? 
                          <CheckIcon className="h-5 w-5 text-green-500" /> : 
                          <MinusIcon className="h-5 w-5 text-gray-300" />) : 
                        feature.lifetime}
                    </TableCell>
                    <TableCell>
                      {typeof feature.monthly === 'boolean' ? 
                        (feature.monthly ? 
                          <CheckIcon className="h-5 w-5 text-green-500" /> : 
                          <MinusIcon className="h-5 w-5 text-gray-300" />) : 
                        feature.monthly}
                    </TableCell>
                  </TableRow>
                );
              })}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
      
      <div className="mt-6 p-5 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex items-center gap-2 mb-3">
          <ZapIcon className="h-5 w-5 text-blue-600" />
          <h3 className="font-medium">Lifetime vs Monthly</h3>
        </div>
        <p className="text-sm text-gray-600">
          Lifetime access pays for itself in just 5 months. Save $69.89 in the first year alone.
        </p>
      </div>
    </div>
  );
};

export default PricingComparisonTable;