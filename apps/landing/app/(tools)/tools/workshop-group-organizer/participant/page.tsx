'use client'
import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { Checkbox } from '@repo/ui/components/ui/checkbox'
import { AlertCircle, CheckCircle, Users, HelpCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/ui/alert'
import { Separator } from '@repo/ui/components/ui/separator'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@repo/ui/components/ui/select'

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
  groups?: Group[]
}

interface Participant {
  id: string
  name: string
  group: {
    id: string
    name: string
    color: string
  }
}

interface Task {
  id: string
  title: string
  description?: string
  durationMinutes?: number
}

const ParticipantView = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const workshopId = searchParams.get('workshopId')
  const accessCode = searchParams.get('accessCode') || undefined

  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [participantName, setParticipantName] = useState('')
  const [participantEmail, setParticipantEmail] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')
  const [workshopAccessCode, setWorkshopAccessCode] = useState(accessCode || '')
  const [needsAccessCode, setNeedsAccessCode] = useState(false)

  // Fetch workshop details and check if it's joinable
  useEffect(() => {
    if (!workshopId) {
      setError('Workshop ID is required')
      setLoading(false)
      return
    }

    // First, check if the workshop exists and is joinable
    const fetchWorkshopDetails = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/api/workshops/join?workshopId=${workshopId}${accessCode ? `&accessCode=${accessCode}` : ''}`)
        const workshopInfo = response.data


        // Always set needsAccessCode based on API response
        setNeedsAccessCode(!!workshopInfo.needsAccessCode)

        // Set basic workshop info regardless of access code
        setWorkshop({
          id: workshopInfo.id,
          name: workshopInfo.name,
          description: workshopInfo.description,
          joinMode: workshopInfo.joinMode
        })

        // Show error if we need an access code but can't join
        if (workshopInfo.needsAccessCode && !workshopInfo.canJoin && !accessCode) {
          setError('This workshop requires an access code')
        } else if (!workshopInfo.canJoin) {
          // Show any other reasons we can't join
          setError(workshopInfo.message || 'Unable to join this workshop')
        } else {
          // Clear previous errors if we can join
          setError(null)

          // For CHOICE join mode, fetch available groups
          if (workshopInfo.joinMode === 'CHOICE') {
            try {
              const groupsResponse = await axios.get(`/api/workshops/${workshopId}/groups`)
              setGroups(groupsResponse.data.groups)
            } catch (groupErr) {
              console.error('Error fetching groups:', groupErr)
              // Continue without groups - will be handled in UI
            }
          }

          // Check localStorage for a saved participant ID for this workshop
          const savedParticipantId = localStorage.getItem(`participant-${workshopId}`)
          if (savedParticipantId) {
            try {
              // Try to fetch the participant details
              const participantResponse = await axios.get(`/api/workshops/${workshopId}/participants/${savedParticipantId}`)
              setParticipant(participantResponse.data.participant)

              // Fetch tasks for the workshop
              fetchTasks()
            } catch (err) {
              // If participant is not found (deleted or expired), clear the local storage
              localStorage.removeItem(`participant-${workshopId}`)
            }
          }
        }

        setLoading(false)
      } catch (err: any) {
        console.error('Error fetching workshop details:', err)
        setError(err.response?.data?.error || 'Workshop not found')
        setLoading(false)
      }
    }

    fetchWorkshopDetails()
  }, [workshopId, accessCode])

  const fetchTasks = async () => {
    if (!workshopId) return

    try {
      const response = await axios.get(`/api/workshops/${workshopId}/tasks`)
      setTasks(response.data.tasks)
    } catch (err) {
      console.error('Error fetching tasks:', err)
    }
  }

  const handleJoinWorkshop = async () => {
    if (!workshopId || !workshop) return

    if (!participantName.trim()) {
      toast.error('Please enter your name')
      return
    }

    if (workshop.joinMode === 'CHOICE' && !selectedGroupId) {
      toast.error('Please select a group')
      return
    }

    if (needsAccessCode && !workshopAccessCode.trim()) {
      toast.error('This workshop requires an access code')
      return
    }

    try {
      setJoining(true)
      setError(null)

      // Create payload with explicit typing
      interface JoinPayload {
        workshopId: string;
        name: string;
        accessCode?: string;
        email?: string;
        preferredGroupId?: string;
      }

      const payload: JoinPayload = {
        workshopId: workshopId,
        name: participantName.trim(),
      }

      // Only add non-empty values
      if (workshopAccessCode.trim()) {
        payload.accessCode = workshopAccessCode.trim()
      }

      if (participantEmail.trim()) {
        payload.email = participantEmail.trim()
      }

      if (selectedGroupId) {
        payload.preferredGroupId = selectedGroupId
      }



      const response = await axios.post('/api/workshops/join', payload)

      if (response.data.success) {
        setParticipant(response.data.participant)

        // Save participant ID in localStorage to remember this session
        localStorage.setItem(`participant-${workshopId}`, response.data.participant.id)

        toast.success('Successfully joined the workshop!')

        // Fetch tasks after joining
        fetchTasks()
      }
    } catch (err: any) {
      console.error('Error joining workshop:', err)

      // Enhanced error handling
      let errorMessage = 'Failed to join workshop'

      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.status === 401) {
          errorMessage = 'Invalid access code or unauthorized access'
        } else if (err.response.status === 403) {
          errorMessage = 'This workshop requires instructor assignment'
        } else if (err.response.status === 400) {
          errorMessage = err.response.data?.error || 'Invalid request'
        } else if (err.response.status === 404) {
          errorMessage = 'Workshop or group not found'
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error
        }
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection'
      }

      setError(errorMessage)
    } finally {
      setJoining(false)
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    if (!workshopId || !participant) return

    try {
      await axios.post(`/api/workshops/${workshopId}/tasks/${taskId}/completion`, {
        groupId: participant.group.id,
        participantId: participant.id
      })

      toast.success('Task marked as completed!')
    } catch (err: any) {
      console.error('Error completing task:', err)
      toast.error(err.response?.data?.error || 'Failed to mark task as completed')
    }
  }

  if (loading) {
    return (
      <div className="container max-w-3xl mx-auto py-12">
        <Card className="shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading workshop information...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-3xl mx-auto py-12">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-center">Workshop Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={() => router.push('/tools/workshop-group-organizer')}
              >
                Back to Workshops
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!workshop) {
    return (
      <div className="container max-w-3xl mx-auto py-12">
        <Card className="shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HelpCircle className="h-8 w-8 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Workshop not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If user hasn't joined yet, show the join form
  if (!participant) {
    return (
      <div className="container max-w-3xl mx-auto py-12">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>{workshop.name}</CardTitle>
            {workshop.description && (
              <CardDescription>{workshop.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Join this workshop</h3>

              <div className="space-y-2">
                <Label htmlFor="participant-name">Your Name*</Label>
                <Input
                  id="participant-name"
                  placeholder="Enter your name"
                  value={participantName}
                  onChange={e => setParticipantName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="participant-email">Email (Optional)</Label>
                <Input
                  id="participant-email"
                  type="email"
                  placeholder="Enter your email"
                  value={participantEmail}
                  onChange={e => setParticipantEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workshop-access-code">Access Code {!needsAccessCode && '(Optional)'}</Label>
                <Input
                  id="workshop-access-code"
                  placeholder="Enter the workshop access code"
                  value={workshopAccessCode}
                  onChange={e => setWorkshopAccessCode(e.target.value)}
                />
                {needsAccessCode && (
                  <p className="text-xs text-muted-foreground">
                    This workshop requires an access code to join
                  </p>
                )}
              </div>

              {workshop.joinMode === 'CHOICE' && groups.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="group-select">Select a Group</Label>
                  <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                    <SelectTrigger id="group-select">
                      <SelectValue placeholder="Choose your group" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map(group => (
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
                              ({group.participantCount}/{group.maxSize})
                              {group.participantCount >= group.maxSize ? " (Full)" : ""}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {workshop.joinMode === 'RANDOM' && (
                <Alert>
                  <AlertDescription>
                    You will be randomly assigned to a group when you join
                  </AlertDescription>
                </Alert>
              )}

              {workshop.joinMode === 'ASSIGNED' && (
                <Alert>
                  <AlertDescription>
                    The workshop organizer will assign you to a group
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleJoinWorkshop}
                className="w-full"
                disabled={joining || !participantName.trim() || (workshop.joinMode === 'CHOICE' && !selectedGroupId)}
              >
                {joining ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Join Workshop'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Participant has joined, show the participant view
  return (
    <div className="container max-w-3xl mx-auto py-12 space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>{workshop.name}</CardTitle>
          {workshop.description && (
            <CardDescription>{workshop.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-primary/5 border-primary/20">
            <CheckCircle className="h-4 w-4 text-primary" />
            <AlertTitle>Welcome, {participant.name}!</AlertTitle>
            <AlertDescription>
              You are a participant in this workshop.
            </AlertDescription>
          </Alert>

          <div className="border rounded-md p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: participant.group.color }}
              />
              <h3 className="text-lg font-medium">
                Your Group: {participant.group.name}
              </h3>
            </div>
          </div>

          {tasks.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Workshop Tasks</h3>
              <div className="divide-y border rounded-md">
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="p-4 flex items-start gap-3"
                  >
                    <div className="flex-shrink-0 rounded-full h-6 w-6 flex items-center justify-center border">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-medium">{task.title}</h4>
                      {task.description && (
                        <p className="text-sm text-muted-foreground">
                          {task.description}
                        </p>
                      )}
                      {task.durationMinutes && (
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <span>
                            Estimated duration: {task.durationMinutes} minutes
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ParticipantView 