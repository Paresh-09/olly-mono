"use client";

import { Button } from "@repo/ui/components/ui/button";
import { FcGoogle } from "react-icons/fc";

interface GoogleOAuthButtonProps {
  children?: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export default function GoogleOAuthButton({ 
  children = "Continue with Google", 
  variant = "outline",
  size = "default",
  className 
}: GoogleOAuthButtonProps) {
  const handleGoogleAuth = () => {
    // Redirect to main app for authentication
    window.location.href = "https://www.olly.social/login";
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleGoogleAuth}
    >
      <FcGoogle className="mr-2 h-4 w-4" />
      {children}
    </Button>
  );
}
