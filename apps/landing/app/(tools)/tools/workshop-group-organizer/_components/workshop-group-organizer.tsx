'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/ui/dialog'
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
import { Label } from '@repo/ui/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Checkbox } from '@repo/ui/components/ui/checkbox'
import { Check, Copy, Link2, RefreshCw, Trash2, UserPlus, Users } from 'lucide-react'
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'
import { toast } from 'sonner'

interface Group {
  id: string
  name: string
  color: string
  members: string[]
  completedTasks: string[]
}

interface Workshop {
  id: string
  name: string
  totalParticipants: number
  groupSize: number
  groups: Group[]
  tasks: string[]
  createdAt: string
}

// Predefined colors for groups
const COLORS = [
  { value: 'red', label: 'Red' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'purple', label: 'Purple' },
  { value: 'orange', label: 'Orange' },
  { value: 'pink', label: 'Pink' },
  { value: 'cyan', label: 'Cyan' },
  { value: 'indigo', label: 'Indigo' },
  { value: 'teal', label: 'Teal' },
  { value: 'lime', label: 'Lime' },
  { value: 'amber', label: 'Amber' },
]

const WorkshopGroupOrganizer: React.FC = () => {
  const [workshopName, setWorkshopName] = useState<string>('')
  const [totalParticipants, setTotalParticipants] = useState<number>(20)
  const [groupSize, setGroupSize] = useState<number>(4)
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [currentWorkshop, setCurrentWorkshop] = useState<Workshop | null>(null)
  const [activeTab, setActiveTab] = useState<string>('create')
  const [groupNameInput, setGroupNameInput] = useState<string>('')
  const [showParticipantDialog, setShowParticipantDialog] = useState<boolean>(false)
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null)
  const [participantInput, setParticipantInput] = useState<string>('')
  const [taskInput, setTaskInput] = useState<string>('')
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null)
  const [linkToShare, setLinkToShare] = useState<string>('')

  // Load workshops from localStorage
  useEffect(() => {
    const savedWorkshops = localStorage.getItem('workshops')
    if (savedWorkshops) {
      setWorkshops(JSON.parse(savedWorkshops))
    }
  }, [])

  // Save workshops to localStorage
  useEffect(() => {
    localStorage.setItem('workshops', JSON.stringify(workshops))
  }, [workshops])

  const createWorkshop = () => {
    if (!workshopName) {
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

    const numberOfGroups = Math.ceil(totalParticipants / groupSize)
    
    // Generate groups with unique IDs and colors
    const groups: Group[] = []
    for (let i = 0; i < numberOfGroups; i++) {
      const colorIndex = i % COLORS.length
      groups.push({
        id: `group-${Date.now()}-${i}`,
        name: `Group ${i + 1}`,
        color: COLORS[colorIndex].value,
        members: [],
        completedTasks: []
      })
    }

    const newWorkshop: Workshop = {
      id: `workshop-${Date.now()}`,
      name: workshopName,
      totalParticipants,
      groupSize,
      groups,
      tasks: [],
      createdAt: new Date().toISOString()
    }

    setWorkshops([...workshops, newWorkshop])
    setCurrentWorkshop(newWorkshop)
    setActiveTab('manage')
    setWorkshopName('')
    toast.success('Workshop created successfully!')
  }

  const updateGroupName = (groupId: string, newName: string) => {
    if (!currentWorkshop) return

    const updatedGroups = currentWorkshop.groups.map(group => {
      if (group.id === groupId) {
        return { ...group, name: newName }
      }
      return group
    })

    const updatedWorkshop = { ...currentWorkshop, groups: updatedGroups }
    updateWorkshop(updatedWorkshop)
    setGroupNameInput('')
  }

  const updateGroupColor = (groupId: string, color: string) => {
    if (!currentWorkshop) return

    const updatedGroups = currentWorkshop.groups.map(group => {
      if (group.id === groupId) {
        return { ...group, color }
      }
      return group
    })

    const updatedWorkshop = { ...currentWorkshop, groups: updatedGroups }
    updateWorkshop(updatedWorkshop)
  }

  const openAddParticipantDialog = (groupId: string) => {
    setCurrentGroupId(groupId)
    setParticipantInput('')
    setShowParticipantDialog(true)
  }

  const addParticipant = () => {
    if (!currentWorkshop || !currentGroupId || !participantInput.trim()) return

    const participant = participantInput.trim()
    
    // Check if participant already exists in any group
    const alreadyExists = currentWorkshop.groups.some(group => 
      group.members.includes(participant)
    )

    if (alreadyExists) {
      toast.error('This participant is already in a group')
      return
    }

    const updatedGroups = currentWorkshop.groups.map(group => {
      if (group.id === currentGroupId) {
        // Check if group is full
        if (group.members.length >= currentWorkshop.groupSize) {
          toast.error(`Group ${group.name} is already full`)
          return group
        }
        return { ...group, members: [...group.members, participant] }
      }
      return group
    })

    const updatedWorkshop = { ...currentWorkshop, groups: updatedGroups }
    updateWorkshop(updatedWorkshop)
    setParticipantInput('')
    toast.success('Participant added successfully')
  }

  const removeParticipant = (groupId: string, participant: string) => {
    if (!currentWorkshop) return

    const updatedGroups = currentWorkshop.groups.map(group => {
      if (group.id === groupId) {
        return { 
          ...group, 
          members: group.members.filter(member => member !== participant) 
        }
      }
      return group
    })

    const updatedWorkshop = { ...currentWorkshop, groups: updatedGroups }
    updateWorkshop(updatedWorkshop)
    toast.success('Participant removed')
  }

  const addTask = () => {
    if (!currentWorkshop || !taskInput.trim()) return

    const task = taskInput.trim()
    
    // Check if task already exists
    if (currentWorkshop.tasks.includes(task)) {
      toast.error('This task already exists')
      return
    }

    const updatedWorkshop = { 
      ...currentWorkshop, 
      tasks: [...currentWorkshop.tasks, task] 
    }
    
    updateWorkshop(updatedWorkshop)
    setTaskInput('')
    toast.success('Task added successfully')
  }

  const removeTask = (taskIndex: number) => {
    if (!currentWorkshop) return

    const updatedTasks = [...currentWorkshop.tasks]
    updatedTasks.splice(taskIndex, 1)

    // Also remove this task from all groups' completedTasks
    const updatedGroups = currentWorkshop.groups.map(group => {
      return {
        ...group,
        completedTasks: group.completedTasks.filter(
          task => task !== currentWorkshop.tasks[taskIndex]
        )
      }
    })

    const updatedWorkshop = { 
      ...currentWorkshop, 
      tasks: updatedTasks,
      groups: updatedGroups
    }
    
    updateWorkshop(updatedWorkshop)
    toast.success('Task removed')
  }

  const toggleTaskCompletion = (groupId: string, task: string) => {
    if (!currentWorkshop) return

    const updatedGroups = currentWorkshop.groups.map(group => {
      if (group.id === groupId) {
        // Check if task is already completed
        const isCompleted = group.completedTasks.includes(task)
        
        if (isCompleted) {
          // Remove task from completed tasks
          return {
            ...group,
            completedTasks: group.completedTasks.filter(t => t !== task)
          }
        } else {
          // Add task to completed tasks
          return {
            ...group,
            completedTasks: [...group.completedTasks, task]
          }
        }
      }
      return group
    })

    const updatedWorkshop = { ...currentWorkshop, groups: updatedGroups }
    updateWorkshop(updatedWorkshop)
  }

  const updateWorkshop = (updatedWorkshop: Workshop) => {
    setWorkshops(prevWorkshops =>
      prevWorkshops.map(workshop =>
        workshop.id === updatedWorkshop.id ? updatedWorkshop : workshop
      )
    )
    setCurrentWorkshop(updatedWorkshop)
  }

  const deleteWorkshop = (workshopId: string) => {
    setWorkshops(prevWorkshops =>
      prevWorkshops.filter(workshop => workshop.id !== workshopId)
    )
    
    if (currentWorkshop?.id === workshopId) {
      setCurrentWorkshop(null)
      setActiveTab('create')
    }
    
    toast.success('Workshop deleted')
  }

  const selectWorkshop = (workshopId: string) => {
    const selected = workshops.find(w => w.id === workshopId) || null
    setCurrentWorkshop(selected)
    if (selected) {
      setActiveTab('manage')
    }
  }

  const generateParticipantLink = (workshopId: string, groupId: string) => {
    const baseUrl = window.location.origin
    const link = `${baseUrl}/tools/workshop-group-organizer/participant?workshop=${workshopId}&group=${groupId}`
    setLinkToShare(link)
    return link
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedLinkId(id)
    setTimeout(() => setCopiedLinkId(null), 2000)
    toast.success('Link copied to clipboard')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create Workshop</TabsTrigger>
          <TabsTrigger value="manage">Manage Workshops</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Workshop</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workshop-name">Workshop Name</Label>
                <Input
                  id="workshop-name"
                  placeholder="Enter workshop name"
                  value={workshopName}
                  onChange={e => setWorkshopName(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
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
              
              <div className="pt-2">
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
              
              <Button onClick={createWorkshop} className="w-full">
                Create Workshop
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          {!currentWorkshop ? (
            <Card>
              <CardHeader>
                <CardTitle>Select a Workshop</CardTitle>
              </CardHeader>
              <CardContent>
                {workshops.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No workshops created yet. Go to the "Create Workshop" tab to get started.
                  </p>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {workshops.map(workshop => (
                        <div
                          key={workshop.id}
                          className="flex items-center justify-between p-3 border rounded-md hover:bg-accent cursor-pointer"
                          onClick={() => selectWorkshop(workshop.id)}
                        >
                          <div>
                            <h3 className="font-medium">{workshop.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {workshop.groups.length} groups · Created {formatDate(workshop.createdAt)}
                            </p>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete this workshop and all its groups.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteWorkshop(workshop.id);
                                  }}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{currentWorkshop.name}</h2>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentWorkshop(null);
                  }}
                >
                  Back to List
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Groups Management */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Groups</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {currentWorkshop.groups.length} groups
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-4">
                        {currentWorkshop.groups.map(group => (
                          <Card key={group.id}>
                            <CardHeader className="p-4 pb-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: group.color }}
                                  />
                                  <CardTitle className="text-base">
                                    {group.name}
                                  </CardTitle>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <RefreshCw className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Update Group</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="group-name">Group Name</Label>
                                          <Input
                                            id="group-name"
                                            placeholder={group.name}
                                            value={groupNameInput}
                                            onChange={e => setGroupNameInput(e.target.value)}
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor="group-color">Group Color</Label>
                                          <Select
                                            defaultValue={group.color}
                                            onValueChange={value => updateGroupColor(group.id, value)}
                                          >
                                            <SelectTrigger id="group-color">
                                              <SelectValue placeholder="Select a color" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {COLORS.map(color => (
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
                                      </div>
                                      <DialogFooter>
                                        <Button
                                          onClick={() => {
                                            if (groupNameInput.trim()) {
                                              updateGroupName(group.id, groupNameInput);
                                            }
                                          }}
                                        >
                                          Update
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                  
                                  <Button variant="ghost" size="icon"
                                    onClick={() => {
                                      const link = generateParticipantLink(currentWorkshop.id, group.id);
                                      copyToClipboard(link, group.id);
                                    }}
                                  >
                                    {copiedLinkId === group.id ? (
                                      <Check className="h-4 w-4" />
                                    ) : (
                                      <Link2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-2">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">
                                    {group.members.length} / {currentWorkshop.groupSize} members
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openAddParticipantDialog(group.id)}
                                    disabled={group.members.length >= currentWorkshop.groupSize}
                                  >
                                    <UserPlus className="h-3 w-3 mr-1" />
                                    Add
                                  </Button>
                                </div>
                                
                                {group.members.length > 0 ? (
                                  <ul className="space-y-1">
                                    {group.members.map(member => (
                                      <li key={member} className="flex items-center justify-between text-sm">
                                        <span>{member}</span>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-5 w-5"
                                          onClick={() => removeParticipant(group.id, member)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-xs text-muted-foreground">No members added yet</p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Tasks Management */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Tasks</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {currentWorkshop.tasks.length} tasks
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a new task"
                          value={taskInput}
                          onChange={e => setTaskInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && taskInput.trim()) {
                              addTask();
                            }
                          }}
                        />
                        <Button onClick={addTask} disabled={!taskInput.trim()}>
                          Add
                        </Button>
                      </div>
                      
                      <ScrollArea className="h-[350px]">
                        <div className="space-y-2">
                          {currentWorkshop.tasks.length > 0 ? (
                            currentWorkshop.tasks.map((task, index) => (
                              <Card key={index}>
                                <CardContent className="p-3 flex items-center justify-between">
                                  <span>{task}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeTask(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </CardContent>
                              </Card>
                            ))
                          ) : (
                            <p className="text-center text-muted-foreground py-4">
                              No tasks added yet
                            </p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </CardContent>
                </Card>

                {/* Progress Tracking */}
                {currentWorkshop.tasks.length > 0 && (
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Task Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Group</TableHead>
                              {currentWorkshop.tasks.map((task, index) => (
                                <TableHead key={index}>{task}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentWorkshop.groups.map(group => (
                              <TableRow key={group.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: group.color }}
                                    />
                                    <span>{group.name}</span>
                                  </div>
                                </TableCell>
                                {currentWorkshop.tasks.map(task => (
                                  <TableCell key={task}>
                                    <Checkbox
                                      checked={group.completedTasks.includes(task)}
                                      onCheckedChange={() => toggleTaskCompletion(group.id, task)}
                                    />
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog for adding participants */}
      <Dialog open={showParticipantDialog} onOpenChange={setShowParticipantDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Participant</DialogTitle>
            <DialogDescription>
              Add a participant to this group.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Participant name"
              value={participantInput}
              onChange={e => setParticipantInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && participantInput.trim()) {
                  addParticipant();
                  setShowParticipantDialog(false);
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                addParticipant();
                setShowParticipantDialog(false);
              }}
              disabled={!participantInput.trim()}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default WorkshopGroupOrganizer 