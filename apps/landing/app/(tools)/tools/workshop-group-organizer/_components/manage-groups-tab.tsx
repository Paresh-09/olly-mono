'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
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
import { AlertCircle, Copy, Edit, Link, Plus, Trash2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/ui/alert'
import { toast } from 'sonner'

// Predefined colors for groups
const GROUP_COLORS = [
  { value: '#3B82F6', label: 'Blue' },
  { value: '#10B981', label: 'Green' },
  { value: '#F59E0B', label: 'Yellow' },
  { value: '#EF4444', label: 'Red' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#F97316', label: 'Orange' },
]

interface Group {
  id: string
  name: string
  color: string
  participantCount: number
  maxSize: number
}

export default function ManageGroupsTab({ workshopId }: { workshopId: string }) {
  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState<Group[]>([])
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null)
  const [groupName, setGroupName] = useState('')
  const [groupColor, setGroupColor] = useState('#3B82F6')
  const [groupMaxSize, setGroupMaxSize] = useState(8)

  useEffect(() => {
    fetchGroups()
  }, [workshopId])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/workshops/${workshopId}/groups`)
      setGroups(response.data.groups)
    } catch (err: any) {
      console.error('Error fetching groups:', err)
      setError(err.response?.data?.error || 'Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  const handleAddGroup = async () => {
    try {
      if (!groupName.trim()) {
        toast.error('Group name is required')
        return
      }

      const response = await axios.post(`/api/workshops/${workshopId}/groups`, {
        name: groupName.trim(),
        color: groupColor,
        maxSize: groupMaxSize
      })

      setGroups([...groups, response.data.group])
      setIsAddDialogOpen(false)
      resetForm()
      toast.success('Group added successfully!')
    } catch (err: any) {
      console.error('Error adding group:', err)
      toast.error(err.response?.data?.error || 'Failed to add group')
    }
  }

  const handleEditGroup = async () => {
    try {
      if (!currentGroup) return
      if (!groupName.trim()) {
        toast.error('Group name is required')
        return
      }

      const response = await axios.patch(`/api/workshops/${workshopId}/groups/${currentGroup.id}`, {
        name: groupName.trim(),
        color: groupColor,
        maxSize: groupMaxSize
      })

      setGroups(groups.map(g => g.id === currentGroup.id ? response.data.group : g))
      setIsEditDialogOpen(false)
      resetForm()
      toast.success('Group updated successfully!')
    } catch (err: any) {
      console.error('Error updating group:', err)
      toast.error(err.response?.data?.error || 'Failed to update group')
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await axios.delete(`/api/workshops/${workshopId}/groups/${groupId}`)
      setGroups(groups.filter(g => g.id !== groupId))
      toast.success('Group deleted successfully!')
    } catch (err: any) {
      console.error('Error deleting group:', err)
      toast.error(err.response?.data?.error || 'Failed to delete group')
    }
  }

  const openEditDialog = (group: Group) => {
    setCurrentGroup(group)
    setGroupName(group.name)
    setGroupColor(group.color)
    setGroupMaxSize(group.maxSize)
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setGroupName('')
    setGroupColor('#3B82F6')
    setGroupMaxSize(8)
    setCurrentGroup(null)
  }

  const copyGroupJoinLink = (groupId: string) => {
    const url = `${window.location.origin}/tools/workshop-group-organizer/${workshopId}?group=${groupId}`
    navigator.clipboard.writeText(url)
    toast.success('Group join link copied to clipboard')
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[150px] w-full" />
          <Skeleton className="h-[150px] w-full" />
          <Skeleton className="h-[150px] w-full" />
        </div>
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
          <h2 className="text-xl font-semibold">Workshop Groups</h2>
          <p className="text-sm text-muted-foreground">
            {groups.length} {groups.length === 1 ? 'group' : 'groups'} created
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Group</DialogTitle>
              <DialogDescription>
                Create a new group for workshop participants
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  id="group-name"
                  placeholder="Enter group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group-color">Group Color</Label>
                <Select value={groupColor} onValueChange={setGroupColor}>
                  <SelectTrigger id="group-color">
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    {GROUP_COLORS.map(color => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color.value }}
                          />
                          <span>{color.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-size">Maximum Size</Label>
                <Input
                  id="max-size"
                  type="number"
                  min={1}
                  value={groupMaxSize}
                  onChange={(e) => setGroupMaxSize(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddGroup}>Create Group</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <div className="space-y-2">
              <h3 className="font-medium">No groups created yet</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Create your first group to start organizing participants
              </p>
              <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Group
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map(group => (
            <Card key={group.id} className="overflow-hidden">
              <div className="h-1.5" style={{ backgroundColor: group.color }}></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{group.name}</CardTitle>
                <CardDescription>
                  {group.participantCount} / {group.maxSize} participants
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between pt-2">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(group)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => copyGroupJoinLink(group.id)}>
                    <Link className="h-4 w-4" />
                  </Button>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the {group.name} group and remove all participants from it.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteGroup(group.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Group Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>
              Update group details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-group-name">Group Name</Label>
              <Input
                id="edit-group-name"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-group-color">Group Color</Label>
              <Select value={groupColor} onValueChange={setGroupColor}>
                <SelectTrigger id="edit-group-color">
                  <SelectValue placeholder="Select a color" />
                </SelectTrigger>
                <SelectContent>
                  {GROUP_COLORS.map(color => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color.value }}
                        />
                        <span>{color.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-max-size">Maximum Size</Label>
              <Input
                id="edit-max-size"
                type="number"
                min={1}
                value={groupMaxSize}
                onChange={(e) => setGroupMaxSize(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditGroup}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 