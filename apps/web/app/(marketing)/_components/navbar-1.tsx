"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import Link from "next/link";
import { MenuIcon, XIcon, ChevronDown } from "lucide-react";
import Logo from "./logo-2";
import { AuthButton } from "./auth-button-navbar";
import { cn } from "@/lib/utils";

const mainNavigation = [
  { name: "Features", href: "/#features" },
  { name: "Wall of Love", href: "/#testimonials" },
  { name: "Leaderboard", href: "/leaderboard" },
  { name: "Pricing", href: "/#pricing" },
];

const resourcesNavigation = [
  { name: "Product Roadmap", href: "/product-roadmap" },
  { name: "Blog", href: "/blog" },
  { name: "FAQ", href: "/#faq" },
  { name: "Release Notes", href: "/release-notes" },
  { name: "Docs", href: "https://docs.olly.social/", target: "_blank" },
  { name: "Affiliates", href: "https://olly-ai.lemonsqueezy.com/affiliates", target: "_blank" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 font-cal  ">
      <nav
        data-state={mobileMenuOpen && 'active'}
        className="fixed z-[99] w-full px-2 group"
      >
        <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12', isScrolled && 'bg-white/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5')}>
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <span className="sr-only">Olly.social logo</span>
                <img src="/logo2.webp" alt="olly social logo" className=" h-12 w-auto" />
                {/* <span className="text-xl  ">Olly</span> */}
              </Link>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <MenuIcon className="group-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <XIcon className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>

            <div className="ml-6 hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {mainNavigation.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className="text-gray-900 hover:text-gray-600 relative block duration-300 transition-all group/link"
                    >
                      <span className="relative">
                        {item.name}
                        <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-teal-500 transition-all duration-300 group-hover/link:w-full"></span>
                      </span>
                    </Link>
                  </li>
                ))}

                <div
                  className="relative group"
                  onMouseEnter={() => setIsResourcesOpen(true)}
                  onMouseLeave={() => setIsResourcesOpen(false)}
                >
                  <button className="hidden lg:inline-flex items-center text-sm   leading-6 text-gray-900 transition-colors duration-200 hover:text-gray-600">
                    Resources
                    <ChevronDown
                      className={`ml-1 h-4 w-4 transition-transform duration-200 ${isResourcesOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <div className={`
                absolute 
                top-full 
                left-1/2 
                transform 
                -translate-x-1/2 
                pt-3
                ${isResourcesOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'}
                transition-all 
                duration-200 
                ease-out
                z-50
              `}>
                    <div className="w-48 rounded-xl bg-white/90 backdrop-blur-sm shadow-lg ring-1 ring-black/5">
                      <div className="relative divide-y divide-gray-100">
                        {resourcesNavigation.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            target={item.target}
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50/80 transition-colors first:rounded-t-xl last:rounded-b-xl"
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </ul>
            </div>



            <div className="bg-white group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {mainNavigation.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-gray-900 hover:text-gray-600 relative block duration-300 transition-all group/link"
                        onClick={closeMobileMenu}
                      >
                        <span className="relative">
                          {item.name}
                          <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-teal-500 transition-all duration-300 group-hover/link:w-full"></span>
                        </span>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <div className="px-0 py-2 text-base   text-gray-900">Resources</div>
                    <ul className="ml-4 space-y-4">
                      {resourcesNavigation.map((item) => (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            target={item.target}
                            className="text-gray-700 hover:text-gray-600 relative block duration-300 transition-all group/link"
                            onClick={closeMobileMenu}
                          >
                            <span className="relative">
                              {item.name}
                              <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-teal-500 transition-all duration-300 group-hover/link:w-full"></span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                </ul>
              </div>

              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit items-center">
                <AuthButton />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <Dialog
        as="div"
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white/95 backdrop-blur-sm px-6 py-4 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5" onClick={closeMobileMenu}>
              <span className="sr-only">Olly Social logo</span>
              <img src="/logo.webp" alt="olly social logo" className="h-16 w-auto" />
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700 transition-colors duration-200 hover:bg-gray-100"
              onClick={closeMobileMenu}
            >
              <span className="sr-only">Close menu</span>
              <XIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-4">
                {mainNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="group -mx-3 flex items-center gap-2 rounded-lg px-3 py-2 text-base   leading-7 text-gray-900 hover:bg-gray-50 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    {item.name}
                  </Link>
                ))}
                <div className="space-y-2">
                  <div className="px-3 py-2 text-base   text-gray-900">Resources</div>
                  {resourcesNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      target={item.target}
                      className="group -mx-3 flex items-center gap-2 rounded-lg px-6 py-2 text-base   leading-7 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-500 opacity-0 transition-opacity group-hover:opacity-100" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="py-6 space-y-3">
                <AuthButton />
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
}