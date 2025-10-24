'use client'

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { ArrowLeft, Check, CheckCircle, Clock, Users, KeyRound } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/ui/alert'
import { Badge } from '@repo/ui/components/ui/badge'
import { Progress } from '@repo/ui/components/ui/progress'
import { Checkbox } from '@repo/ui/components/ui/checkbox'
import { Skeleton } from '@repo/ui/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs'
import { Avatar, AvatarFallback } from '@repo/ui/components/ui/avatar'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { toast } from 'sonner'

interface Participant {
  id: string
  name: string
  email?: string
  joinedAt: string
  userId?: string
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
  isCompleted?: boolean
  durationMinutes?: number
  order: number
}

interface GroupMember {
  id: string
  name: string
}

interface Group {
  id: string
  name: string
  color: string
  maxSize: number
  participants: GroupMember[]
  completedTasks: any[]
}

interface Workshop {
  id: string
  name: string
  description?: string
  groups: Group[]
  tasks: Task[]
}

export default function ParticipantDashboard(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [group, setGroup] = useState<Group | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState<string | null>(null)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)
  const [accessCode, setAccessCode] = useState('')
  const [validatingCode, setValidatingCode] = useState(false)

  useEffect(() => {
    // Check if participant data is stored
    const storedParticipant = localStorage.getItem(`workshop_participant_${params.id}`)

    if (!storedParticipant) {
      // Redirect to join page if not joined
      router.push(`/tools/workshop-group-organizer/${params.id}`)
      return
    }

    setParticipant(JSON.parse(storedParticipant))

    // Fetch workshop and group data
    fetchData()

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    setRefreshInterval(interval)

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [params.id])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Get stored participant data
      const storedParticipant = localStorage.getItem(`workshop_participant_${params.id}`)
      if (!storedParticipant) {
        setError('Participant information not found')
        return
      }

      // Get stored access code if available
      const storedAccessCode = localStorage.getItem(`workshop_access_${params.id}`)

      const participantData = JSON.parse(storedParticipant)

      // Fetch workshop data with access code if available
      const workshopUrl = `/api/workshops/join?workshopId=${params.id}${storedAccessCode ? `&accessCode=${storedAccessCode}` : ''}`

      const workshopResponse = await axios.get(workshopUrl)



      if (!workshopResponse.data.canJoin) {
        setError('Workshop not available or requires access code')
        return
      }

      setWorkshop(workshopResponse.data)

      // Fetch group details
      const groupUrl = `/api/workshops/${params.id}/groups/${participantData.group.id}${storedAccessCode ? `?accessCode=${storedAccessCode}` : ''}`
      const groupResponse = await axios.get(groupUrl)
      setGroup(groupResponse.data.group)

      // Fetch tasks
      const tasksUrl = `/api/workshops/${params.id}/tasks${storedAccessCode ? `?accessCode=${storedAccessCode}` : ''}`
      const tasksResponse = await axios.get(tasksUrl)

      // Combine tasks with completion status
      const tasksWithStatus = tasksResponse.data.tasks.map((task: any) => ({
        ...task,
        isCompleted: groupResponse.data.group.completedTasks.some((ct: any) => ct.taskId === task.id)
      }))

      setTasks(tasksWithStatus)

    } catch (err: any) {
      console.error('Error fetching data:', err)
      setError(err.response?.data?.error || 'Failed to load workshop data')
    } finally {
      setLoading(false)
    }
  }

  const toggleTaskCompletion = async (taskId: string, isCompleted: boolean) => {
    if (!group) return

    try {
      // Get stored access code if available
      const storedAccessCode = localStorage.getItem(`workshop_access_${params.id}`)
      const accessCodeParam = storedAccessCode ? `?accessCode=${storedAccessCode}` : ''

      if (isCompleted) {
        // Mark task as completed
        await axios.post(`/api/workshops/${params.id}/tasks/${taskId}/completion${accessCodeParam}`, {
          groupId: group.id
        })
        toast.success('Task marked as completed')
      } else {
        // Mark task as uncompleted
        await axios.delete(`/api/workshops/${params.id}/tasks/${taskId}/completion/${group.id}${accessCodeParam}`)
        toast.success('Task marked as incomplete')
      }

      // Update local state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, isCompleted } : task
        )
      )
    } catch (err: any) {
      console.error('Error updating task completion:', err)
      toast.error(err.response?.data?.error || 'Failed to update task')
    }
  }

  const calculateTaskProgress = () => {
    if (!tasks.length) return 0
    const completedCount = tasks.filter(task => task.isCompleted).length
    return Math.round((completedCount / tasks.length) * 100)
  }

  // Add function to handle access code validation
  const handleAccessCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!accessCode.trim()) {
      toast.error('Please enter an access code')
      return
    }

    try {
      setValidatingCode(true)

      // Store access code in localStorage
      localStorage.setItem(`workshop_access_${params.id}`, accessCode.trim())

      // Fetch workshop data with the new access code
      const response = await axios.get(`/api/workshops/join?workshopId=${params.id}&accessCode=${accessCode.trim()}`)

      if (response.data.canJoin) {
        setError(null)
        // Refresh data
        await fetchData()
        toast.success('Access code validated successfully')
      } else {
        setError('Invalid access code')
      }
    } catch (err: any) {
      console.error('Error validating access code:', err)
      setError(err.response?.data?.error || 'Invalid access code')
    } finally {
      setValidatingCode(false)
    }
  }

  if (loading && !participant) {
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

  if (error) {
    const isAccessCodeError = error.toLowerCase().includes('access code') ||
      error.toLowerCase().includes('requires access');

    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        {isAccessCodeError ? (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center">
                <KeyRound className="mr-2 h-5 w-5" />
                Enter Access Code
              </CardTitle>
              <CardDescription>
                This workshop requires an access code to view
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAccessCodeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="access-code">Access Code</Label>
                  <Input
                    id="access-code"
                    placeholder="Enter access code"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={validatingCode || !accessCode.trim()}
                >
                  {validatingCode ? 'Validating...' : 'Validate Access Code'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Button
            variant="outline"
            onClick={fetchData}
            className="mr-4"
          >
            Try Again
          </Button>
        )}

        <Button
          variant="outline"
          onClick={() => router.push(`/tools/workshop-group-organizer/${params.id}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Workshop
        </Button>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{workshop?.name}</h1>
          {participant && (
            <p className="text-muted-foreground">
              Joined as <span className="font-medium">{participant.name}</span>
            </p>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => router.push(`/tools/workshop-group-organizer/${params.id}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Workshop Page
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Tasks</CardTitle>
            <CardDescription>Track your group's progress</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : tasks.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{calculateTaskProgress()}%</span>
                  </div>
                  <Progress value={calculateTaskProgress()} className="h-2" />
                </div>

                <div className="space-y-3 pt-2">
                  {tasks.map(task => (
                    <Card key={task.id} className="overflow-hidden">
                      <div className="flex items-center p-4">
                        <Checkbox
                          id={`task-${task.id}`}
                          className="mr-4"
                          checked={task.isCompleted}
                          onCheckedChange={(checked) => toggleTaskCompletion(task.id, checked === true)}
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={`task-${task.id}`}
                            className={`font-medium cursor-pointer ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}
                          >
                            {task.title}
                          </label>
                          {task.description && (
                            <p className={`text-sm mt-1 ${task.isCompleted ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                              {task.description}
                            </p>
                          )}
                        </div>
                        {task.durationMinutes && (
                          <Badge variant="outline" className="ml-2">
                            <Clock className="mr-1 h-3 w-3" />
                            {task.durationMinutes} min
                          </Badge>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No tasks available for this workshop
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Your Group</CardTitle>
                {group && (
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                )}
              </div>
              {group && (
                <CardDescription>{group.name}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : group ? (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    {group.participants.length} / {group.maxSize} members
                  </div>
                  <div className="space-y-2">
                    {group.participants.map(member => (
                      <div key={member.id} className="flex items-center gap-3">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {member.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className={member.id === participant?.id ? "font-medium" : ""}>
                          {member.name} {member.id === participant?.id && "(you)"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  Group information not available
                </div>
              )}
            </CardContent>
          </Card>

          {tasks.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Completion Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center text-3xl font-bold">
                    {calculateTaskProgress()}%
                  </div>
                  <Progress value={calculateTaskProgress()} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground pt-1">
                    <div>Completed: {tasks.filter(t => t.isCompleted).length}</div>
                    <div>Total: {tasks.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 