"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Something went wrong!</h2>
        <p className="text-gray-600 mb-6">An error occurred while loading this page.</p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 mr-4"
        >
          Try again
        </button>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}