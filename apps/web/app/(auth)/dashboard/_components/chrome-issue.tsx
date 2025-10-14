"use client";

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@repo/ui/components/ui/alert';
import Link from 'next/link';

const ChromeStoreStatusBar: React.FC = () => {
  return (
    <div className="sticky top-0 z-50 bg-red-50 text-red-700 py-2 px-4 text-sm border-b border-red-200">
      <Alert variant="destructive" className="container mx-auto flex items-center justify-center">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertDescription className="text-center">
          <span className="font-semibold">Olly is temporarily unavailable on Chrome Store</span>.
          There was a bug on Google where our new versions were not visible to Google. So we had to temporarily take it down so Google can help us fix it. Existing users are unaffected. 
          We have figured out a workaround, so you can still install the extension manually.
          For now, please go to <Link href="/dashboard/releases" className="underline">releases</Link>, download the latest version, unzip it, open <Link href="chrome://extensions/" className="underline">chrome://extensions/</Link> and click &quot;Load unpacked&quot; and select the unzipped folder.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ChromeStoreStatusBar;