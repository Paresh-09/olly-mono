'use client'

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { AlertCircle, ArrowRight, Check, Copy, Key, UserPlus, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@repo/ui/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs'
import { toast } from 'sonner'
import { Skeleton } from '@repo/ui/components/ui/skeleton'
import { Badge } from '@repo/ui/components/ui/badge'

interface Participant {
  id: string
  name: string
  email?: string
  groupId: string
  userId?: string
  joinedAt: string
}

interface Group {
  id: string
  name: string
  color: string
  participantCount: number
  maxSize: number
}

interface Workshop {
  id: string
  name: string
  description?: string
  joinMode: string
  accessCode?: string
  isActive: boolean
  groups?: Group[]
}

export default function WorkshopPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [accessCode, setAccessCode] = useState('')
  const [needsAccessCode, setNeedsAccessCode] = useState(false)
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [copiedAccessCode, setCopiedAccessCode] = useState(false)

  useEffect(() => {
    const fetchWorkshop = async () => {
      try {
        setLoading(true)
        
        // Try with existing access code from localStorage if available
        const storedAccessCode = localStorage.getItem(`workshop_access_${params.id}`)
        
        if (storedAccessCode) {
          // Try using the stored access code
          setAccessCode(storedAccessCode)
          
          const response = await axios.get(`/api/workshops/join?workshopId=${params.id}&accessCode=${storedAccessCode}`)
          
          if (response.data.canJoin) {
            setWorkshop(response.data)
            setNeedsAccessCode(false)
            setLoading(false)
            return
          }
        }
        
        // If no stored code or it was invalid, try without an access code
        const response = await axios.get(`/api/workshops/join?workshopId=${params.id}`)
        
        
        if (response.data.needsAccessCode) {
          setNeedsAccessCode(true)
          setWorkshop({
            id: response.data.id,
            name: response.data.name,
            description: response.data.description,
            joinMode: response.data.joinMode,
            isActive: true
          })
        } else {
          setWorkshop(response.data)
          setNeedsAccessCode(false)
        }
        
        setLoading(false)
      } catch (err: any) {
        console.error('Error fetching workshop:', err)
        setError(err.response?.data?.error || 'Failed to load workshop')
        setLoading(false)
      }
    }
    
    fetchWorkshop()
  }, [params.id])

  const handleSubmitAccessCode = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!accessCode.trim()) {
      toast.error('Please enter an access code')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      const trimmedCode = accessCode.trim()
      
      const response = await axios.get(`/api/workshops/join?workshopId=${params.id}&accessCode=${trimmedCode}`)
      
      if (response.data.canJoin) {
        // Save the valid access code to localStorage
        localStorage.setItem(`workshop_access_${params.id}`, trimmedCode)
        
        // Update the workshop data from the response
        setWorkshop({
          id: response.data.id,
          name: response.data.name,
          description: response.data.description,
          joinMode: response.data.joinMode,
          isActive: true,
          groups: response.data.groups
        })
        
        setNeedsAccessCode(false)
        toast.success('Access code verified successfully')
      } else {
        setError(response.data.message || 'Invalid access code')
      }
    } catch (err: any) {
      console.error('Error verifying access code:', err)
      setError(err.response?.data?.error || 'Invalid access code')
    } finally {
      setLoading(false)
    }
  }

  const openJoinDialog = () => {
    setIsJoinDialogOpen(true)
  }

  const handleJoinWorkshop = async () => {
    if (!userName.trim()) {
      toast.error('Please enter your name')
      return
    }
    
    if (needsAccessCode && !accessCode.trim()) {
      toast.error('This workshop requires an access code')
      return
    }

    try {
      // Starting the loading state
      const joinBtn = document.getElementById('join-workshop-btn')
      if (joinBtn) {
        joinBtn.innerHTML = '<span class="spinner"></span> Joining...'
        joinBtn.setAttribute('disabled', 'true')
      }
      
      // Always include the access code in the payload when it exists
      interface JoinPayload {
        workshopId: string;
        name: string;
        accessCode?: string;
        email?: string;
        preferredGroupId?: string;
        [key: string]: string | undefined; // Index signature to allow dynamic access
      }
      
      const payload: JoinPayload = {
        workshopId: params.id,
        name: userName.trim(),
        accessCode: accessCode.trim() || undefined,
        email: userEmail.trim() || undefined,
        preferredGroupId: selectedGroup || undefined
      }

      // Remove any undefined values from the payload
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === '') {
          delete payload[key];
        }
      });

      // Log the payload for debugging
      const response = await axios.post('/api/workshops/join', payload)
      
      toast.success('Successfully joined the workshop!')
      
      // Store participant data for future reference
      localStorage.setItem(`workshop_participant_${params.id}`, JSON.stringify(response.data.participant))
      
      // Redirect to participant dashboard for this workshop
      router.push(`/tools/workshop-group-organizer/${params.id}/dashboard`)
    } catch (err: any) {
      console.error('Error joining workshop:', err)
      let errorMessage = 'Failed to join workshop'
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Invalid access code'
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error
        }
      }
      
      toast.error(errorMessage)
      
      // Reset the button
      const joinBtn = document.getElementById('join-workshop-btn')
      if (joinBtn) {
        joinBtn.innerHTML = 'Join Workshop'
        joinBtn.removeAttribute('disabled')
      }
    }
  }

  const copyJoinLink = () => {
    const url = `${window.location.origin}/tools/workshop-group-organizer/${params.id}`
    navigator.clipboard.writeText(url)
    toast.success('Workshop link copied to clipboard')
  }

  const copyAccessCode = () => {
    if (workshop?.accessCode) {
      navigator.clipboard.writeText(workshop.accessCode)
      setCopiedAccessCode(true)
      setTimeout(() => setCopiedAccessCode(false), 2000)
      toast.success('Access code copied to clipboard')
    }
  }

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[250px] mb-2" />
            <Skeleton className="h-4 w-[350px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !workshop) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (needsAccessCode) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-12">
        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{workshop?.name || 'Protected Workshop'}</CardTitle>
            <CardDescription>This workshop requires an access code to join</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitAccessCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessCode">Access Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="accessCode"
                    placeholder="Enter the access code"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                  />
                  <Button type="submit" disabled={!accessCode.trim()}>
                    Verify
                  </Button>
                </div>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="text-center text-sm text-muted-foreground pt-2">
                Contact the workshop organizer for the access code
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{workshop?.name}</CardTitle>
              {workshop?.description && (
                <CardDescription className="mt-1">{workshop.description}</CardDescription>
              )}
            </div>
            <Badge variant="outline" className="sm:self-start px-2 py-1 text-xs">
              {workshop?.joinMode === 'CHOICE' ? 'Choose Your Group' : 
               workshop?.joinMode === 'RANDOM' ? 'Random Assignment' : 
               'Instructor Assigned'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {workshop?.joinMode === 'CHOICE' && workshop.groups && workshop.groups.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">Available Groups</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {workshop.groups.map(group => (
                  <Card key={group.id} className="overflow-hidden">
                    <div className="h-1.5" style={{ backgroundColor: group.color }}></div>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{group.name}</h4>
                        <div className="text-xs text-muted-foreground">
                          {group.participantCount}/{group.maxSize} members
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-3">
            <Button 
              className="flex-1"
              onClick={openJoinDialog} 
              size="lg"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Join This Workshop
            </Button>
            
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={copyJoinLink}
              size="lg"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Join Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Join Dialog */}
      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Join {workshop?.name}</DialogTitle>
            <DialogDescription>
              Enter your information to join this workshop.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                placeholder="John Smith"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </div>
            
            {needsAccessCode && (
              <div className="space-y-2">
                <Label htmlFor="dialog-access-code">
                  Access Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dialog-access-code"
                  placeholder="Enter workshop access code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This workshop requires an access code to join
                </p>
              </div>
            )}
            
            {workshop?.joinMode === 'CHOICE' && workshop.groups && (
              <div className="space-y-2">
                <Label htmlFor="group">Preferred Group</Label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger id="group">
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {workshop.groups.map(group => (
                      <SelectItem 
                        key={group.id} 
                        value={group.id}
                        disabled={group.participantCount >= group.maxSize}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: group.color }}
                          />
                          <span>
                            {group.name} 
                            {group.participantCount >= group.maxSize ? " (Full)" : ""}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              id="join-workshop-btn"
              onClick={handleJoinWorkshop} 
              disabled={!userName.trim() || (needsAccessCode && !accessCode.trim())}
            >
              Join Workshop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 