'use client'
import React from 'react';
import { CheckCircle, Star, Gift, Heart, ArrowLeft, Home, Instagram } from 'lucide-react';
import { Button } from '@repo/ui/components/ui/button';
import Link from 'next/link';


function SuccessPage() {
    return (
        <div className="min-h-screen flex items-center justify-center ">
            <div className="w-full max-w-md mx-auto bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">
                <div className="flex justify-center mb-6">
                    <CheckCircle className="w-14 h-14 text-blue-500" />
                </div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">Application Submitted</h1>
                <p className="text-gray-600 mb-6">
                    Thank you for applying to our Influencer Program.<br />
                    We&apos;ve received your application and our team will review it soon.
                </p>
                <div className="mb-6">
                    <ul className="text-left text-gray-500 text-sm space-y-2 mx-auto max-w-xs">
                        <li className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-gray-400" />
                            Review within 24 hours
                        </li>
                        <li className="flex items-center gap-2">
                            <Gift className="w-4 h-4 text-gray-400" />
                            If approved, you&apos;ll get a personal email with your referral code
                        </li>
                    </ul>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/">
                        <Button className="w-full sm:w-auto" variant="outline">
                            <Home className="w-4 h-4 mr-1" /> Home
                        </Button>
                    </Link>
                    <Link href="/creators">
                        <Button className="w-full sm:w-auto" variant="secondary">
                            <ArrowLeft className="w-4 h-4 mr-1" /> Back
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default SuccessPage;