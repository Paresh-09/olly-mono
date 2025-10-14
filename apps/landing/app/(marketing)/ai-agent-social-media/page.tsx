"use client";
import { Button } from "@repo/ui/components/ui/button";
import { ArrowRight, CheckCircle, PlayCircle, ChevronRight, Download, LayoutDashboard, MessageSquare, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
                  title="AI Social Media Agent Demo"
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

const SocialAgentPage = () => {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  
  const openVideoModal = () => setVideoModalOpen(true);
  const closeVideoModal = () => setVideoModalOpen(false);
  
  return (
    <div className="flex flex-col min-h-screen text-gray-900">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-purple-800/10" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="inline-block mb-6 px-4 py-1.5 bg-green-50 border border-green-100 rounded-full text-sm font-medium text-green-700">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                NOW LIVE <span className="text-green-500 ml-2">•</span> <span className="text-green-500 ml-2">Get started today</span>
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-clip-text font-cal text-gray-900">
              AI-Powered LinkedIn Engagement
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-3xl">
              Autonomous agent that automatically builds your network, engages with your audience, and grows your presence while you focus on what matters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard/auto-commenter">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-lg rounded-md flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" /> Configure Auto-Commenter
                </Button>
              </Link>
              <Link href="https://docs.olly.social/docs/features/auto-commenter" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg rounded-md flex items-center">
                  <FileText className="mr-2 h-5 w-5" /> Read the Docs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="py-24 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="mx-auto px-4">
          <div className="flex flex-col items-center mb-16">
            <div className="inline-block mb-3 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-sm font-medium text-blue-700">
              See it in action
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-gray-900">Autonomous AI in Action</h2>
            <p className="text-xl text-gray-600 text-center max-w-2xl mb-8">
              Watch how the agent seamlessly integrates with LinkedIn to engage with your network.
            </p>
          </div>
          <div className="relative max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-gray-200">
            <div className="relative">
              <Image 
                src="/ac/ac-thumb.jpg" 
                alt="AI Auto-Commenter Demo" 
                width={1280} 
                height={720} 
                className="w-full aspect-video object-cover"
              />
              <button 
                onClick={openVideoModal}
                className="absolute inset-0 flex items-center justify-center transition-colors group"
              >
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors"></div>
                <div className="h-20 w-20 rounded-full bg-black/40 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                  <PlayCircle className="h-16 w-16 text-white" />
                </div>
              </button>
            </div>
          </div>
          
          {/* Video Modal */}
          <VideoModal isOpen={videoModalOpen} onClose={closeVideoModal} />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 ">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-16">
            <div className="inline-block mb-3 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-sm font-medium text-blue-700">
              The process
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-gray-900">How It Works</h2>
            <p className="text-xl text-gray-600 text-center max-w-2xl">
              Three simple steps to automate your social media engagement
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300"></div>
              <div className="relative bg-white p-8 rounded-xl border border-gray-200 shadow-md h-full transform group-hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center justify-center h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6 text-white text-xl font-bold">
                  1
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Connect Your Account</h3>
                <p className="text-gray-600">
                  Our browser-based agent works on top of your existing LinkedIn account—no passwords required, completely secure.
                </p>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300"></div>
              <div className="relative bg-white p-8 rounded-xl border border-gray-200 shadow-md h-full transform group-hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center justify-center h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6 text-white text-xl font-bold">
                  2
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Configure Your Agent</h3>
                <p className="text-gray-600">
                  Define your brand voice, target keywords, sample replies, and items to promote in your custom settings.
                </p>
                <Link href="/dashboard/auto-commenter">
                  <p className="text-blue-600 mt-4 hover:underline text-sm">Configure now →</p>
                </Link>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300"></div>
              <div className="relative bg-white p-8 rounded-xl border border-gray-200 shadow-md h-full transform group-hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center justify-center h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6 text-white text-xl font-bold">
                  3
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Let AI Work for You</h3>
                <p className="text-gray-600">
                  The agent automatically finds relevant content, comments, likes, and engages with your target audience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-16">
            <div className="inline-block mb-3 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-sm font-medium text-blue-700">
              Capabilities
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-gray-900">Key Features</h2>
            <p className="text-xl text-gray-600 text-center max-w-2xl">
              Advanced AI technology that transforms your social media strategy
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mb-5">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Autonomous Engagement</h3>
              <p className="text-gray-600">
                Works in a browser tab to automatically comment, like, and engage with your audience on autopilot.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mb-5">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Keyword Targeting</h3>
              <p className="text-gray-600">
                Identifies and engages with content relevant to your specified keywords and interests.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mb-5">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Customized Brand Voice</h3>
              <p className="text-gray-600">
                Connect your brand voice and sample replies for authentic-sounding comments.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mb-5">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Promotional Integration</h3>
              <p className="text-gray-600">
                Subtly promotes your products, services, or content in engagement when appropriate.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mb-5">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Browser-Based Safety</h3>
              <p className="text-gray-600">
                Runs in your browser and doesn't require passwords or sensitive information.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mb-5">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Activity Scheduling</h3>
              <p className="text-gray-600">
                Set schedules for when the agent should be active to maintain a natural presence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Availability */}
      <section className="py-24 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-16">
            <div className="inline-block mb-3 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-sm font-medium text-blue-700">
              Supported platforms
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-gray-900">Platform Availability</h2>
            <p className="text-xl text-gray-600 text-center max-w-2xl">
              Starting with LinkedIn, expanding to more platforms soon
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl"></div>
              <div className="bg-white p-8 rounded-xl border border-blue-200 shadow-md text-center relative transform group-hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute top-0 right-0">
                  <div className="bg-green-600 text-white px-4 py-1 text-sm font-medium">
                    AVAILABLE NOW
                  </div>
                </div>
                <div className="h-20 w-20 mx-auto mb-6 opacity-100">
                  <div className="h-full w-full bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    in
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-2 text-gray-900">LinkedIn</h3>
                <p className="text-green-600 font-medium">Available Now</p>
              </div>
            </div>
            
            <div className="relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl"></div>
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-md text-center relative transform group-hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute top-0 right-0">
                  <div className="bg-gray-700 text-white px-4 py-1 text-sm font-medium">
                    COMING SOON
                  </div>
                </div>
                <div className="h-20 w-20 mx-auto mb-6 opacity-60">
                  <div className="h-full w-full bg-gradient-to-tr from-purple-600 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    IG
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-2 text-gray-900">Instagram</h3>
                <p className="text-gray-600">Coming soon</p>
              </div>
            </div>
            
            <div className="relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-400 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl"></div>
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-md text-center relative transform group-hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute top-0 right-0">
                  <div className="bg-gray-700 text-white px-4 py-1 text-sm font-medium">
                    COMING SOON
                  </div>
                </div>
                <div className="h-20 w-20 mx-auto mb-6 opacity-60">
                  <div className="h-full w-full bg-black rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    X
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-2 text-gray-900">Twitter/X</h3>
                <p className="text-gray-600">Coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-16">
            <div className="inline-block mb-3 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-sm font-medium text-blue-700">
              Questions & Answers
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-gray-900">FAQ</h2>
            <p className="text-xl text-gray-600 text-center max-w-2xl">
              Common questions about our social media agent
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Is it safe to use this agent?</h3>
              <p className="text-gray-600">
                Yes, our agent is completely safe. It runs in your browser and leverages your existing social media sessions without requiring passwords or sensitive information. It operates on top of the platforms, just like you would manually.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">How many credits will I need?</h3>
              <p className="text-gray-600">
                Each agent action (comment, like, follow) uses 1 credit. The number of credits needed depends on your engagement goals. Typical users might use 50-200 credits per week for active engagement.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Can I customize what the agent says?</h3>
              <p className="text-gray-600">
                Absolutely! You can connect your brand voice, provide sample replies, specify items to promote, and set guidelines for engagement in your settings. The agent will use these to generate authentic-sounding comments.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Will platforms detect this as automated?</h3>
              <p className="text-gray-600">
                Our agent is designed to mimic natural human behavior with appropriate timing and varied responses. It follows platform guidelines and best practices to maintain a natural presence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-white to-transparent" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 max-w-3xl mx-auto text-white">Ready to Automate Your LinkedIn Presence?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto text-blue-100">
            Get started today and supercharge your LinkedIn engagement with our AI-powered auto-commenter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard/auto-commenter">
              <Button className="bg-white text-blue-700 hover:bg-blue-50 px-10 py-5 text-lg font-medium rounded-lg">
                <MessageSquare className="mr-2 h-5 w-5" /> Configure Auto-Commenter
              </Button>
            </Link>
            <Link href="https://docs.olly.social/auto-commenter" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-white text-white hover:bg-blue-700 px-10 py-5 text-lg font-medium rounded-lg">
                <FileText className="mr-2 h-5 w-5" /> View Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SocialAgentPage; 