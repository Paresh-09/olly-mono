'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Client-side dynamic imports with ssr: false
const GoogleAnalytics = dynamic(() => import("../(marketing)/_components/google-analytics"), {
    ssr: false,
});

const FacebookPixelScript = dynamic(() => import("../(marketing)/_components/fb-pixel-script"), {
    ssr: false,
});

const SmartlookScript = dynamic(() => import("../(marketing)/_components/smartlook-script"), {
    ssr: false,
});

interface TrackingScriptsProps {
    ga_id?: string;
}

export default function TrackingScripts({ ga_id }: TrackingScriptsProps) {
    return (
        <Suspense fallback={null}>
            <FacebookPixelScript />
            {process.env.NODE_ENV === 'production' && ga_id && (
                <>
                    <GoogleAnalytics ga_id={ga_id} />
                    {/* <SmartlookScript /> */}
                </>
            )}
        </Suspense>
    );
}