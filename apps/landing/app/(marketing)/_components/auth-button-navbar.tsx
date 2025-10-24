"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { checkAuthStatus } from "@/lib/actions";

export function AuthButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchAuthStatus() {
      try {
        const { isLoggedIn } = await checkAuthStatus();
        if (mounted) setIsLoggedIn(!!isLoggedIn);
      } catch (err) {
        if (mounted) setIsLoggedIn(false);
        // keep error logging minimal — helpful during dev
        // eslint-disable-next-line no-console
        console.error("Failed to fetch auth status:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchAuthStatus();
    return () => {
      mounted = false;
    };
  }, []);

  const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || process.env.DASHBOARD_URL || "http://localhost:3000";

  if (loading) {
    return (
      <span
        aria-busy="true"
        aria-live="polite"
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-200 bg-teal-600 text-white h-9 px-4 py-2 opacity-80 cursor-wait"
      >
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        Checking...
      </span>
    );
  }

  return (
    <Link
      href={isLoggedIn ? `${dashboardUrl}/dashboard` : `${dashboardUrl}/signup`}
      className={
        isLoggedIn
          ? "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-200 bg-teal-600 text-white hover:bg-teal-700 h-9 px-4 py-2"
          : "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-200 bg-teal-600 text-white hover:bg-teal-700 h-9 px-4 py-2"
      }
    >
      {isLoggedIn ? "Go to Dashboard" : "Get Started for Free"}
      <span aria-hidden="true" className="ml-2">&rarr;</span>
    </Link>
  );
}