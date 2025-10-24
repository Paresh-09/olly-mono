"use client";

import React from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Application error</h1>
        <p className="text-sm text-muted-foreground mb-4">An unexpected error occurred.</p>
        <pre className="text-xs text-left max-w-xl overflow-auto">{String(error?.message)}</pre>
      </div>
    </div>
  );
}