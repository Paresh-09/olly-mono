'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@repo/ui/components/ui/card';
import { Button } from '@repo/ui/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs';
import { Input } from '@repo/ui/components/ui/input';
import { Label } from '@repo/ui/components/ui/label';
import { Calendar } from '@repo/ui/components/ui/calendar';
import { toast } from '@repo/ui/hooks/use-toast';
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { Separator } from "@repo/ui/components/ui/separator";
import { Progress } from '@repo/ui/components/ui/progress';
import { Badge } from '@repo/ui/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@repo/ui/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/ui/select';
import { Checkbox } from '@repo/ui/components/ui/checkbox';
import { format, addDays, isToday, isBefore, isAfter, startOfWeek, endOfWeek, eachDayOfInterval, getHours, getDay, setHours, setMinutes, addHours, differenceInMinutes } from 'date-fns';
import { CalendarIcon, Clock, Settings, BarChart3, CalendarPlus, ListTodo, Check, Plus, Trash2, RefreshCw } from 'lucide-react';
import AuthPopup from "../authentication";
import { useAuthLimit } from '@/hooks/use-auth-check';
import { CalendarView } from './calendar-view';
import { ProjectDialog } from './calendar-project-dialog';

// Constants
const LOCAL_STORAGE_KEY = 'productivity_calendar_data';
const TIME_BLOCK_COLORS = {
  red: 'bg-red-100 border-red-400 text-red-800',
  blue: 'bg-blue-100 border-blue-400 text-blue-800',
  green: 'bg-green-100 border-green-400 text-green-800',
  yellow: 'bg-yellow-100 border-yellow-400 text-yellow-800',
  purple: 'bg-purple-100 border-purple-400 text-purple-800',
  gray: 'bg-gray-100 border-gray-400 text-gray-800',
};

const WORK_HOURS = {
  start: 8, // 8 AM
  end: 18,  // 6 PM
};

// Interfaces
interface TimeBlock {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  colorKey: keyof typeof TIME_BLOCK_COLORS;
  projectId?: string;
  isRecurring?: boolean;
  recurringDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
  notes?: string;
  completed?: boolean;
}

interface Project {
  id: string;
  name: string;
  deadline?: Date;
  priority: 'high' | 'medium' | 'low';
  estimatedHours: number;
  colorKey: keyof typeof TIME_BLOCK_COLORS;
  completedHours: number;
}

interface Settings {
  workDays: number[]; // 0 = Sunday, 1 = Monday, etc.
  workHours: {
    start: number;
    end: number;
  };
  defaultBlockDuration: number; // in minutes
}

export const ProductivityCalendar = () => {
  // Authentication and usage limiting
  const {
    isAuthenticated,
    showAuthPopup,
    setShowAuthPopup,
    checkUsageLimit,
    incrementUsage,
    handleSuccessfulAuth,
    remainingUses
  } = useAuthLimit({
    toolId: 'productivity-calendar',
    dailyLimit: 5
  });

  // State for time blocks, projects and settings
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [settings, setSettings] = useState<Settings>({
    workDays: [1, 2, 3, 4, 5], // Monday to Friday
    workHours: WORK_HOURS,
    defaultBlockDuration: 60, // 60 minutes
  });

  // UI state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedView, setSelectedView] = useState<'day' | 'week' | 'month'>('day');
  const [currentTab, setCurrentTab] = useState('calendar');

  // Dialogs state
  const [newBlockDialogOpen, setNewBlockDialogOpen] = useState(false);
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form state for new time block
  const [newBlockTitle, setNewBlockTitle] = useState('');
  const [newBlockStart, setNewBlockStart] = useState<Date>(new Date());
  const [newBlockDuration, setNewBlockDuration] = useState(60); // in minutes
  const [newBlockColor, setNewBlockColor] = useState<keyof typeof TIME_BLOCK_COLORS>('blue');
  const [newBlockProject, setNewBlockProject] = useState<string | undefined>(undefined);
  const [newBlockIsRecurring, setNewBlockIsRecurring] = useState(false);
  const [newBlockRecurringDays, setNewBlockRecurringDays] = useState<number[]>([]);
  const [newBlockNotes, setNewBlockNotes] = useState('');

  // Form state for new project
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDeadline, setNewProjectDeadline] = useState<Date | undefined>(undefined);
  const [newProjectPriority, setNewProjectPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newProjectEstimatedHours, setNewProjectEstimatedHours] = useState(10);
  const [newProjectColor, setNewProjectColor] = useState<keyof typeof TIME_BLOCK_COLORS>('green');

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        
        // Parse date strings back to Date objects
        if (parsedData.timeBlocks) {
          const parsedTimeBlocks = parsedData.timeBlocks.map((block: any) => ({
            ...block,
            startTime: new Date(block.startTime),
            endTime: new Date(block.endTime),
          }));
          setTimeBlocks(parsedTimeBlocks);
        }
        
        if (parsedData.projects) {
          const parsedProjects = parsedData.projects.map((project: any) => ({
            ...project,
            deadline: project.deadline ? new Date(project.deadline) : undefined,
          }));
          setProjects(parsedProjects);
        }
        
        if (parsedData.settings) {
          setSettings(parsedData.settings);
        }
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          timeBlocks,
          projects,
          settings,
        })
      );
    } catch (error) {
      console.error("Error saving data to localStorage:", error);
    }
  }, [timeBlocks, projects, settings]);

  // Function to add a new time block
  const addTimeBlock = () => {
    if (!checkUsageLimit()) {
      return;
    }

    try {
      // Calculate end time based on start time and duration
      const startTime = new Date(newBlockStart);
      const endTime = addHours(startTime, newBlockDuration / 60);
      
      const newBlock: TimeBlock = {
        id: `block-${Date.now()}`,
        title: newBlockTitle,
        startTime,
        endTime,
        colorKey: newBlockColor,
        projectId: newBlockProject,
        isRecurring: newBlockIsRecurring,
        recurringDays: newBlockIsRecurring ? newBlockRecurringDays : undefined,
        notes: newBlockNotes,
        completed: false,
      };
      
      setTimeBlocks([...timeBlocks, newBlock]);
      
      // Reset form
      setNewBlockTitle('');
      setNewBlockStart(new Date());
      setNewBlockDuration(settings.defaultBlockDuration);
      setNewBlockColor('blue');
      setNewBlockProject(undefined);
      setNewBlockIsRecurring(false);
      setNewBlockRecurringDays([]);
      setNewBlockNotes('');
      
      setNewBlockDialogOpen(false);
      
      if (!isAuthenticated) {
        incrementUsage();
      }
      
      toast({
        title: "Time Block Added",
        description: "Your new time block has been created successfully."
      });
    } catch (error) {
      console.error("Error adding time block:", error);
      toast({
        title: "Error",
        description: "Failed to add the time block",
        variant: "destructive"
      });
    }
  };

  // Function to update an existing time block
  const updateTimeBlock = (blockId: string, updatedData: Partial<TimeBlock>) => {
    setTimeBlocks(timeBlocks.map(block => 
      block.id === blockId ? { ...block, ...updatedData } : block
    ));
    
    toast({
      title: "Time Block Updated",
      description: "Your time block has been updated successfully."
    });
  };

  // Function to delete a time block
  const deleteTimeBlock = (blockId: string) => {
    setTimeBlocks(timeBlocks.filter(block => block.id !== blockId));
    
    toast({
      title: "Time Block Deleted",
      description: "Your time block has been deleted."
    });
  };

  // New functions for calendar view
  const handleBlockClick = (block: TimeBlock) => {
    setEditingBlock(block);
    setNewBlockTitle(block.title);
    setNewBlockStart(new Date(block.startTime));
    setNewBlockDuration(Math.round(differenceInMinutes(block.endTime, block.startTime)));
    setNewBlockColor(block.colorKey);
    setNewBlockProject(block.projectId);
    setNewBlockIsRecurring(!!block.isRecurring);
    setNewBlockRecurringDays(block.recurringDays || []);
    setNewBlockNotes(block.notes || '');
    setNewBlockDialogOpen(true);
  };

  const handleTimeSlotClick = (time: Date) => {
    setNewBlockStart(time);
    setNewBlockDialogOpen(true);
  };

  // Function to add a project
  const addProject = (project: Project) => {
    if (!checkUsageLimit()) {
      return;
    }

    try {
      const isEditing = !!projects.find(p => p.id === project.id);
      
      if (isEditing) {
        // Update existing project
        setProjects(projects.map(p => p.id === project.id ? project : p));
      } else {
        // Add new project
        setProjects([...projects, project]);
      }
      
      // Reset form by clearing the editing project
      setEditingProject(null);
      
      if (!isAuthenticated && !isEditing) {
        incrementUsage();
      }
      
      toast({
        title: isEditing ? "Project Updated" : "Project Added",
        description: `Your project has been ${isEditing ? 'updated' : 'created'} successfully.`
      });
    } catch (error) {
      console.error("Error with project:", error);
      toast({
        title: "Error",
        description: "Failed to save your project",
        variant: "destructive"
      });
    }
  };

  // Function to delete a project
  const deleteProject = (projectId: string) => {
    setProjects(projects.filter(project => project.id !== projectId));
    
    // Remove project associations from time blocks
    setTimeBlocks(timeBlocks.map(block => 
      block.projectId === projectId 
        ? { ...block, projectId: undefined } 
        : block
    ));
    
    toast({
      title: "Project Deleted",
      description: "Your project has been deleted."
    });
  };

  return (
    <Card className="shadow-sm border-muted">
      <div className="p-6">
        {!isAuthenticated && (
          <Alert className="mb-6">
            <AlertDescription>
              You have {remainingUses} free uses remaining today. Sign in for unlimited access and to save your calendar data.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="calendar" onValueChange={(value) => setCurrentTab(value)}>
          <TabsList className="mb-6 w-full grid grid-cols-4">
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                <Button 
                  variant={selectedView === 'day' ? 'default' : 'outline'} 
                  onClick={() => setSelectedView('day')}
                >
                  Day
                </Button>
                <Button 
                  variant={selectedView === 'week' ? 'default' : 'outline'} 
                  onClick={() => setSelectedView('week')}
                >
                  Week
                </Button>
                <Button 
                  variant={selectedView === 'month' ? 'default' : 'outline'} 
                  onClick={() => setSelectedView('month')}
                >
                  Month
                </Button>
              </div>
              <div className="flex items-center space-x-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {format(selectedDate, 'MMM d, yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button onClick={() => {
                  setEditingBlock(null);
                  setNewBlockTitle('');
                  setNewBlockStart(new Date());
                  setNewBlockDuration(settings.defaultBlockDuration);
                  setNewBlockColor('blue');
                  setNewBlockProject(undefined);
                  setNewBlockIsRecurring(false);
                  setNewBlockRecurringDays([]);
                  setNewBlockNotes('');
                  setNewBlockDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Block
                </Button>
              </div>
            </div>
            
            <CalendarView 
              timeBlocks={timeBlocks}
              projects={projects}
              selectedDate={selectedDate}
              selectedView={selectedView}
              onBlockClick={handleBlockClick}
              onTimeSlotClick={handleTimeSlotClick}
              workHours={settings.workHours}
            />
          </TabsContent>
          
          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Active Projects</h3>
              <Button onClick={() => {
                setEditingProject(null);
                setNewProjectDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </div>
            
            <div className="space-y-4">
              {projects.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No projects yet. Create your first project to start organizing your work.
                </p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {projects.map((project) => {
                    // Calculate project progress
                    const progress = project.completedHours / project.estimatedHours * 100;
                    const progressCapped = Math.min(100, Math.max(0, progress));
                    
                    // Get time blocks for this project
                    const projectBlocks = timeBlocks.filter(block => block.projectId === project.id);
                    
                    return (
                      <Card key={project.id} className={`border-l-4 ${TIME_BLOCK_COLORS[project.colorKey]}`}>
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-lg">{project.name}</h4>
                              <Badge className="mt-1" variant={
                                project.priority === 'high' ? 'destructive' : 
                                project.priority === 'medium' ? 'default' : 
                                'outline'
                              }>
                                {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)} Priority
                              </Badge>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setEditingProject(project);
                                  setNewProjectDialogOpen(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteProject(project.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {project.deadline && (
                            <div className="mt-2 text-sm">
                              <span className="text-gray-500">Deadline:</span>{' '}
                              <span className={isAfter(new Date(), project.deadline) ? 'text-red-600 font-medium' : ''}>
                                {format(project.deadline, 'MMMM d, yyyy')}
                              </span>
                              {isAfter(new Date(), project.deadline) && 
                                <span className="text-red-600 ml-1">(Overdue)</span>
                              }
                            </div>
                          )}
                          
                          <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{Math.round(progressCapped)}%</span>
                            </div>
                            <Progress value={progressCapped} className="h-2" />
                            <div className="mt-1 text-xs text-gray-500">
                              {project.completedHours} of {project.estimatedHours} estimated hours
                            </div>
                          </div>
                          
                          <div className="mt-3 flex justify-between">
                            <span className="text-sm text-gray-500">
                              {projectBlocks.length} time {projectBlocks.length === 1 ? 'block' : 'blocks'}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Pre-fill new block form with this project
                                setEditingBlock(null);
                                setNewBlockTitle('');
                                setNewBlockStart(new Date());
                                setNewBlockDuration(settings.defaultBlockDuration);
                                setNewBlockColor(project.colorKey);
                                setNewBlockProject(project.id);
                                setNewBlockIsRecurring(false);
                                setNewBlockRecurringDays([]);
                                setNewBlockNotes('');
                                setNewBlockDialogOpen(true);
                              }}
                            >
                              Add Time Block
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Productivity Analytics</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-4">
                <h4 className="font-medium mb-2">Time Allocation</h4>
                <p className="text-center text-gray-500 py-8">Time allocation chart will be implemented in future updates</p>
              </Card>
              <Card className="p-4">
                <h4 className="font-medium mb-2">Project Progress</h4>
                <p className="text-center text-gray-500 py-8">Project progress chart will be implemented in future updates</p>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Calendar Settings</h3>
            
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Working Hours</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Select
                        value={String(settings.workHours.start)}
                        onValueChange={(value) => {
                          setSettings({
                            ...settings,
                            workHours: {
                              ...settings.workHours,
                              start: parseInt(value)
                            }
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Start time" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }).map((_, i) => (
                            <SelectItem key={i} value={String(i)}>
                              {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Select
                        value={String(settings.workHours.end)}
                        onValueChange={(value) => {
                          setSettings({
                            ...settings,
                            workHours: {
                              ...settings.workHours,
                              end: parseInt(value)
                            }
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="End time" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }).map((_, i) => (
                            <SelectItem key={i} value={String(i)}>
                              {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Working Days</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                      <Button
                        key={day}
                        type="button"
                        variant={settings.workDays.includes(index) ? 'default' : 'outline'}
                        onClick={() => {
                          setSettings({
                            ...settings,
                            workDays: settings.workDays.includes(index)
                              ? settings.workDays.filter(d => d !== index)
                              : [...settings.workDays, index].sort()
                          });
                        }}
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Default Time Block Duration</h4>
                  <div className="max-w-xs">
                    <Select
                      value={String(settings.defaultBlockDuration)}
                      onValueChange={(value) => {
                        setSettings({
                          ...settings,
                          defaultBlockDuration: parseInt(value)
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog for adding/editing time blocks */}
      <Dialog open={newBlockDialogOpen} onOpenChange={setNewBlockDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingBlock ? 'Edit Time Block' : 'New Time Block'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="block-title">Title</Label>
              <Input
                id="block-title"
                placeholder="What are you working on?"
                value={newBlockTitle}
                onChange={(e) => setNewBlockTitle(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <Clock className="h-4 w-4 mr-2" />
                      {format(newBlockStart, 'h:mm a, MMM d')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3">
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            value={String(getHours(newBlockStart))}
                            onValueChange={(value) => {
                              const newTime = new Date(newBlockStart);
                              newTime.setHours(parseInt(value));
                              setNewBlockStart(newTime);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Hour" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }).map((_, i) => (
                                <SelectItem key={i} value={String(i)}>
                                  {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <Select
                            value={String(Math.floor(newBlockStart.getMinutes() / 15) * 15)}
                            onValueChange={(value) => {
                              const newTime = new Date(newBlockStart);
                              newTime.setMinutes(parseInt(value));
                              setNewBlockStart(newTime);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Minute" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">:00</SelectItem>
                              <SelectItem value="15">:15</SelectItem>
                              <SelectItem value="30">:30</SelectItem>
                              <SelectItem value="45">:45</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Calendar
                          mode="single"
                          selected={newBlockStart}
                          onSelect={(date) => date && setNewBlockStart(date)}
                          initialFocus
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="block-duration">Duration (minutes)</Label>
                <Select
                  value={String(newBlockDuration)}
                  onValueChange={(value) => setNewBlockDuration(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="180">3 hours</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(TIME_BLOCK_COLORS).map((color) => (
                  <Button
                    key={color}
                    type="button"
                    variant="outline"
                    className={`w-8 h-8 rounded-full p-0 ${TIME_BLOCK_COLORS[color as keyof typeof TIME_BLOCK_COLORS]} ${newBlockColor === color ? 'border-2 border-black' : ''}`}
                    onClick={() => setNewBlockColor(color as keyof typeof TIME_BLOCK_COLORS)}
                  />
                ))}
              </div>
            </div>
            
            {projects.length > 0 && (
              <div className="space-y-2">
                <Label>Associated Project</Label>
                <Select
                  value={newBlockProject}
                  onValueChange={setNewBlockProject}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recurring"
                  checked={newBlockIsRecurring}
                  onCheckedChange={(checked) => setNewBlockIsRecurring(!!checked)}
                />
                <Label htmlFor="recurring">Recurring Time Block</Label>
              </div>
              
              {newBlockIsRecurring && (
                <div className="pt-2">
                  <Label className="mb-1 block">Repeat on</Label>
                  <div className="flex flex-wrap gap-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant="outline"
                        className={`w-8 h-8 rounded-full p-0 ${newBlockRecurringDays.includes(index) ? 'bg-primary text-primary-foreground' : ''}`}
                        onClick={() => {
                          setNewBlockRecurringDays(
                            newBlockRecurringDays.includes(index)
                              ? newBlockRecurringDays.filter(d => d !== index)
                              : [...newBlockRecurringDays, index]
                          );
                        }}
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="block-notes">Notes (optional)</Label>
              <Input
                id="block-notes"
                placeholder="Any additional details"
                value={newBlockNotes}
                onChange={(e) => setNewBlockNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            {editingBlock && (
              <Button 
                variant="destructive" 
                onClick={() => {
                  deleteTimeBlock(editingBlock.id);
                  setNewBlockDialogOpen(false);
                }}
                className="mr-auto"
              >
                Delete
              </Button>
            )}
            <Button variant="outline" onClick={() => setNewBlockDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (editingBlock) {
                  // Update existing block
                  const startTime = new Date(newBlockStart);
                  const endTime = addHours(startTime, newBlockDuration / 60);
                  
                  updateTimeBlock(editingBlock.id, {
                    title: newBlockTitle,
                    startTime,
                    endTime,
                    colorKey: newBlockColor,
                    projectId: newBlockProject,
                    isRecurring: newBlockIsRecurring,
                    recurringDays: newBlockIsRecurring ? newBlockRecurringDays : undefined,
                    notes: newBlockNotes,
                  });
                  
                  setNewBlockDialogOpen(false);
                } else {
                  // Add new block
                  addTimeBlock();
                }
              }}
              disabled={!newBlockTitle.trim() || (!isAuthenticated && remainingUses <= 0)}
            >
              {editingBlock ? 'Update' : 'Add'} Block
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for adding/editing projects */}
      <ProjectDialog
        open={newProjectDialogOpen}
        onOpenChange={setNewProjectDialogOpen}
        onSave={addProject}
        editingProject={editingProject}
        isAuthenticated={isAuthenticated}
        remainingUses={remainingUses}
      />
      
      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        onSuccess={handleSuccessfulAuth}
      />
    </Card>
  );
}; 