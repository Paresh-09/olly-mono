"use client";

import { Button } from "@repo/ui/components/ui/button";

export default function RedditLogin() {
  const handleLogin = () => {
    window.location.href = "/api/auth/reddit";
  };

  return (
    <Button
      onClick={handleLogin}
      className="bg-[#FF4500] hover:bg-[#E03D00] text-white font-bold py-2 px-4 rounded-lg shadow-md"
    >
      Reddit
    </Button>
  );
}
