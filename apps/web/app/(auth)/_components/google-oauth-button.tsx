import React from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { getGoogleOauthConsentUrl } from '@/lib/actions';
import { RiGoogleFill } from '@remixicon/react';
import { useToast } from "@repo/ui/hooks/use-toast";

const GoogleOAuthButton = () => {
    const { toast } = useToast();

    const handleClick = async () => {
        // Get current path from window.location
        const currentPath = window.location.pathname + window.location.search;
        const res = await getGoogleOauthConsentUrl(currentPath);
        if (res.url) {
            window.location.href = res.url;
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: res.error || "An error occurred",
            });
        }
    };

    return (
        <Button 
            onClick={handleClick} 
            className="w-full flex items-center justify-center space-x-2 py-2"
            variant="default"
        >
            <RiGoogleFill className="w-5 h-5" />
            <span>Continue with Google</span>
        </Button>
    );
};

export default GoogleOAuthButton;