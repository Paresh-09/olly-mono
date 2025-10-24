'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { AlertCircle, Save, Trash } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/ui/alert'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@repo/ui/components/ui/select'
import { Switch } from '@repo/ui/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@repo/ui/components/ui/alert-dialog'

interface Workshop {
  id: string
  name: string
  description?: string
  joinMode: string
  accessCode?: string
  totalParticipants: number
  createdAt: string
}

interface ManageSettingsTabProps {
  workshopId: string
  workshop: Workshop
  setWorkshop: (workshop: Workshop) => void
}

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

export default function ManageSettingsTab({ workshopId, workshop, setWorkshop }: ManageSettingsTabProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(workshop.name || '')
  const [description, setDescription] = useState(workshop.description || '')
  const [joinMode, setJoinMode] = useState(workshop.joinMode || 'ASSIGNED')
  const [requireAccessCode, setRequireAccessCode] = useState(!!workshop.accessCode)
  const [accessCode, setAccessCode] = useState(workshop.accessCode || '')

  const handleUpdateWorkshop = async () => {
    if (!name.trim()) {
      toast.error('Workshop name is required')
      return
    }

    if (requireAccessCode && !accessCode.trim()) {
      toast.error('Please provide an access code or disable the requirement')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await axios.patch(`/api/workshops/${workshopId}`, {
        name: name.trim(),
        description: description.trim() || null,
        joinMode,
        accessCode: requireAccessCode ? accessCode.trim() : null
      })

      setWorkshop(response.data.workshop)
      toast.success('Workshop settings updated successfully!')
    } catch (err: any) {
      console.error('Error updating workshop:', err)
      setError(err.response?.data?.error || 'Failed to update workshop settings')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteWorkshop = async () => {
    try {
      setDeleting(true)

      await axios.delete(`/api/workshops/${workshopId}`)

      toast.success('Workshop deleted successfully!')
      router.push('/tools/workshop-group-organizer')
    } catch (err: any) {
      console.error('Error deleting workshop:', err)
      toast.error(err.response?.data?.error || 'Failed to delete workshop')
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Workshop Settings</h2>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor="join-mode">Join Mode</Label>
            <Select value={joinMode} onValueChange={setJoinMode}>
              <SelectTrigger id="join-mode">
                <SelectValue placeholder="Select a join mode" />
              </SelectTrigger>
              <SelectContent>
                {JOIN_MODE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div>{option.label}</div>
                      <div className="text-xs text-muted-foreground">
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

          <Button
            onClick={handleUpdateWorkshop}
            className="w-full"
            disabled={loading}
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Deleting the workshop will permanently remove all groups, participants, and tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full"
                disabled={deleting}
              >
                <Trash className="mr-2 h-4 w-4" />
                {deleting ? 'Deleting...' : 'Delete Workshop'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the workshop and all its data including groups, participants, and tasks.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteWorkshop}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Workshop
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
} 