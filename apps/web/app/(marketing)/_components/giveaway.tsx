'use client'

import React, { useState, useEffect } from 'react';
import { Heart, Share2, Mail, Gift, Clock, UserPlus, Twitter, Linkedin, Facebook, Instagram } from 'lucide-react';
import Link from 'next/link';

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
  actionLink?: string;
  additionalContent?: React.ReactNode;
}

interface RewardProps {
  title: string;
  description: string;
  emoji: string;
}

const ActionButton: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
  >
    {children}
  </a>
);

const GiveawayStep: React.FC<StepProps> = ({ number, title, description, icon, action, actionLink, additionalContent }) => (
  <div className="flex flex-col p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-indigo-300 transition-all duration-300">
    <div className="flex items-center mb-4">
      <div className="w-12 h-12 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full mr-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold">Step {number}: {title}</h3>
    </div>
    <p className="text-gray-600 mb-4">{description}</p>
    {action && actionLink && (
      <ActionButton href={actionLink}>
        {action}
      </ActionButton>
    )}
    {additionalContent}
  </div>
);

const RewardCircle: React.FC<RewardProps> = ({ title, description, emoji }) => (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg border border-indigo-100">
      <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-4xl mb-3">
        {emoji}
      </div>
      <h3 className="text-lg font-semibold text-center text-indigo-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 text-center">{description}</p>
    </div>
  );

const RewardItem: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <li className="mb-4 flex items-start">
    <Gift className="mr-2 text-indigo-600 flex-shrink-0" size={20} />
    <div>
      <span className="font-semibold">{title}:</span> {description}
    </div>
  </li>
);

const GiveawaySteps: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const endDate = new Date('2024-09-30T23:59:59');
      const difference = endDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft('Giveaway Ended');
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const shareContent = "Check out Olly 2.0, the AI-powered content creation tool that's changing the game! I'm participating in their giveaway for a chance to win a free lifetime license. Join me and boost your content strategy! #Olly2 #ContentCreation";
  const shareUrl = "https://www.olly.social";

  const socialShareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareContent)}&url=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
  };

  const steps = [
    {
      title: "Sign Up",
      description: "Create your account on our platform to participate in the giveaway.",
      icon: <UserPlus size={24} />,
      action: "Sign up now",
      actionLink: "/signup"
    },
    {
      title: "Support Us",
      description: "Head over to Product Hunt and show your support for Olly. Your upvote matters!",
      icon: <Heart size={24} />,
      action: "Support on Product Hunt",
      actionLink: "https://www.producthunt.com/posts/olly-2-0?utm_source=olly_giveaway&utm_medium=website&utm_campaign=giveaway"
    },
    {
      title: "Share",
      description: "Spread the word about Olly on your favorite social media platforms. The more you share, the bigger your impact!",
      icon: <Share2 size={24} />,
      additionalContent: (
        <div className="flex space-x-2 mt-4">
          <ActionButton href={socialShareLinks.twitter}>
            <Twitter size={18} className="mr-2" /> Twitter
          </ActionButton>
          <ActionButton href={socialShareLinks.linkedin}>
            <Linkedin size={18} className="mr-2" /> LinkedIn
          </ActionButton>
          <ActionButton href={socialShareLinks.facebook}>
            <Facebook size={18} className="mr-2" /> Facebook
          </ActionButton>
          <ActionButton href={`https://www.instagram.com/`}>
            <Instagram size={18} className="mr-2" /> Instagram
          </ActionButton>
        </div>
      )
    },
    {
      title: "Send Proof",
      description: "Email screenshots of your support and shares to support@explainx.ai. This helps us track your participation.",
      icon: <Mail size={24} />,
      action: "Send Email",
      actionLink: `mailto:support@explainx.ai?subject=${encodeURIComponent("Olly 2.0 Giveaway Participation")}&body=${encodeURIComponent("Dear Olly Team,\n\nI've completed the steps for the Olly 2.0 giveaway. Please find attached screenshots of my support and shares.\n\nBest regards,\n[Your Name]")}`
    }
  ];

  const rewards = [
    { title: "Lifetime Access", description: "Get our $49 access for Free.", emoji: "🔑" },
    { title: "Premium Features", description: "Unlock all pro tools", emoji: "⭐" },
    { title: "VIP Community", description: "Join our community of customers", emoji: "👥" },
    { title: "Growth Resources", description: "$100+ worth resources to boost your online presence", emoji: "📈" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">Win a Free Lifetime License to Olly! 🎉</h1>
      <p className="text-xl text-center mb-12 text-gray-600">Complete 4 simple steps and be one of 30 lucky winners to unlock these amazing rewards!</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {rewards.map((reward, index) => (
          <RewardCircle key={index} {...reward} />
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {steps.map((step, index) => (
          <GiveawayStep 
            key={index}
            number={index + 1}
            title={step.title}
            description={step.description}
            icon={step.icon}
            action={step.action}
            actionLink={step.actionLink}
            additionalContent={step.additionalContent}
          />
        ))}
      </div>

      <div className="bg-gray-50 p-8 rounded-lg shadow-sm border border-gray-200 mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Your Exclusive Rewards</h2>
        <ul className="space-y-4 text-gray-700">
          <RewardItem title="Lifetime Access to Olly" description="Enjoy unlimited use of our powerful platform, valued at $49/month, for life." />
          <RewardItem title="Premium Features Package" description="Get early access to all new pro tools and features as they're released." />
          <RewardItem title="VIP Community Access" description="Join our exclusive community of power users, industry experts, and successful content creators." />
          <RewardItem title="Content Creator's Growth Kit" description="Receive our comprehensive guide and tools to skyrocket your online presence and monetize your content." />
        </ul>
      </div>

      <div className="bg-indigo-600 text-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-semibold mb-4 flex items-center justify-center">
          <Clock className="mr-2" size={24} /> Giveaway Countdown
        </h2>
        <p className="text-4xl font-bold mb-4">{timeLeft}</p>
        <p className="text-lg mb-4">Don&apos;t miss out! Giveaway runs from September 26th to September 30th, 2024</p>
        <p className="text-sm bg-indigo-700 p-3 rounded-lg">
          Important: Licenses will be distributed on October 10th, 2024. Only users who complete all 4 steps will be eligible. 30 lucky winners will be selected.
        </p>
      </div>
    </div>
  );
};

export default GiveawaySteps;