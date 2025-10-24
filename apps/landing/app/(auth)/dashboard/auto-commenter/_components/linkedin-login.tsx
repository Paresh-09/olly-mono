'use client'

import { Button } from '@repo/ui/components/ui/button'

export default function LinkedInLogin() {
  const handleLogin = () => {
    window.location.href = '/api/auth/linkedin'
  }

  return (
    <Button 
      onClick={handleLogin}
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      Connect with LinkedIn
    </Button>
  )
}