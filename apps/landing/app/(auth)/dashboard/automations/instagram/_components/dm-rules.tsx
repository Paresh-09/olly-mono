'use client'

import { useState, useEffect } from 'react'
import { Button } from '@repo/ui/components/ui/button'
import { Card, CardContent } from '@repo/ui/components/ui/card'
import { Switch } from '@repo/ui/components/ui/switch'
import { Badge } from '@repo/ui/components/ui/badge'
import { Loader2, Trash2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface InstagramAccount {
  id: string
  username: string
  name: string
  profilePicture: string
  followersCount: number
  mediaCount: number
}

interface Post {
  id: string
  permalink: string
  caption: string
  media_url: string
  thumbnail_url?: string
  timestamp: string
}

interface DMRule {
  id: string
  triggerKeyword: string
  message: string
  isActive: boolean
  delay: number // delay in minutes before sending DM
}

interface DMConfig {
  userId: string
  postId: string
  isEnabled: boolean
  dmRules: DMRule[]
  updatedAt: string
}

interface DMRulesProps {
  account: InstagramAccount
}

export default function DMRules({ account }: DMRulesProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [configs, setConfigs] = useState<DMConfig[]>([])
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch posts
        const postsResponse = await fetch('/api/automations/instagram/posts')
        const postsData = await postsResponse.json()
        
        if (postsData.posts) {
          setPosts(postsData.posts)
        }
        
        // Fetch all DM automation configurations
        const configResponse = await fetch('/api/automations/instagram/dm-automation/all')
        const configData = await configResponse.json()
        
        if (configData.configs && configData.configs.length > 0) {
          setConfigs(configData.configs)
        } else {
          // Fallback to single config endpoint for backward compatibility
          const singleConfigResponse = await fetch('/api/automations/instagram/dm-automation')
          const singleConfigData = await singleConfigResponse.json()
          
          if (singleConfigData.config) {
            setConfigs([singleConfigData.config])
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load Instagram data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleToggleRule = async (configIndex: number, ruleId: string) => {
    try {
      const updatedConfigs = [...configs]
      const config = updatedConfigs[configIndex]
      
      // Find and toggle the rule
      const updatedRules = config.dmRules.map(rule => 
        rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
      )
      
      // Update the config
      updatedConfigs[configIndex] = {
        ...config,
        dmRules: updatedRules
      }
      
      // Save to state
      setConfigs(updatedConfigs)
      
      // Save to API
      const response = await fetch('/api/automations/instagram/dm-automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isEnabled: config.isEnabled,
          postId: config.postId,
          dmRules: updatedRules
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update rule')
      }
      
      toast.success('Rule updated successfully')
    } catch (error) {
      console.error('Error updating rule:', error)
      toast.error('Failed to update rule')
    }
  }

  const handleDeleteRule = async (configIndex: number, ruleId: string) => {
    try {
      const updatedConfigs = [...configs]
      const config = updatedConfigs[configIndex]
      
      // Filter out the rule
      const updatedRules = config.dmRules.filter(rule => rule.id !== ruleId)
      
      // Update the config
      updatedConfigs[configIndex] = {
        ...config,
        dmRules: updatedRules
      }
      
      // Save to state
      setConfigs(updatedConfigs)
      
      // Save to API
      const response = await fetch('/api/automations/instagram/dm-automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isEnabled: config.isEnabled,
          postId: config.postId,
          dmRules: updatedRules
        })
      })

      if (!response.ok) {
        throw new Error('Failed to delete rule')
      }
      
      toast.success('Rule deleted successfully')
    } catch (error) {
      console.error('Error deleting rule:', error)
      toast.error('Failed to delete rule')
    }
  }

  const handleToggleConfig = async (configIndex: number) => {
    try {
      const updatedConfigs = [...configs]
      const config = updatedConfigs[configIndex]
      
      // Toggle the config
      updatedConfigs[configIndex] = {
        ...config,
        isEnabled: !config.isEnabled
      }
      
      // Save to state
      setConfigs(updatedConfigs)
      
      // Save to API
      const response = await fetch('/api/automations/instagram/dm-automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isEnabled: !config.isEnabled,
          postId: config.postId,
          dmRules: config.dmRules
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update configuration')
      }
      
      toast.success(`DM automation ${!config.isEnabled ? 'enabled' : 'disabled'}`)
    } catch (error) {
      console.error('Error updating configuration:', error)
      toast.error('Failed to update configuration')
    }
  }

  const toggleDMAutomation = async (postId: string, enabled: boolean) => {
    try {
      const config = configs.find(c => c.postId === postId);
      
      if (!config) {
        toast.error('Configuration not found');
        return;
      }
      
      const response = await fetch('/api/automations/instagram/dm-automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          isEnabled: enabled,
          dmRules: config.dmRules,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update DM automation');
      }
      
      // Update local state
      setConfigs(configs.map(c => 
        c.postId === postId ? { ...c, isEnabled: enabled } : c
      ));
      
      toast.success(`DM automation ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling DM automation:', error);
      toast.error('Failed to update DM automation');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (configs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No DM automation rules configured yet.</p>
        <Button onClick={() => window.location.href = '/dashboard/automations/instagram?tab=dm-automation'}>
          Create DM Rules
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {configs.map((config, configIndex) => {
        const post = posts.find(p => p.id === config.postId)
        
        return (
          <Card key={config.postId} className="overflow-hidden">
            <div className="p-4 bg-muted flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={config.isEnabled}
                  onCheckedChange={() => handleToggleConfig(configIndex)}
                />
                <span className="font-medium">
                  {post ? (post.caption?.substring(0, 30) || 'Post without caption') + '...' : 'Unknown post'}
                </span>
                <Badge variant={config.isEnabled ? "default" : "outline"}>
                  {config.isEnabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {post && (
                <a 
                  href={post.permalink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs flex items-center gap-1 text-blue-500"
                >
                  View on Instagram
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">DM Rules ({config.dmRules.length})</h3>
                
                {config.dmRules.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No rules configured for this post.</p>
                ) : (
                  <div className="space-y-3">
                    {config.dmRules.map(rule => (
                      <div 
                        key={rule.id} 
                        className="p-3 border rounded-md flex justify-between items-start"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Trigger: "{rule.triggerKeyword}"</span>
                            <Badge variant="outline" className="text-xs">
                              {rule.delay} min delay
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{rule.message}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={rule.isActive}
                            onCheckedChange={() => handleToggleRule(configIndex, rule.id)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteRule(configIndex, rule.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground">
                  Last updated: {new Date(config.updatedAt).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 