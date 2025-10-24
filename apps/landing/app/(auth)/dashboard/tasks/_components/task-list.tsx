"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { Badge } from "@repo/ui/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@repo/ui/components/ui/button";
import { useToast } from "@repo/ui/hooks/use-toast";import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { AssignTaskDropdown } from "./assign-task-dropdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@repo/ui/components/ui/dialog";
import { Calendar } from "@repo/ui/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/ui/popover";
import { CalendarDays, Linkedin } from "lucide-react";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useRouter } from "next/navigation";
interface Task {
  id: string;
  taskType: string;
  description: string;
  scheduleDate: string;
  platform: string;
  status: string;
  context?: string;
  aiTaskOutput?: string;
  metadata?: {
    originalDescription?: string;
    originalContext?: string;
    generatedAt?: string;
  };
  assignedToId?: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  organization?: {
    id: string;
    name: string;
  };
}

// Add an error boundary component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (error: Error) => {
      console.error('Caught error:', error);
      setError(error);
      setHasError(true);
    };

    window.addEventListener('error', (e) => handleError(e.error));
    return () => window.removeEventListener('error', (e) => handleError(e.error));
  }, []);

  if (hasError) {
    return (
      <div className="p-4 border border-red-500 rounded">
        <h2>Something went wrong.</h2>
        <pre className="text-sm">{error?.message}</pre>
      </div>
    );
  }

  return <>{children}</>;
}

// Add these new interfaces after the Task interface
interface ContentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

function ContentDialog({ isOpen, onClose, title, content }: ContentDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 whitespace-pre-wrap">{content}</div>
      </DialogContent>
    </Dialog>
  );
}

interface LinkedInPostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onPost: (content: string) => void;
}

function LinkedInPostDialog({ isOpen, onClose, content, onPost }: LinkedInPostDialogProps) {
  const [postContent, setPostContent] = useState(content);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Post to LinkedIn</DialogTitle>
          <DialogDescription>
            Edit your post content before sharing to LinkedIn
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <Textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            className="min-h-[200px]"
            placeholder="Edit your post content..."
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onPost(postContent)}>Post to LinkedIn</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TaskList() {
  const { toast } = useToast();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("");
  const [platform, setPlatform] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [dialogContent, setDialogContent] = useState<{ title: string; content: string } | null>(null);
  const [linkedInPostDialog, setLinkedInPostDialog] = useState<{ taskId: string; content: string } | null>(null);

  // Add console logs to track component lifecycle
  useEffect(() => {
    console.log('TaskList mounted');
    return () => console.log('TaskList unmounted');
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [status, platform]);

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (platform) params.append("platform", platform);

      const response = await fetch(`/api/extension/tasks?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      
      const result = await response.json();
      setTasks(result.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SCHEDULED: "bg-blue-500",
      IN_PROGRESS: "bg-yellow-500",
      COMPLETED: "bg-green-500",
      FAILED: "bg-red-500",
      CANCELLED: "bg-gray-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const handleTaskSelection = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks(prev => [...prev, taskId]);
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(tasks.map(task => task.id));
    } else {
      setSelectedTasks([]);
    }
  };

  const deleteSelectedTasks = async () => {
    try {
      const response = await fetch('/api/extension/tasks/delete-selected', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskIds: selectedTasks }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Selected tasks have been deleted",
        });
        setSelectedTasks([]);
        fetchTasks();
      } else {
        throw new Error(data.error || "Failed to delete tasks");
      }
    } catch (error) {
      console.error("Error deleting tasks:", error);
      toast({
        title: "Error",
        description: "Failed to delete selected tasks",
        variant: "destructive",
      });
    }
  };

  const deleteAllTasks = async () => {
    try {
      const response = await fetch('/api/extension/tasks/delete-all', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "All pending tasks have been deleted",
        });
        // Refresh the task list
        fetchTasks();
      } else {
        throw new Error(data.error || "Failed to delete tasks");
      }
    } catch (error) {
      console.error("Error deleting tasks:", error);
      toast({
        title: "Error",
        description: "Failed to delete tasks",
        variant: "destructive",
      });
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/extension/tasks/${taskId}/complete`, {
        method: 'PATCH',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Task marked as completed",
        });
        fetchTasks();
      } else {
        throw new Error(data.error || "Failed to complete task");
      }
    } catch (error) {
      console.error("Error completing task:", error);
      toast({
        title: "Error",
        description: "Failed to complete task",
        variant: "destructive",
      });
    }
  };

  const handleAssignTask = async (taskId: string, userId: string) => {
    try {
      const response = await fetch(`/api/extension/tasks/${taskId}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignedToId: userId }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Task assigned successfully",
        });
        fetchTasks();
      } else {
        throw new Error(data.error || "Failed to assign task");
      }
    } catch (error) {
      console.error("Error assigning task:", error);
      toast({
        title: "Error",
        description: "Failed to assign task",
        variant: "destructive",
      });
    }
  };

  const updateScheduleDate = async (taskId: string, newDate: Date) => {
    try {
      const response = await fetch(`/api/extension/tasks/${taskId}/update-schedule`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scheduleDate: newDate.toISOString() }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Schedule date updated successfully",
        });
        fetchTasks();
      } else {
        throw new Error(data.error || "Failed to update schedule date");
      }
    } catch (error) {
      console.error("Error updating schedule date:", error);
      toast({
        title: "Error",
        description: "Failed to update schedule date",
        variant: "destructive",
      });
    }
  };

  const handlePostToLinkedIn = async (taskId: string, content: string) => {
    try {
      const response = await fetch(`/api/extension/tasks/${taskId}/post-linkedin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Content posted to LinkedIn successfully",
        });
        setLinkedInPostDialog(null);
        fetchTasks();
      } else {
        throw new Error(data.error || "Failed to post to LinkedIn");
      }
    } catch (error) {
      console.error("Error posting to LinkedIn:", error);
      toast({
        title: "Error",
        description: "Failed to post to LinkedIn",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <div className="w-[200px]">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_STATUSES">All Statuses</SelectItem>
                  <SelectItem value="OPEN">Open Tasks</SelectItem>
                  <SelectItem value="PENDING">Pending Tasks</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[200px]">
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                  <SelectItem value="TWITTER">Twitter</SelectItem>
                  <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-2">
            {selectedTasks.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete the selected tasks?")) {
                    deleteSelectedTasks();
                  }
                }}
              >
                Delete Selected ({selectedTasks.length})
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={() => {
                if (window.confirm("Are you sure you want to delete all pending tasks?")) {
                  deleteAllTasks();
                }
              }}
            >
              Delete All Pending
            </Button>
            <Button
              variant="default"
              onClick={() => {
                router.push('/dashboard/tasks/create');
              }}
            >
              Add Task
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedTasks.length === tasks.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>AI Output</TableHead>
                <TableHead>Context</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Schedule Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedTasks.includes(task.id)}
                      onCheckedChange={(checked) => handleTaskSelection(task.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{task.taskType}</TableCell>
                  <TableCell 
                    className="max-w-[200px] truncate cursor-pointer hover:text-blue-500"
                    onClick={() => setDialogContent({
                      title: "Description",
                      content: task.metadata?.originalDescription || task.description
                    })}
                  >
                    {task.metadata?.originalDescription || task.description}
                  </TableCell>
                  <TableCell 
                    className="max-w-[200px] truncate cursor-pointer hover:text-blue-500"
                    onClick={() => setDialogContent({
                      title: "AI Output",
                      content: task.aiTaskOutput || task.description
                    })}
                  >
                    {task.aiTaskOutput || task.description}
                  </TableCell>
                  <TableCell 
                    className="max-w-[200px] truncate cursor-pointer hover:text-blue-500"
                    onClick={() => setDialogContent({
                      title: "Context",
                      content: task.context || task.metadata?.originalContext || 'N/A'
                    })}
                  >
                    {task.context || task.metadata?.originalContext || 'N/A'}
                  </TableCell>
                  <TableCell>{task.platform}</TableCell>
                  <TableCell>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-[200px] pl-3 text-left font-normal"
                        >
                          {format(new Date(task.scheduleDate), "PPp")}
                          <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={new Date(task.scheduleDate)}
                          onSelect={(date) => date && updateScheduleDate(task.id, date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <AssignTaskDropdown
                      taskId={task.id}
                      currentAssignee={task.assignedToId}
                      onAssign={(userId) => handleAssignTask(task.id, userId)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {task.status !== 'COMPLETED' && (
                        <Button
                          size="sm"
                          onClick={() => completeTask(task.id)}
                        >
                          Complete
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setLinkedInPostDialog({
                          taskId: task.id,
                          content: task.aiTaskOutput || task.description
                        })}
                      >
                        <Linkedin className="h-4 w-4 mr-2" />
                        Post
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {tasks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No tasks found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add the ContentDialog */}
        {dialogContent && (
          <ContentDialog
            isOpen={!!dialogContent}
            onClose={() => setDialogContent(null)}
            title={dialogContent.title}
            content={dialogContent.content}
          />
        )}

        {linkedInPostDialog && (
          <LinkedInPostDialog
            isOpen={!!linkedInPostDialog}
            onClose={() => setLinkedInPostDialog(null)}
            content={linkedInPostDialog.content}
            onPost={(content) => handlePostToLinkedIn(linkedInPostDialog.taskId, content)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
} 