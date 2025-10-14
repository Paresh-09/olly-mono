"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { checkAuthStatus } from "@/lib/actions";

export function AuthButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function fetchAuthStatus() {
      const { isLoggedIn } = await checkAuthStatus();
      setIsLoggedIn(isLoggedIn);
    }
    fetchAuthStatus();
  }, []);

  return (
    <Link
      href={isLoggedIn ? "/dashboard" : "/signup"}
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