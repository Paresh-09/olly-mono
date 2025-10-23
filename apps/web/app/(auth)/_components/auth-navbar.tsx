"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  LogOut,
  Chrome,
  ChevronDown,
  Coins,
  Book,
  Video,
  Users,
  Wrench,
  MessageSquareDashed,
  MessageSquare,
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@repo/ui/components/ui/sheet";
import { Dialog, DialogContent, DialogTrigger } from "@repo/ui/components/ui/dialog";
import { logout } from "@/lib/actions";
import MobileMenu from "./mobile-menu-navbar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { useRouter } from "next/navigation";
import NotificationBell from "./notification";
import { useNotifications } from "@/hooks/use-notifications";
import { useSession } from "@/providers/SessionProvider";
import { cn } from "@repo/ui/lib/utils";
import { PostHogUser } from "@/app/lib/posthog-utils";

interface Organization {
  id: string;
  name: string;
  role: string;
  type: "premium" | "standard";
}

interface NavbarUser {
  username: string;
  userInitial: string;
  level: number;
  totalComments: number;
  organizations: Organization[];
  credits: number;
  picture: string;
}

interface NavbarProps {
  user?: NavbarUser | null;
  activeOrg?: Organization | null;
  onOrgChange?: (orgId: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, activeOrg, onOrgChange }) => {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const sessionData = useSession();
  const { notifications, markAsRead } = useNotifications();
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isSmallScreen = windowWidth < 1024;
  const isExtraSmallScreen = windowWidth < 640;

  const handleLogout = async () => {
    // Reset PostHog user before server-side logout
    PostHogUser.reset();
    await logout();
  };

  const handleAddToChrome = () => {
    window.open(
      "https://chromewebstore.google.com/detail/olly-ai-assistant-for-soc/ofjpapfmglfjdhmadpegoeifocomaeje?hl=en",
      "_blank",
    );
  };

  const handleBuyCredits = () => {
    router.push("/credits");
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link href={user ? "/dashboard" : "/"} className="flex-shrink-0">
              <Image src="/icon.png" alt="Olly Logo" width={32} height={32} />
            </Link>
            {user && (
              <div className="hidden md:flex ml-2 lg:ml-5 space-x-1 lg:space-x-2">
                <NavLink href="/dashboard">Dashboard</NavLink>
                <NavLink href="/plans">Plans</NavLink>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={cn(
                      "text-gray-600 hover:text-gray-900 rounded-md text-sm font-medium transition-colors duration-200 flex items-center",
                      isSmallScreen ? "px-2 py-2" : "px-3 py-2",
                    )}
                  >
                    <Wrench className="h-4 w-4 lg:hidden mr-1" />
                    <span className="hidden lg:inline">Tools</span>
                    <span className="lg:hidden">Tools</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/brand" className="w-full">
                        Brand Voice
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard/auto-commenter/config"
                        className="w-full"
                      >
                        Auto-Commenter
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/prompts" className="w-full">
                        Prompts
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/tools" className="w-full">
                        AI Tools
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={cn(
                      "text-gray-600 hover:text-gray-900 rounded-md text-sm font-medium transition-colors duration-200 flex items-center",
                      isSmallScreen ? "px-2 py-2" : "px-3 py-2",
                    )}
                  >
                    <Users className="h-4 w-4 lg:hidden mr-1" />
                    <span className="hidden lg:inline">Manage Team</span>
                    <span className="lg:hidden">Team</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/licenses">
                        Assign Licenses & Goals
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/analytics">Team Analytics</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/transactions">API Usage</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={cn(
                      "text-gray-600 hover:text-gray-900 rounded-md text-sm font-medium transition-colors duration-200 flex items-center",
                      isSmallScreen ? "px-2 py-2" : "px-3 py-2",
                    )}
                  >
                    <Book className="h-4 w-4 lg:hidden mr-1" />
                    <span className="hidden lg:inline">Resources</span>
                    <span className="lg:hidden">Resources</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white">
                    <DropdownMenuItem asChild>
                      <Link href="/guides" className="w-full">
                        Platform Guides
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/onboarding?step=1" className="w-full">
                        Setup Guide
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="https://docs.olly.social"
                        target="_blank"
                        className="w-full"
                      >
                        Documentation
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="https://www.udemy.com/course/genai-social-media-growth-chatgpt-olly-social-ai/?referralCode=91445C57DEE10C372D7C"
                        target="_blank"
                        className="w-full"
                      >
                        Training Course
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Right: User Actions or Sign In/Up */}
          <div className="flex items-center">
            <Dialog open={isDemoOpen} onOpenChange={setIsDemoOpen}>
              <DialogTrigger asChild></DialogTrigger>
              <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[800px] w-[95vw] sm:w-[90vw] md:w-[80vw] max-h-[90vh] p-0">
                <div className="aspect-video w-full p-6">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/878N5HT68g0"
                    title="Olly Demo Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </DialogContent>
            </Dialog>

            {user ? (
              <>
                <div className="hidden md:flex items-center space-x-3 lg:space-x-4 mr-3 lg:mr-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center h-8 lg:h-9 px-3 gap-2 bg-white/50 hover:bg-white/80 transition-colors duration-200"
                    onClick={handleAddToChrome}
                  >
                    <Chrome className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Add to Chrome</span>
                  </Button>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBuyCredits}
                          className="flex items-center h-8 lg:h-9 px-3 gap-2 bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 border-yellow-200 transition-all duration-200"
                        >
                          <Coins className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium text-sm text-yellow-700">
                            {user.credits}
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        className="bg-white shadow-lg"
                      >
                        <p className="text-sm">Click to get more credits</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <NotificationBell
                    notifications={notifications}
                    onMarkAsRead={markAsRead}
                  />
                </div>

                <div className="hidden md:flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center h-8 lg:h-9 px-3 gap-2 bg-white/50 hover:bg-white/80 transition-colors duration-200"
                      >
                        <div className="relative">
                          {user?.picture ? (
                            <Image
                              src={user.picture}
                              alt={user.username}
                              width={28}
                              height={28}
                              className="rounded-full ring-2 ring-offset-2 ring-blue-500/20"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm ring-2 ring-offset-2 ring-blue-500/20">
                              {user?.userInitial}
                            </div>
                          )}
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center text-white text-[10px] font-medium shadow-sm">
                            {user?.level}
                          </div>
                        </div>
                        <span className="font-medium text-sm truncate max-w-[80px] lg:max-w-[120px]">
                          {user.username}
                        </span>
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 bg-white">
                      <DropdownMenuLabel className="font-semibold">
                        Account
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="focus:bg-blue-50">
                        <Link
                          href="/credits"
                          className="flex items-center justify-between w-full py-1.5"
                        >
                          <span className="text-sm">Credits</span>
                          <span className="flex items-center bg-amber-50 px-2 py-0.5 rounded">
                            <Coins className="h-4 w-4 text-yellow-600 mr-1" />
                            <span className="text-sm font-medium text-yellow-700">
                              {user.credits}
                            </span>
                          </span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="focus:bg-blue-50">
                        <Link href="/dashboard/profile" className="py-1.5">
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="focus:bg-blue-50">
                        <Link href="/plans" className="py-1.5">
                          Plans
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="focus:bg-blue-50">
                        <Link href="/prompts" className="py-1.5">
                          Prompts
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center text-red-600 focus:text-red-700 focus:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 lg:h-9 px-3 lg:px-4 text-xs lg:text-sm"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    variant="default"
                    size="sm"
                    className="h-8 lg:h-9 px-3 lg:px-4 text-xs lg:text-sm"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 md:hidden ml-2"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] p-4">
                <MobileMenu
                  user={user}
                  onLogout={handleLogout}
                  onAddToChrome={handleAddToChrome}
                  onClose={closeMobileMenu}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink: React.FC<{
  href: string;
  target?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ href, target = "_self", className = "", children }) => (
  <Link
    href={href}
    target={target}
    className={`text-gray-600 hover:text-gray-900 px-2 py-2 lg:px-3 lg:py-2 rounded-md text-sm font-medium transition-colors duration-200 ${className}`}
  >
    {children}
  </Link>
);

export default Navbar;
