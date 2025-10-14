'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@repo/ui/components/ui/select'
import { Switch } from '@repo/ui/components/ui/switch'
import { AlertCircle, InfoIcon } from 'lucide-react'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@repo/ui/components/ui/tooltip'
import { Alert, AlertDescription } from '@repo/ui/components/ui/alert'
import { toast } from 'sonner'

const JOIN_MODE_OPTIONS = [
  { 
    value: 'CHOICE', 
    label: 'Participant Choice',
    description: 'Participants can choose which group to join'
  },
  { 
    value: 'RANDOM', 
    label: 'Random Assignment',
    description: 'Participants are randomly assigned to groups'
  },
  { 
    value: 'ASSIGNED', 
    label: 'Instructor Assigned',
    description: 'Only you can assign participants to groups'
  }
]

export default function CreateWorkshopForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [totalParticipants, setTotalParticipants] = useState<number>(20)
  const [groupSize, setGroupSize] = useState<number>(4)
  const [joinMode, setJoinMode] = useState<string>('RANDOM')
  const [requireAccessCode, setRequireAccessCode] = useState(false)
  const [accessCode, setAccessCode] = useState('')
  
  const handleCreateWorkshop = async () => {
    if (!name.trim()) {
      toast.error('Please enter a workshop name')
      return
    }
    
    if (totalParticipants < 1) {
      toast.error('Total participants must be at least 1')
      return
    }
    
    if (groupSize < 1) {
      toast.error('Group size must be at least 1')
      return
    }
    
    if (requireAccessCode && !accessCode.trim()) {
      toast.error('Please provide an access code or disable the requirement')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      // Create the workshop
      const response = await axios.post('/api/workshops', {
        name: name.trim(),
        description: description.trim() || undefined,
        totalParticipants,
        joinMode,
        accessCode: requireAccessCode ? accessCode.trim() : undefined
      })
      
      const workshop = response.data.workshop
      
      // Create the initial groups
      const numberOfGroups = Math.ceil(totalParticipants / groupSize)
      const colorOptions = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316']
      
      for (let i = 0; i < numberOfGroups; i++) {
        const colorIndex = i % colorOptions.length
        await axios.post(`/api/workshops/${workshop.id}/groups`, {
          name: `Group ${i + 1}`,
          color: colorOptions[colorIndex],
          maxSize: groupSize
        })
      }
      
      toast.success('Workshop created successfully!')
      router.push(`/tools/workshop-group-organizer/${workshop.id}/manage`)
      
    } catch (err: any) {
      console.error('Error creating workshop:', err)
      setError(err.response?.data?.error || 'Failed to create workshop')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Workshop</CardTitle>
        <CardDescription>
          Set up your workshop structure and participant management
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="workshop-name">Workshop Name</Label>
          <Input
            id="workshop-name"
            placeholder="Enter workshop name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="workshop-description">Description (Optional)</Label>
          <Textarea
            id="workshop-description"
            placeholder="Describe the purpose of your workshop"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="total-participants">Total Participants</Label>
            <Input
              id="total-participants"
              type="number"
              min={1}
              value={totalParticipants}
              onChange={e => setTotalParticipants(parseInt(e.target.value) || 0)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="group-size">Group Size</Label>
            <Input
              id="group-size"
              type="number"
              min={1}
              value={groupSize}
              onChange={e => setGroupSize(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
        
        <div className="pt-1">
          <p className="text-sm text-muted-foreground">
            This will create{' '}
            <span className="font-medium">
              {Math.ceil(totalParticipants / groupSize)}
            </span>{' '}
            groups with a maximum of{' '}
            <span className="font-medium">{groupSize}</span> participants
            per group.
          </p>
        </div>
        
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="join-mode">Join Mode</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Controls how participants are assigned to groups when they join
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select value={joinMode} onValueChange={setJoinMode}>
            <SelectTrigger id="join-mode">
              <SelectValue placeholder="Select join mode" />
            </SelectTrigger>
            <SelectContent>
              {JOIN_MODE_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div>
                    <div>{option.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {option.description}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="require-access-code">Require Access Code</Label>
              <div className="text-sm text-muted-foreground">
                Restrict access to your workshop
              </div>
            </div>
            <Switch
              id="require-access-code"
              checked={requireAccessCode}
              onCheckedChange={setRequireAccessCode}
            />
          </div>
          
          {requireAccessCode && (
            <div className="space-y-2 pt-2">
              <Label htmlFor="access-code">Access Code</Label>
              <Input
                id="access-code"
                placeholder="Create an access code"
                value={accessCode}
                onChange={e => setAccessCode(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Share this code with your participants to allow them to join
              </p>
            </div>
          )}
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleCreateWorkshop} 
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Workshop'}
        </Button>
      </CardFooter>
    </Card>
  )
} 