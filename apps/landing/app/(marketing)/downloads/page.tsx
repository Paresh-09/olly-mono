"use client";

import {
  Download,
  Apple,
  Monitor,
  PlayCircle,
  ThumbsUp,
  MessageCircle,
  Search,
  Shield,
  ArrowRight,
  CreditCard,
  CheckCircle,
  Settings,
  AlertCircle,
  Chrome,
  ExternalLink,
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VideoModal = ({ isOpen, onClose }: VideoModalProps) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-black p-1 text-left align-middle shadow-xl transition-all">
                <iframe
                  className="aspect-video w-full"
                  src="https://www.youtube.com/embed/HzIC8kpePwU?autoplay=1"
                  title="Olly Desktop App Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default function DownloadsPage() {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  
  const openVideoModal = () => setVideoModalOpen(true);
  const closeVideoModal = () => setVideoModalOpen(false);
  
  return (
    <div className="container mx-auto px-4">
      {/* Enhanced Heading */}
      <div className="relative isolate pt-10 pb-12">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="mb-6 animate-fade-in-up">
            <div className="inline-flex items-center px-4 py-2 bg-teal-50 dark:bg-teal-900/30 rounded-full text-sm font-medium text-teal-700 dark:text-teal-300">
              <CheckCircle className="h-4 w-4 mr-2" /> Updated March 2025
            </div>
          </div>

          {/* Hero Text */}
          <div className="animate-fade-in-up delay-100">
            <h1 className="font-cal text-4xl sm:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white mb-4">
              Download Olly Desktop App
            </h1>
          </div>

          {/* Subtitle */}
          <div className="animate-fade-in-up delay-200">
            <p className="mt-6 text-lg sm:text-xl leading-8 text-gray-600 dark:text-gray-300 relative inline-block">
              <span className="relative">
                Run auto-commenting in the background, even when Chrome windows aren't in focus
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-teal-500/50 to-transparent" />
              </span>
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap justify-center gap-4 animate-fade-in-up delay-300">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white"
            >
              <a href="#download-section">
                <Download className="mr-2 h-5 w-5" />
                Download Desktop App
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard/auto-commenter">
                Configure Auto-Commenter
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Video Demo Section - Full Width */}
      <div className="w-full mx-auto mb-16 animate-fade-in-up delay-400">
        <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl">
          <div className="aspect-video bg-gray-100 dark:bg-gray-800">
            <button 
              onClick={openVideoModal}
              className="relative w-full h-full focus:outline-none"
              aria-label="Play video demo"
            >
              <Image 
                src="/ac/ac-thumb.jpg" 
                alt="Olly Desktop App Demo" 
                width={1920} 
                height={1080} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center transition-colors group">
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors"></div>
                <div className="h-24 w-24 rounded-full bg-black/40 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                  <PlayCircle className="h-20 w-20 text-white" />
                </div>
                <div className="absolute bottom-6 left-6 bg-black/60 px-4 py-2 rounded-lg">
                  <p className="text-white font-medium">Watch Demo: How to Use the Olly Desktop App</p>
                </div>
              </div>
            </button>
          </div>
        </div>
        
        {/* Video Modal */}
        <VideoModal isOpen={videoModalOpen} onClose={closeVideoModal} />
      </div>

      {/* Problem & Solution Explanation */}
      <div className="max-w-3xl mx-auto mb-16 animate-fade-in-up delay-500">
        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold mb-4">Why You Need the Desktop App</h2>
          
          <div className="mb-6">
            <div className="flex items-start space-x-4 mb-4">
              <AlertCircle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">The Chrome Focus Problem</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  When a Chrome window is out of focus or in the background, Chrome significantly reduces 
                  its activity to save energy. This means auto-commenting and engagement tools stop working 
                  when you switch to another application or tab.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-teal-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">The Olly Desktop App Solution</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our desktop app creates a special Chrome environment that continues running in the 
                  background. This allows the auto-commenter to work even when you're using other applications, 
                  providing continuous engagement without requiring your constant attention.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Note:</span> If you're using the auto-commenter in a window that 
              stays active and in focus, you don't need the desktop app. The desktop app is specifically for 
              users who want to run engagement in the background while working on other tasks.
            </p>
          </div>
        </div>
      </div>

      {/* Download Section */}
      <div id="download-section" className="mb-16 animate-fade-in-up delay-600">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Mac Download Card */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="space-y-1">
              <div className="flex items-center space-x-2">
                <Apple className="h-6 w-6 text-gray-900 dark:text-white" />
                <CardTitle className="text-2xl font-medium">
                  Olly for Mac
                </CardTitle>
              </div>
              <CardDescription>
                Compatible with macOS 12.0 and newer
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Run auto-commenter in the background while using other apps
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Includes dedicated Chrome environment for Olly
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Stable and optimized for Mac performance
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col space-y-3">
              <Button
                asChild
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white"
              >
                <a
                  href="https://github.com/rahulsan008/olly-download/raw/refs/heads/main/output.zip"
                  download
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download for Mac (.zip)
                </a>
              </Button>
            </CardFooter>
          </Card>

          {/* Windows Download Card */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="space-y-1">
              <div className="flex items-center space-x-2">
                <Monitor className="h-6 w-6 text-gray-900 dark:text-white" />
                <CardTitle className="text-2xl font-medium">
                  Olly for Windows
                </CardTitle>
              </div>
              <CardDescription>
                Compatible with Windows 10 and Windows 11
              </CardDescription>
              <div className="mt-2 py-1 px-3 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded-md text-xs inline-flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" /> Beta version - may have limited functionality
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Run auto-commenter in the background while using other apps
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Includes dedicated Chrome environment for Olly
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Currently in beta - improved version coming soon
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col space-y-3">
              <Button
                asChild
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white"
              >
                <a href="https://github.com/rahulsan008/olly-download/raw/refs/heads/main/olly.exe" download>
                  <Download className="mr-2 h-4 w-4" />
                  Download for Windows (.exe)
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Installation Instructions */}
      <div
        id="installation"
        className="max-w-3xl mx-auto mb-16 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-fade-in-up delay-700"
      >
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">
            Installation & Usage Instructions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-base font-medium mb-2 flex items-center">
                <Apple className="h-5 w-5 mr-2" />
                Mac Installation
              </h4>
              <ol className="list-decimal pl-5 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <li>Download the Mac <strong>.zip</strong> file</li>
                <li>Open the downloaded file to extract it</li>
                <li>Locate the <strong>Olly.dmg</strong> file and open it</li>
                <li><strong>Important:</strong> When first running, you may need to approve it in System Preferences → Security & Privacy</li>
                <li>When prompted, click "Yes" to close existing Chrome windows</li>
              </ol>
            </div>

            <div>
              <h4 className="text-base font-medium mb-2 flex items-center">
                <Monitor className="h-5 w-5 mr-2" />
                Windows Installation
              </h4>
              <ol className="list-decimal pl-5 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <li>Download the Windows <strong>.exe</strong> file</li>
                <li>Right-click the file and select "Run as administrator"</li>
                <li>Follow the installation prompts</li>
                <li>When prompted, click "Yes" to close existing Chrome windows</li>
                <li>The app will open a new Chrome window that can run in the background</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* How to Use */}
      <div className="max-w-3xl mx-auto mb-16 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-fade-in-up delay-800">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">
            How to Use the Desktop App for Auto-Commenting
          </h3>
          
          <ol className="space-y-6 mb-6">
            <li className="flex">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 font-semibold mr-3">1</div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Launch the Olly Desktop App</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Open the Olly app from your applications folder (Mac) or Start menu (Windows). It will close any existing Chrome windows and open a new browser window dedicated to Olly.
                </p>
              </div>
            </li>
            
            <li className="flex">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 font-semibold mr-3">2</div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Configure Your Auto-Commenter Settings</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Navigate to <Link href="/dashboard/auto-commenter" className="text-teal-600 dark:text-teal-400 underline hover:no-underline">dashboard/auto-commenter</Link> and set up your preferences. Configure your brand voice, hashtags to target, and which actions to enable.
                </p>
                <Link href="/dashboard/auto-commenter" className="inline-flex items-center mt-2 text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline">
                  <Settings className="h-3 w-3 mr-1" /> Configure settings now
                </Link>
              </div>
            </li>
            
            <li className="flex">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 font-semibold mr-3">3</div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Navigate to LinkedIn</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Go to LinkedIn in the special Chrome window. Select the text or area where you want to run auto-commenter, and activate it using the Olly interface.
                </p>
              </div>
            </li>
            
            <li className="flex">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 font-semibold mr-3">4</div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Background Operation</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Unlike regular Chrome, you can now continue working in other applications while Olly's auto-commenter runs in the background. The desktop app keeps the Chrome session active even when it's not in focus.
                </p>
              </div>
            </li>
          </ol>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 mt-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Pro Tip:</span> For maximum effectiveness, you can move the Olly window to a separate screen or virtual desktop if available. This keeps it completely out of your way while it continues to work.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto mb-16 animate-fade-in-up delay-900">
        <h3 className="text-xl font-semibold mb-4">Frequently Asked Questions</h3>
        
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Will this affect my regular Chrome installation?</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              No, the Olly desktop app creates a separate Chrome environment specifically for auto-commenting. Your regular Chrome installation and all your profiles, extensions, and settings remain untouched.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Do I need credits to use the auto-commenter?</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Yes, auto-commenting features use credits from your Olly account. Each action (comment, like) consumes one credit. Make sure you have sufficient credits in your account before starting.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Why does the app need to close my existing Chrome windows?</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              The desktop app needs to launch a fresh Chrome instance with special parameters to enable background operation. This requires closing existing Chrome windows to avoid conflicts.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center mb-16 animate-fade-in-up delay-1000">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Need help with installation or configuration?{" "}
          <Link
            href="/support"
            className="text-teal-600 dark:text-teal-400 hover:underline"
          >
            Contact our support team
          </Link>
        </p>
      </div>
    </div>
  );
}

/* Add animation styles to your global CSS or tailwind config */
/* 
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}

.delay-100 {
  animation-delay: 0.1s;
}

.delay-200 {
  animation-delay: 0.2s;
}

.delay-300 {
  animation-delay: 0.3s;
}

.delay-400 {
  animation-delay: 0.4s;
}

.delay-500 {
  animation-delay: 0.5s;
}

.delay-600 {
  animation-delay: 0.6s;
}

.delay-700 {
  animation-delay: 0.7s;
}

.delay-800 {
  animation-delay: 0.8s;
}

.delay-900 {
  animation-delay: 0.9s;
}
*/
