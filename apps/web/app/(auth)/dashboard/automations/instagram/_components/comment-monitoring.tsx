'use client'

import { useState, useEffect } from 'react'
import { Button } from '@repo/ui/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@repo/ui/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/ui/select'
import { Switch } from '@repo/ui/components/ui/switch'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Badge } from '@repo/ui/components/ui/badge'
import { Loader2, Trash2, Plus, ExternalLink } from 'lucide-react'
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

interface KeywordRule {
  id: string
  keyword: string
  responseType: 'comment' | 'dm' | 'both'
  responseMessage: string
  isActive: boolean
}

interface CommentConfig {
  userId: string
  postId: string
  isEnabled: boolean
  keywordRules: KeywordRule[]
  updatedAt: string
}

interface CommentMonitoringProps {
  account: InstagramAccount
}

export default function CommentMonitoring({ account }: CommentMonitoringProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [configs, setConfigs] = useState<CommentConfig[]>([])
  
  // For creating new configurations
  const [selectedPostId, setSelectedPostId] = useState<string>('')
  const [isEnabled, setIsEnabled] = useState(false)
  const [keywordRules, setKeywordRules] = useState<KeywordRule[]>([])
  const [newKeyword, setNewKeyword] = useState('')
  const [newResponseType, setNewResponseType] = useState<'comment' | 'dm' | 'both'>('comment')
  const [newResponseMessage, setNewResponseMessage] = useState('')
  const [isCreatingNew, setIsCreatingNew] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch posts
        const postsResponse = await fetch('/api/automations/instagram/posts')
        const postsData = await postsResponse.json()
        
        if (postsData.posts) {
          setPosts(postsData.posts)
          
          // Fetch all configurations
          const configsResponse = await fetch('/api/automations/instagram/comment-monitoring/all')
          const configsData = await configsResponse.json()
          
          if (configsData.configs && configsData.configs.length > 0) {
            setConfigs(configsData.configs)
          } else {
            // Fallback to single config endpoint for backward compatibility
            const singleConfigResponse = await fetch('/api/automations/instagram/comment-monitoring')
            const singleConfigData = await singleConfigResponse.json()
            
            if (singleConfigData.config) {
              setConfigs([singleConfigData.config])
            }
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

  const handleAddKeywordRule = () => {
    if (!newKeyword.trim()) {
      toast.error('Please enter a keyword')
      return
    }

    if (!newResponseMessage.trim()) {
      toast.error('Please enter a response message')
      return
    }

    const newRule: KeywordRule = {
      id: Date.now().toString(),
      keyword: newKeyword.trim(),
      responseType: newResponseType,
      responseMessage: newResponseMessage.trim(),
      isActive: true
    }

    setKeywordRules([...keywordRules, newRule])
    setNewKeyword('')
    setNewResponseMessage('')
    setNewResponseType('comment')
  }

  const handleDeleteKeywordRule = (id: string) => {
    setKeywordRules(keywordRules.filter(rule => rule.id !== id))
  }

  const handleToggleRule = (id: string) => {
    setKeywordRules(keywordRules.map(rule => 
      rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
    ))
  }

  const handleSaveConfig = async () => {
    if (!selectedPostId) {
      toast.error('Please select a post to monitor')
      return
    }

    if (keywordRules.length === 0) {
      toast.error('Please add at least one keyword rule')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/automations/instagram/comment-monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isEnabled,
          postId: selectedPostId,
          keywordRules
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update the configs list
        const newConfig = data.config
        const existingConfigIndex = configs.findIndex(c => c.postId === selectedPostId)
        
        if (existingConfigIndex >= 0) {
          // Update existing config
          const updatedConfigs = [...configs]
          updatedConfigs[existingConfigIndex] = newConfig
          setConfigs(updatedConfigs)
        } else {
          // Add new config
          setConfigs([...configs, newConfig])
        }
        
        toast.success('Comment monitoring configuration saved')
        setIsCreatingNew(false)
        setSelectedPostId('')
        setKeywordRules([])
      } else {
        toast.error('Failed to save configuration')
      }
    } catch (error) {
      console.error('Error saving config:', error)
      toast.error('Failed to save configuration')
    } finally {
      setIsSaving(false)
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
      const response = await fetch('/api/automations/instagram/comment-monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isEnabled: !config.isEnabled,
          postId: config.postId,
          keywordRules: config.keywordRules
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update configuration')
      }
      
      toast.success(`Comment monitoring ${!config.isEnabled ? 'enabled' : 'disabled'}`)
    } catch (error) {
      console.error('Error updating configuration:', error)
      toast.error('Failed to update configuration')
    }
  }

  const handleEditConfig = (config: CommentConfig) => {
    setSelectedPostId(config.postId)
    setIsEnabled(config.isEnabled)
    setKeywordRules(config.keywordRules)
    setIsCreatingNew(true)
  }

  // Fetch comment monitoring configurations
  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all comment monitoring configurations
        const configsResponse = await fetch('/api/automations/instagram/comment-monitoring/all');
        
        if (!configsResponse.ok) {
          throw new Error('Failed to fetch comment monitoring configurations');
        }
        
        const configsData = await configsResponse.json();
        setConfigs(configsData.configs || []);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching comment monitoring configurations:', error);
        toast.error('Failed to load comment monitoring configurations');
        setIsLoading(false);
      }
    };
    
    fetchConfigs();
  }, []);

  // Toggle comment monitoring for a post
  const toggleCommentMonitoring = async (postId: string, enabled: boolean) => {
    try {
      const config = configs.find(c => c.postId === postId);
      
      if (!config) {
        toast.error('Configuration not found');
        return;
      }
      
      const response = await fetch('/api/automations/instagram/comment-monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          isEnabled: enabled,
          keywordRules: config.keywordRules,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update comment monitoring');
      }
      
      // Update local state
      setConfigs(configs.map(c => 
        c.postId === postId ? { ...c, isEnabled: enabled } : c
      ));
      
      toast.success(`Comment monitoring ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling comment monitoring:', error);
      toast.error('Failed to update comment monitoring');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {!isCreatingNew ? (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Your Monitored Posts</h3>
            <Button 
              onClick={() => {
                setIsCreatingNew(true)
                setSelectedPostId('')
                setIsEnabled(true)
                setKeywordRules([])
              }}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Monitor New Post
            </Button>
          </div>
          
          {configs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No comment monitoring configured yet.</p>
              <Button onClick={() => setIsCreatingNew(true)}>
                Set Up Comment Monitoring
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
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
                      <div className="flex items-center gap-2">
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
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditConfig(config)}
                        >
                          Edit Rules
                        </Button>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">Keyword Rules ({config.keywordRules.length})</h3>
                        
                        {config.keywordRules.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No rules configured for this post.</p>
                        ) : (
                          <div className="space-y-3">
                            {config.keywordRules.map(rule => (
                              <div 
                                key={rule.id} 
                                className="p-3 border rounded-md"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium">Keyword: "{rule.keyword}"</div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                      Response: {rule.responseMessage}
                                    </div>
                                  </div>
                                  <Badge variant="outline">
                                    {rule.responseType === 'comment' ? 'Comment' : 
                                     rule.responseType === 'dm' ? 'DM' : 'Comment & DM'}
                                  </Badge>
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
          )}
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedPostId && configs.some(c => c.postId === selectedPostId) 
                ? 'Edit Comment Monitoring' 
                : 'New Comment Monitoring'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="post-select">Select Post to Monitor</Label>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="enabled" className="text-sm">Enabled</Label>
                  <Switch 
                    id="enabled" 
                    checked={isEnabled} 
                    onCheckedChange={setIsEnabled} 
                  />
                </div>
              </div>
              
              <Select 
                value={selectedPostId} 
                onValueChange={setSelectedPostId}
                disabled={!!selectedPostId && configs.some(c => c.postId === selectedPostId)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a post" />
                </SelectTrigger>
                <SelectContent>
                  {posts.map(post => (
                    <SelectItem key={post.id} value={post.id}>
                      {post.caption?.substring(0, 50) || 'Post without caption'}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Keyword Rules</h3>
              
              <div className="space-y-4">
                {keywordRules.map(rule => (
                  <div 
                    key={rule.id} 
                    className="p-4 border rounded-md flex justify-between items-start"
                  >
                    <div className="space-y-1">
                      <div className="font-medium">Keyword: "{rule.keyword}"</div>
                      <div className="text-sm text-muted-foreground">
                        Response ({rule.responseType}): {rule.responseMessage}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={rule.isActive}
                        onCheckedChange={() => handleToggleRule(rule.id)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteKeywordRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-4 border-t pt-4">
                <h4 className="text-sm font-medium">Add New Rule</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="keyword">Trigger Keyword</Label>
                  <Input 
                    id="keyword" 
                    value={newKeyword} 
                    onChange={e => setNewKeyword(e.target.value)}
                    placeholder="Enter keyword to trigger response"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Response Type</Label>
                  <RadioGroup 
                    value={newResponseType} 
                    onValueChange={(value: string) => setNewResponseType(value as 'comment' | 'dm' | 'both')}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="comment" id="comment" />
                      <Label htmlFor="comment">Comment</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dm" id="dm" />
                      <Label htmlFor="dm">DM</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="both" id="both" />
                      <Label htmlFor="both">Both</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="response">Response Message</Label>
                  <Textarea 
                    id="response" 
                    value={newResponseMessage} 
                    onChange={e => setNewResponseMessage(e.target.value)}
                    placeholder="Enter your response message"
                    rows={3}
                  />
                </div>
                
                <Button 
                  onClick={handleAddKeywordRule}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsCreatingNew(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveConfig}
                disabled={isSaving || !selectedPostId || keywordRules.length === 0}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Configuration'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 