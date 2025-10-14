'use client'

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/ui/alert'
import { Skeleton } from '@repo/ui/components/ui/skeleton'
import { Badge } from '@repo/ui/components/ui/badge'
import { 
  ArrowLeft, 
  Copy, 
  Key, 
  Link, 
  Settings, 
  Share2, 
  UserPlus, 
  Users 
} from 'lucide-react'
import { toast } from 'sonner'
import ManageGroupsTab from '../../_components/manage-groups-tab'
import ManageParticipantsTab from '../../_components/manage-participants-tab'
import ManageTasksTab from '../../_components/manage-tasks-tab'
import ManageSettingsTab from '../../_components/manage-settings-tab'

interface Workshop {
  id: string
  name: string
  description?: string
  joinMode: string
  accessCode?: string
  totalParticipants: number
  createdAt: string
}

export default function WorkshopManagePage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('groups')

  useEffect(() => {
    const fetchWorkshop = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/api/workshops/${params.id}`)
        setWorkshop(response.data.workshop)
      } catch (err: any) {
        console.error('Error fetching workshop:', err)
        setError(err.response?.data?.error || 'Failed to load workshop')
      } finally {
        setLoading(false)
      }
    }
    
    fetchWorkshop()
  }, [params.id])

  const copyJoinLink = () => {
    const url = `${window.location.origin}/tools/workshop-group-organizer/${params.id}`
    navigator.clipboard.writeText(url)
    toast.success('Workshop link copied to clipboard')
  }

  const copyAccessCode = () => {
    if (workshop?.accessCode) {
      navigator.clipboard.writeText(workshop.accessCode)
      toast.success('Access code copied to clipboard')
    }
  }

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-10 w-[300px] mb-6" />
        <div className="grid gap-6">
          <Skeleton className="h-[500px] w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => router.push('/tools/workshop-group-organizer')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Workshops
        </Button>
      </div>
    )
  }

  if (!workshop) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Workshop Not Found</AlertTitle>
          <AlertDescription>
            The workshop you're looking for could not be found or you don't have permission to access it.
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => router.push('/tools/workshop-group-organizer')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Workshops
        </Button>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{workshop.name}</h1>
            <Badge variant="outline" className="px-2 py-0.5">
              {workshop.joinMode === 'CHOICE' ? 'Participant Choice' : 
               workshop.joinMode === 'RANDOM' ? 'Random Assignment' : 
               'Instructor Assigned'}
            </Badge>
          </div>
          {workshop.description && (
            <p className="text-muted-foreground mt-1">{workshop.description}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={copyJoinLink}>
            <Link className="mr-2 h-4 w-4" />
            Copy Join Link
          </Button>
          {workshop.accessCode && (
            <Button variant="outline" size="sm" onClick={copyAccessCode}>
              <Key className="mr-2 h-4 w-4" />
              Copy Access Code
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/tools/workshop-group-organizer')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="groups">
            <Users className="mr-2 h-4 w-4" />
            Groups
          </TabsTrigger>
          <TabsTrigger value="participants">
            <UserPlus className="mr-2 h-4 w-4" />
            Participants
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <Share2 className="mr-2 h-4 w-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="groups">
          <ManageGroupsTab workshopId={params.id} />
        </TabsContent>
        
        <TabsContent value="participants">
          <ManageParticipantsTab workshopId={params.id} />
        </TabsContent>
        
        <TabsContent value="tasks">
          <ManageTasksTab workshopId={params.id} />
        </TabsContent>
        
        <TabsContent value="settings">
          <ManageSettingsTab workshopId={params.id} workshop={workshop} setWorkshop={setWorkshop} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 