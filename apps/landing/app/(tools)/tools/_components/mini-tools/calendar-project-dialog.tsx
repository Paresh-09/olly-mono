'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@repo/ui/components/ui/dialog';
import { Input } from '@repo/ui/components/ui/input';
import { Label } from '@repo/ui/components/ui/label';
import { Calendar } from '@repo/ui/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

// Define the color options (shared with the main component)
const TIME_BLOCK_COLORS = {
  red: 'bg-red-100 border-red-400 text-red-800',
  blue: 'bg-blue-100 border-blue-400 text-blue-800',
  green: 'bg-green-100 border-green-400 text-green-800',
  yellow: 'bg-yellow-100 border-yellow-400 text-yellow-800',
  purple: 'bg-purple-100 border-purple-400 text-purple-800',
  gray: 'bg-gray-100 border-gray-400 text-gray-800',
};

// Define the project interface
interface Project {
  id: string;
  name: string;
  deadline?: Date;
  priority: 'high' | 'medium' | 'low';
  estimatedHours: number;
  colorKey: keyof typeof TIME_BLOCK_COLORS;
  completedHours: number;
}

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (project: Project) => void;
  editingProject: Project | null;
  isAuthenticated: boolean;
  remainingUses: number;
}

export const ProjectDialog = ({
  open,
  onOpenChange,
  onSave,
  editingProject,
  isAuthenticated,
  remainingUses
}: ProjectDialogProps) => {
  // Form state
  const [projectName, setProjectName] = useState('');
  const [projectDeadline, setProjectDeadline] = useState<Date | undefined>(undefined);
  const [projectPriority, setProjectPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [projectEstimatedHours, setProjectEstimatedHours] = useState(10);
  const [projectColor, setProjectColor] = useState<keyof typeof TIME_BLOCK_COLORS>('green');
  
  // Initialize form when editing project
  useEffect(() => {
    if (editingProject) {
      setProjectName(editingProject.name);
      setProjectDeadline(editingProject.deadline);
      setProjectPriority(editingProject.priority);
      setProjectEstimatedHours(editingProject.estimatedHours);
      setProjectColor(editingProject.colorKey);
    } else {
      // Reset form for new project
      setProjectName('');
      setProjectDeadline(undefined);
      setProjectPriority('medium');
      setProjectEstimatedHours(10);
      setProjectColor('green');
    }
  }, [editingProject, open]);
  
  // Save project
  const handleSave = () => {
    if (!projectName.trim()) return;
    
    const project: Project = {
      id: editingProject?.id || `project-${Date.now()}`,
      name: projectName,
      deadline: projectDeadline,
      priority: projectPriority,
      estimatedHours: projectEstimatedHours,
      colorKey: projectColor,
      completedHours: editingProject?.completedHours || 0,
    };
    
    onSave(project);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editingProject ? 'Edit Project' : 'New Project'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              placeholder="Enter project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Deadline (optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {projectDeadline ? format(projectDeadline, 'PPP') : 'Select a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={projectDeadline}
                  onSelect={setProjectDeadline}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={projectPriority}
                onValueChange={(value) => setProjectPriority(value as 'high' | 'medium' | 'low')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="estimated-hours">Estimated Hours</Label>
              <Input
                id="estimated-hours"
                type="number"
                min="1"
                max="1000"
                value={projectEstimatedHours}
                onChange={(e) => setProjectEstimatedHours(Number(e.target.value))}
              />
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
                  className={`w-8 h-8 rounded-full p-0 ${TIME_BLOCK_COLORS[color as keyof typeof TIME_BLOCK_COLORS]} ${projectColor === color ? 'border-2 border-black' : ''}`}
                  onClick={() => setProjectColor(color as keyof typeof TIME_BLOCK_COLORS)}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!projectName.trim() || (!isAuthenticated && remainingUses <= 0)}
          >
            {editingProject ? 'Update' : 'Create'} Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 