'use client'

import { useState } from 'react'
import { Button } from '@repo/ui/components/ui/button'
import { Card } from '@repo/ui/components/ui/card'
import { Instagram } from 'lucide-react'

interface InstagramAccount {
  id: string
  username: string
  name: string
  profilePicture: string
  followersCount: number
  mediaCount: number
}

interface ConnectInstagramProps {
  isConnected: boolean
  account: InstagramAccount | null
  onConnectSuccess: (account: InstagramAccount) => void
}

export default function ConnectInstagram({ 
  isConnected, 
  account,
  onConnectSuccess 
}: ConnectInstagramProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConnect = async () => {
    setIsLoading(true)
    // Redirect to Instagram OAuth endpoint
    window.location.href = '/api/auth/instagram'
  }

  const handleDisconnect = async () => {
    setIsLoading(true)
    try {
      await fetch('/api/automations/instagram/disconnect', {
        method: 'POST'
      })
      window.location.reload()
    } catch (error) {
      console.error('Error disconnecting Instagram:', error)
      setIsLoading(false)
    }
  }

  if (isConnected && account) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          {account.profilePicture && (
            <img 
              src={account.profilePicture} 
              alt={account.username} 
              className="w-16 h-16 rounded-full"
            />
          )}
          <div>
            <h3 className="text-lg font-medium">{account.name}</h3>
            <p className="text-sm text-muted-foreground">@{account.username}</p>
            <div className="flex gap-4 mt-1">
              <span className="text-sm">{account.followersCount ? account.followersCount.toLocaleString() : '0'} followers</span>
              <span className="text-sm">{account.mediaCount ? account.mediaCount.toLocaleString() : '0'} posts</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-green-600 font-medium flex items-center gap-1">
            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
            Connected
          </span>
          <Button 
            variant="outline" 
            onClick={handleDisconnect}
            disabled={isLoading}
          >
            {isLoading ? 'Disconnecting...' : 'Disconnect Account'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-muted p-6 rounded-lg">
        <h3 className="font-medium mb-2">Before you connect:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Make sure you have an Instagram Business or Creator account</li>
          <li>Your Instagram account must be connected to a Facebook Page</li>
          <li>You need admin access to the Facebook Page connected to your Instagram account</li>
        </ul>
      </div>
      
      <div className="flex justify-center">
        <Button 
          size="lg"
          onClick={handleConnect}
          disabled={isLoading}
          className="gap-2"
        >
          <Instagram className="h-5 w-5" />
          {isLoading ? 'Connecting...' : 'Connect Instagram Account'}
        </Button>
      </div>
    </div>
  )
} 