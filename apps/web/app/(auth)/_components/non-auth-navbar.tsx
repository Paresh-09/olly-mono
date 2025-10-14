'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@repo/ui/components/ui/button";

const PublicNavbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <Image src="/icon.png" alt="Olly Logo" width={32} height={32} />
            </Link>
          </div>
          
          {/* Middle: Navigation Links */}
          <div className="flex justify-center flex-grow">
            <div className="flex space-x-8">
              <Link 
                href="/" 
                className="text-gray-500 hover:bg-gray-100 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link>
              <Link 
                href="/#features" 
                className="text-gray-500 hover:bg-gray-100 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Features
              </Link>
              <Link 
                href="/#pricing" 
                className="text-gray-500 hover:bg-gray-100 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Pricing
              </Link>
            </div>
          </div>
          
          {/* Right: Sign In and Sign Up Buttons */}
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="default" size="sm">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;