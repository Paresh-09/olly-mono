import React from 'react';
import { CheckIcon, XIcon, InfoIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@repo/ui/components/ui/tooltip";

const DetailedPlanComparisonTable = () => {
  const features = [
    {
      name: "AI Comments",
      free: "5/day",
      monthly: "Unlimited",
      lifetime: "Unlimited",
      description: "AI-generated comments for social media posts"
    },
    {
      name: "Supported Platforms",
      free: "All Major Social Media",
      monthly: "All Social Media + Custom Integrations",
      lifetime: "All Social Media + Custom Integrations",
      description: "Platforms where the tool can be used"
    },
    {
      name: "AI Models",
      free: "Basic GPT",
      monthly: "OpenAI, Claude, Gemini, Straico, OpenRouter",
      lifetime: "OpenAI, Claude, Gemini, Straico, OpenRouter, Local Models (via Ollama)",
      description: "Available AI models for generating content"
    },
    {
      name: "AI Personalities",
      free: false,
      monthly: true,
      lifetime: true,
      description: "Customizable AI personalities for different tones and styles"
    },
    {
      name: "Custom Actions",
      free: false,
      monthly: "Limited",
      lifetime: "Unlimited",
      description: "Ability to create custom workflows and automations"
    },
    {
      name: "Gamification & Leaderboard",
      free: false,
      monthly: true,
      lifetime: true,
      description: "Engagement features to encourage consistent use"
    },
    {
      name: "Customization Options",
      free: "Basic",
      monthly: "Advanced",
      lifetime: "Full Suite",
      description: "Ability to customize the tool's appearance and functionality"
    },
    {
      name: "Support",
      free: "Community",
      monthly: "Priority Email",
      lifetime: "Priority Email + Direct Founder Access",
      description: "Level of customer support provided"
    },
    {
      name: "API Access",
      free: false,
      monthly: false,
      lifetime: false,
      description: "Ability to integrate the tool with other systems via API"
    },
    {
      name: "Analytics",
      free: false,
      monthly: "Advanced",
      lifetime: "Advanced",
      description: "Insights and data on your social media performance"
    },
    {
      name: "Team Collaboration",
      free: false,
      monthly: "Up to 20 team members",
      lifetime: "Up to 20 team members",
      description: "Ability to work with team members within the tool"
    },
    // { 
    //   name: "Content Calendar", 
    //   free: "7-day view", 
    //   monthly: "30-day view", 
    //   lifetime: "90-day view + Content Planner",
    //   description: "Tool for planning and scheduling social media content"
    // },
    // { 
    //   name: "Auto-Scheduling", 
    //   free: false, 
    //   monthly: true, 
    //   lifetime: true,
    //   description: "AI-powered optimal post scheduling"
    // },
    // { 
    //   name: "Sentiment Analysis", 
    //   free: false, 
    //   monthly: "Basic", 
    //   lifetime: "Advanced",
    //   description: "AI-powered analysis of audience sentiment in comments and messages"
    // },
    // { 
    //   name: "Competitive Analysis", 
    //   free: false, 
    //   monthly: "Limited", 
    //   lifetime: "Comprehensive",
    //   description: "Tools to analyze and compare performance with competitors"
    // }
  ];

  const renderCell = (value: any) => {
    if (typeof value === 'boolean') {
      return value ? (
        <CheckIcon className="h-5 w-5 text-green-600" />
      ) : (
        <XIcon className="h-5 w-5 text-red-600" />
      );
    }
    return value;
  };

  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold text-center mb-6">Plan Comparison</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4">Feature</TableHead>
              <TableHead>Free Plan</TableHead>
              {/* <TableHead>Monthly Plan</TableHead> */}
              <TableHead>Lifetime Plan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.map((feature, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center">
                        {feature.name}
                        <InfoIcon className="h-4 w-4 ml-1 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{feature.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>{renderCell(feature.free)}</TableCell>
                {/* <TableCell>{renderCell(feature.monthly)}</TableCell> */}
                <TableCell>{renderCell(feature.lifetime)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DetailedPlanComparisonTable;