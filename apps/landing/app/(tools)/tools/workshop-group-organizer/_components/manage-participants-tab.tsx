'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Card, CardContent } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { Skeleton } from '@repo/ui/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@repo/ui/components/ui/dialog'
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@repo/ui/components/ui/select'
import { AlertCircle, UserPlus, UserX } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/ui/alert'
import { Avatar, AvatarFallback } from '@repo/ui/components/ui/avatar'
import { toast } from 'sonner'

interface Group {
  id: string
  name: string
  color: string
  participantCount: number
  maxSize: number
}

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

export default function ManageParticipantsTab({ workshopId }: { workshopId: string }) {
  const [loading, setLoading] = useState(true)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [error, setError] = useState<string | null>(null)
  
  // Form states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
  const [participantName, setParticipantName] = useState('')
  const [participantEmail, setParticipantEmail] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')
  
  useEffect(() => {
    fetchParticipants()
    fetchGroups()
  }, [workshopId])
  
  const fetchParticipants = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/workshops/${workshopId}/participants`)
      setParticipants(response.data.participants)
    } catch (err: any) {
      console.error('Error fetching participants:', err)
      setError(err.response?.data?.error || 'Failed to load participants')
    } finally {
      setLoading(false)
    }
  }
  
  const fetchGroups = async () => {
    try {
      const response = await axios.get(`/api/workshops/${workshopId}/groups`)
      setGroups(response.data.groups)
    } catch (err: any) {
      console.error('Error fetching groups:', err)
    }
  }
  
  const handleAddParticipant = async () => {
    try {
      if (!participantName.trim()) {
        toast.error('Participant name is required')
        return
      }
      
      if (!selectedGroupId) {
        toast.error('Please select a group')
        return
      }
      
      const response = await axios.post(`/api/workshops/${workshopId}/participants`, {
        name: participantName.trim(),
        email: participantEmail.trim() || undefined,
        groupId: selectedGroupId
      })
      
      setParticipants([...participants, response.data.participant])
      setIsAddDialogOpen(false)
      resetForm()
      toast.success('Participant added successfully!')
    } catch (err: any) {
      console.error('Error adding participant:', err)
      toast.error(err.response?.data?.error || 'Failed to add participant')
    }
  }
  
  const handleReassignParticipant = async () => {
    try {
      if (!selectedParticipant || !selectedGroupId) {
        toast.error('Please select a group')
        return
      }
      
      await axios.put(`/api/workshops/${workshopId}/participants/${selectedParticipant.id}`, {
        groupId: selectedGroupId
      })
      
      // Update local state with new group
      const updatedGroup = groups.find(g => g.id === selectedGroupId)
      if (updatedGroup) {
        setParticipants(participants.map(p => 
          p.id === selectedParticipant.id 
            ? {
                ...p, 
                group: {
                  id: updatedGroup.id,
                  name: updatedGroup.name,
                  color: updatedGroup.color
                }
              } 
            : p
        ))
      }
      
      setIsReassignDialogOpen(false)
      resetForm()
      toast.success('Participant reassigned successfully!')
    } catch (err: any) {
      console.error('Error reassigning participant:', err)
      toast.error(err.response?.data?.error || 'Failed to reassign participant')
    }
  }
  
  const handleRemoveParticipant = async (participantId: string) => {
    try {
      await axios.delete(`/api/workshops/${workshopId}/participants/${participantId}`)
      setParticipants(participants.filter(p => p.id !== participantId))
      toast.success('Participant removed successfully!')
    } catch (err: any) {
      console.error('Error removing participant:', err)
      toast.error(err.response?.data?.error || 'Failed to remove participant')
    }
  }
  
  const openReassignDialog = (participant: Participant) => {
    setSelectedParticipant(participant)
    setSelectedGroupId(participant.group.id)
    setIsReassignDialogOpen(true)
  }
  
  const resetForm = () => {
    setParticipantName('')
    setParticipantEmail('')
    setSelectedGroupId('')
    setSelectedParticipant(null)
  }
  
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-10 w-[160px]" />
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Workshop Participants</h2>
          <p className="text-sm text-muted-foreground">
            {participants.length} {participants.length === 1 ? 'participant' : 'participants'} registered
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Participant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Participant</DialogTitle>
              <DialogDescription>
                Manually add a participant to the workshop
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="participant-name">Name</Label>
                <Input
                  id="participant-name"
                  placeholder="Enter participant name"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="participant-email">Email (Optional)</Label>
                <Input
                  id="participant-email"
                  type="email"
                  placeholder="Enter email address"
                  value={participantEmail}
                  onChange={(e) => setParticipantEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group-select">Assign to Group</Label>
                <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                  <SelectTrigger id="group-select">
                    <SelectValue placeholder="Select a group" />
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
                            {group.participantCount >= group.maxSize ? " (Full)" : ""}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddParticipant}>Add Participant</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardContent className="p-6">
          {participants.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No participants have joined yet</p>
              <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Participant
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-[1fr_1fr_auto] md:grid-cols-[2fr_1fr_1fr_auto] text-sm p-3 bg-muted/50 font-medium">
                <div>Name</div>
                <div className="hidden md:block">Joined</div>
                <div>Group</div>
                <div></div>
              </div>
              <div className="divide-y">
                {participants.map(participant => (
                  <div key={participant.id} className="grid grid-cols-[1fr_1fr_auto] md:grid-cols-[2fr_1fr_1fr_auto] text-sm p-3 items-center">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {participant.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{participant.name}</div>
                        {participant.email && (
                          <div className="text-xs text-muted-foreground">{participant.email}</div>
                        )}
                      </div>
                    </div>
                    <div className="hidden md:block text-muted-foreground">
                      {new Date(participant.joinedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: participant.group.color }}
                      />
                      <span>{participant.group.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openReassignDialog(participant)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shuffle"><path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/></svg>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <UserX className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Participant</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {participant.name} from the workshop?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRemoveParticipant(participant.id)}>
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Reassign Dialog */}
      <Dialog open={isReassignDialogOpen} onOpenChange={setIsReassignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Participant</DialogTitle>
            <DialogDescription>
              Move {selectedParticipant?.name} to a different group
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reassign-group">Select New Group</Label>
              <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                <SelectTrigger id="reassign-group">
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map(group => (
                    <SelectItem 
                      key={group.id} 
                      value={group.id}
                      disabled={
                        group.participantCount >= group.maxSize && 
                        group.id !== selectedParticipant?.group.id
                      }
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: group.color }}
                        />
                        <span>
                          {group.name} 
                          {group.participantCount >= group.maxSize && 
                           group.id !== selectedParticipant?.group.id ? " (Full)" : ""}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleReassignParticipant}>Reassign Participant</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 