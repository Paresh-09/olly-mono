'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Card, CardContent } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { Textarea } from '@repo/ui/components/ui/textarea'
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
import { AlertCircle, Clock, Pencil, Plus, Trash2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/ui/alert'
import { toast } from 'sonner'
import { DragDropContext, Draggable, Droppable, DropResult, DroppableProvided, DraggableProvided } from '@hello-pangea/dnd'

interface Task {
  id: string
  title: string
  description?: string
  durationMinutes?: number
  order: number
}

export default function ManageTasksTab({ workshopId }: { workshopId: string }) {
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState<string | null>(null)
  
  // Form states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskDuration, setTaskDuration] = useState<number | undefined>(undefined)
  
  useEffect(() => {
    fetchTasks()
  }, [workshopId])
  
  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/workshops/${workshopId}/tasks`)
      // Sort tasks by order
      const sortedTasks = response.data.tasks.sort((a: Task, b: Task) => a.order - b.order)
      setTasks(sortedTasks)
    } catch (err: any) {
      console.error('Error fetching tasks:', err)
      setError(err.response?.data?.error || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }
  
  const handleAddTask = async () => {
    try {
      if (!taskTitle.trim()) {
        toast.error('Task title is required')
        return
      }
      
      const response = await axios.post(`/api/workshops/${workshopId}/tasks`, {
        title: taskTitle.trim(),
        description: taskDescription.trim() || undefined,
        durationMinutes: taskDuration || undefined,
        order: tasks.length // Add at the end
      })
      
      setTasks([...tasks, response.data.task])
      setIsAddDialogOpen(false)
      resetForm()
      toast.success('Task added successfully!')
    } catch (err: any) {
      console.error('Error adding task:', err)
      toast.error(err.response?.data?.error || 'Failed to add task')
    }
  }
  
  const handleEditTask = async () => {
    try {
      if (!currentTask) return
      if (!taskTitle.trim()) {
        toast.error('Task title is required')
        return
      }
      
      const response = await axios.patch(`/api/workshops/${workshopId}/tasks/${currentTask.id}`, {
        title: taskTitle.trim(),
        description: taskDescription.trim() || undefined,
        durationMinutes: taskDuration || undefined,
      })
      
      setTasks(tasks.map(t => t.id === currentTask.id ? response.data.task : t))
      setIsEditDialogOpen(false)
      resetForm()
      toast.success('Task updated successfully!')
    } catch (err: any) {
      console.error('Error updating task:', err)
      toast.error(err.response?.data?.error || 'Failed to update task')
    }
  }
  
  const handleDeleteTask = async (taskId: string) => {
    try {
      await axios.delete(`/api/workshops/${workshopId}/tasks/${taskId}`)
      setTasks(tasks.filter(t => t.id !== taskId))
      toast.success('Task deleted successfully!')
      
      // Update orders for remaining tasks
      const remainingTasks = tasks.filter(t => t.id !== taskId).sort((a, b) => a.order - b.order)
      
      for (let i = 0; i < remainingTasks.length; i++) {
        if (remainingTasks[i].order !== i) {
          await axios.patch(`/api/workshops/${workshopId}/tasks/${remainingTasks[i].id}`, {
            order: i
          })
        }
      }
      
      // Refresh tasks
      fetchTasks()
    } catch (err: any) {
      console.error('Error deleting task:', err)
      toast.error(err.response?.data?.error || 'Failed to delete task')
    }
  }
  
  const openEditDialog = (task: Task) => {
    setCurrentTask(task)
    setTaskTitle(task.title)
    setTaskDescription(task.description || '')
    setTaskDuration(task.durationMinutes)
    setIsEditDialogOpen(true)
  }
  
  const resetForm = () => {
    setTaskTitle('')
    setTaskDescription('')
    setTaskDuration(undefined)
    setCurrentTask(null)
  }
  
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return
    
    const startIndex = result.source.index
    const endIndex = result.destination.index
    
    if (startIndex === endIndex) return
    
    const reordered = [...tasks]
    const [removed] = reordered.splice(startIndex, 1)
    reordered.splice(endIndex, 0, removed)
    
    // Update local state first for immediate feedback
    setTasks(reordered)
    
    try {
      // Update orders in the database
      for (let i = 0; i < reordered.length; i++) {
        if (reordered[i].order !== i) {
          await axios.patch(`/api/workshops/${workshopId}/tasks/${reordered[i].id}`, {
            order: i
          })
        }
      }
      
      toast.success('Task order updated')
    } catch (err: any) {
      console.error('Error updating task order:', err)
      toast.error('Failed to update task order')
      // Revert back to original order if there's an error
      fetchTasks()
    }
  }
  
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-10 w-[120px]" />
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
          <h2 className="text-xl font-semibold">Workshop Tasks</h2>
          <p className="text-sm text-muted-foreground">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} created
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Create a new task for participants to complete
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="task-title">Task Title</Label>
                <Input
                  id="task-title"
                  placeholder="Enter task title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-description">Description (Optional)</Label>
                <Textarea
                  id="task-description"
                  placeholder="Describe what participants should do"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-duration">Estimated Duration (minutes)</Label>
                <Input
                  id="task-duration"
                  type="number"
                  min={1}
                  placeholder="Optional"
                  value={taskDuration || ''}
                  onChange={(e) => setTaskDuration(e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddTask}>Create Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardContent className="p-6">
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No tasks created yet</p>
              <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="tasks">
                {(provided: DroppableProvided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided: DraggableProvided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="border rounded-md p-4 bg-card hover:border-primary/50 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div className="space-y-1 flex-1">
                                <div className="font-medium">{task.title}</div>
                                {task.description && (
                                  <div className="text-sm text-muted-foreground">
                                    {task.description}
                                  </div>
                                )}
                                {task.durationMinutes && (
                                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {task.durationMinutes} minutes
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(task)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Task</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this task?
                                        This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteTask(task.id)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>
      
      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update task details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-task-title">Task Title</Label>
              <Input
                id="edit-task-title"
                placeholder="Enter task title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-task-description">Description (Optional)</Label>
              <Textarea
                id="edit-task-description"
                placeholder="Describe what participants should do"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-task-duration">Estimated Duration (minutes)</Label>
              <Input
                id="edit-task-duration"
                type="number"
                min={1}
                placeholder="Optional"
                value={taskDuration || ''}
                onChange={(e) => setTaskDuration(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditTask}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 