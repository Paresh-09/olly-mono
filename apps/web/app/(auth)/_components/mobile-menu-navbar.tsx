import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@repo/ui/components/ui/button";
import { Chrome, LogOut, Coins, Users, Book, ChevronRight, Sparkles, Wrench, MessageSquareDashed, MessageSquare } from 'lucide-react';
import { Separator } from '@repo/ui/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";

interface MobileMenuProps {
  user?: {
    username: string;
    userInitial: string;
    level?: number;
    credits?: number;
    picture?: string;
  } | null;
  onLogout: () => void;
  onAddToChrome: () => void;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ user, onLogout, onAddToChrome, onClose }) => {
  // Helper function to create a link that closes the navbar when clicked
  const NavLink = ({ 
    href, 
    children, 
    icon, 
    target = "_self",
    badge
  }: { 
    href: string; 
    children: React.ReactNode; 
    icon?: React.ReactNode;
    target?: string;
    badge?: React.ReactNode;
  }) => (
    <Link 
      href={href} 
      className="text-gray-600 hover:text-gray-900 flex items-center py-2.5 px-2 rounded-md font-medium transition-colors duration-200" 
      onClick={onClose}
      target={target}
    >
      {icon && <span className="mr-3">{icon}</span>}
      <span className="flex items-center">
        {children}
        {badge && <span className="ml-2">{badge}</span>}
      </span>
    </Link>
  );

  return (
    <div className="flex flex-col h-full">
      {user ? (
        <div className="flex flex-col flex-grow">
          <div className="flex items-center mb-4 pb-4 border-b">
            <div className="relative mr-3">
              {user?.picture ? (
                <Image
                  src={user.picture}
                  alt={user.username}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {user.userInitial}
                </div>
              )}
              {user.level && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px]">
                  {user.level}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-base font-medium">{user.username}</span>
              {user.credits !== undefined && (
                <div className="flex items-center text-sm text-gray-600">
                  <Coins className="h-3.5 w-3.5 text-yellow-500 mr-1" />
                  <span>{user.credits} credits</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-grow overflow-y-auto py-1">
            <NavLink 
              href="/dashboard" 
              icon={<Sparkles className="h-4 w-4" />}
            >
              Dashboard
            </NavLink>
            
            <Accordion type="single" collapsible className="w-full border-none">
              <AccordionItem value="tools" className="border-none">
                <AccordionTrigger className="py-2.5 px-2 text-gray-600 hover:text-gray-900 font-medium">
                  <div className="flex items-center">
                    <Wrench className="h-4 w-4 mr-3" />
                    <span>Tools</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-9">
                  <NavLink href="/dashboard/tools">All Tools</NavLink>
                  <NavLink href="/dashboard/auto-commenter">Auto-Commenter</NavLink>
                  <NavLink href="/prompts">Prompts</NavLink>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="manage-team" className="border-none">
                <AccordionTrigger className="py-2.5 px-2 text-gray-600 hover:text-gray-900 font-medium">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-3" />
                    <span>Manage Team</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-9">
                  <NavLink href="/dashboard/licenses">Assign Licenses & Goals</NavLink>
                  <NavLink href="/dashboard/analytics">Team Analytics</NavLink>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="resources" className="border-none">
                <AccordionTrigger className="py-2.5 px-2 text-gray-600 hover:text-gray-900 font-medium">
                  <div className="flex items-center">
                    <Book className="h-4 w-4 mr-3" />
                    <span>Resources</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-9">
                  <NavLink href="/guides">Platform Guides</NavLink>
                  <NavLink href="/onboarding?step=1">Setup Guide</NavLink>
                  <NavLink href="https://docs.olly.social" target="_blank">Documentation</NavLink>
                  <NavLink href="https://www.udemy.com/course/genai-social-media-growth-chatgpt-olly-social-ai/?referralCode=91445C57DEE10C372D7C" target="_blank">Training Course</NavLink>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <NavLink href="/plans">Plans</NavLink>
            <NavLink href="/dashboard/profile">Profile</NavLink>
            <NavLink href="/prompts">Prompts</NavLink>
          </div>
          
          <div className="mt-auto pt-4 space-y-3">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center"
              onClick={() => {
                onAddToChrome();
                onClose();
              }}
            >
              <Chrome className="h-4 w-4 mr-2" />
              Add Olly to Chrome
            </Button>
            <Button
              variant="ghost"
              className="w-full flex items-center justify-center"
              onClick={() => {
                onLogout();
                onClose();
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex-grow py-4">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/#features">Features</NavLink>
            <NavLink href="/#pricing">Pricing</NavLink>
          </div>
          
          <div className="mt-auto space-y-3">
            <Link href="/login" className="w-full" onClick={onClose}>
              <Button variant="ghost" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link href="/signup" className="w-full" onClick={onClose}>
              <Button variant="default" className="w-full">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;