'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Input } from '@repo/ui/components/ui/input';
import { Label } from '@repo/ui/components/ui/label';
import { 
  Pause, 
  Play, 
  RefreshCw, 
  Clock, 
  ListTodo,
  Coffee,
  Moon
} from 'lucide-react';

type TimerMode = 'work' | 'short-break' | 'long-break' ;

interface Task {
  id: string;
  name: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
}

export const PomodoroTimer = () => {
  // Timer settings (in minutes)
  const [workDuration, setWorkDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(20);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentMode, setCurrentMode] = useState<TimerMode>('work');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  // Task management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskEstimatedPomodoros, setNewTaskEstimatedPomodoros] = useState(1);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  // Refs for timer management
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start the timer
  const startTimer = () => {
    if (isRunning) return;
    
    setIsRunning(true);
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          // Switch modes when time runs out
          handleTimerComplete();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  // Pause the timer
  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  };

  // Reset the timer
  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Reset to initial work duration or current mode's duration
    switch (currentMode) {
      case 'work':
        setTimeLeft(workDuration * 60);
        break;
      case 'short-break':
        setTimeLeft(shortBreakDuration * 60);
        break;
      case 'long-break':
        setTimeLeft(longBreakDuration * 60);
        break;
    }
    setIsRunning(false);
  };

  // Handle timer completion
  const handleTimerComplete = () => {
    // Stop the current timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);

    // Determine next mode
    switch (currentMode) {
      case 'work':
        // Increment completed pomodoros
        const newCompletedPomodoros = completedPomodoros + 1;
        setCompletedPomodoros(newCompletedPomodoros);

        // Update current task if exists
        if (currentTask) {
          const updatedTasks = tasks.map(task => 
            task.id === currentTask.id 
              ? { ...task, completedPomodoros: task.completedPomodoros + 1 }
              : task
          );
          setTasks(updatedTasks);

          // Check if task is completed
          const updatedTask = updatedTasks.find(t => t.id === currentTask.id);
          if (updatedTask && updatedTask.completedPomodoros >= updatedTask.estimatedPomodoros) {
            // Remove completed task
            setTasks(updatedTasks.filter(t => t.id !== currentTask.id));
            setCurrentTask(null);
          }
        }

        // Determine break type based on completed pomodoros
        if (newCompletedPomodoros % 4 === 0) {
          setCurrentMode('long-break');
          setTimeLeft(longBreakDuration * 60);
        } else {
          setCurrentMode('short-break');
          setTimeLeft(shortBreakDuration * 60);
        }
        break;
      case 'short-break':
      case 'long-break':
        setCurrentMode('work');
        setTimeLeft(workDuration * 60);
        break;
    }
  };




  // Add a new task
  const addTask = () => {
    if (!newTaskName.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      name: newTaskName,
      estimatedPomodoros: newTaskEstimatedPomodoros,
      completedPomodoros: 0
    };

    setTasks([...tasks, newTask]);
    setNewTaskName('');
    setNewTaskEstimatedPomodoros(1);
  };

  // Remove a task
  const removeTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    if (currentTask?.id === taskId) {
      setCurrentTask(null);
    }
  };

  // Select a task to work on
  const selectTask = (task: Task) => {
    setCurrentTask(task);
    // Reset timer to work duration when selecting a new task
    setTimeLeft(workDuration * 60);
    setCurrentMode('work');
    setIsRunning(false);
  };

  // Format time to MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Determine timer color based on mode
  const getTimerColor = () => {
    switch (currentMode) {
      case 'work': return 'text-red-500';
      case 'short-break': return 'text-green-500';
      case 'long-break': return 'text-blue-500';
      
    }
  };

  // Get mode title
  const getModeTile = () => {
    switch (currentMode) {
      case 'work': return 'Focus Time';
      case 'short-break': return 'Short Break';
      case 'long-break': return 'Long Break';

    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center flex justify-between items-center">
          <span>{getModeTile()}</span>
          <div className="text-sm text-muted-foreground">
            Completed Pomodoros: {completedPomodoros}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
        {/* Timer Section */}
        <div className="space-y-6">
          {/* Timer Settings */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label>Work Time (min)</Label>
              <Input 
                type="number" 
                value={workDuration} 
                onChange={(e) => setWorkDuration(Number(e.target.value))}
                min={1} 
                max={60}
              />
            </div>
            <div>
              <Label>Short Break (min)</Label>
              <Input 
                type="number" 
                value={shortBreakDuration} 
                onChange={(e) => setShortBreakDuration(Number(e.target.value))}
                min={1} 
                max={30}
              />
            </div>
            <div>
              <Label>Long Break (min)</Label>
              <Input 
                type="number" 
                value={longBreakDuration} 
                onChange={(e) => setLongBreakDuration(Number(e.target.value))}
                min={1} 
                max={60}
              />
            </div>
          </div>

          {/* Timer Display */}
          <div className={`text-6xl font-bold text-center ${getTimerColor()}`}>
            {formatTime(timeLeft)}
          </div>

          {/* Control Buttons */}
          <div className="flex space-x-4 justify-center">
            {!isRunning ? (
              <Button 
                onClick={startTimer} 
                size="lg" 
                variant="default" 
                disabled={!currentTask && currentMode === 'work'}
              >
                <Play className="mr-2" /> Start
              </Button>
            ) : (
              <Button onClick={pauseTimer} size="lg" variant="secondary">
                <Pause className="mr-2" /> Pause
              </Button>
            )}
            
            <Button onClick={resetTimer} size="lg" variant="outline">
              <RefreshCw className="mr-2" /> Reset
            </Button>
          </div>

          {/* Additional Break Options */}
          <div className="flex justify-center space-x-4 mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setCurrentMode('short-break');
                setTimeLeft(shortBreakDuration * 60);
                setIsRunning(false);
              }}
            >
              <Coffee className="mr-2" /> {shortBreakDuration} min Break
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setCurrentMode('long-break');
                setTimeLeft(longBreakDuration * 60);
                setIsRunning(false);
              }}
            >
              <Moon className="mr-2" /> {longBreakDuration} min Long Break
            </Button>
          </div>


          {/* Timer Mode Description */}
          <div className="text-center text-sm text-muted-foreground">
            {currentMode === 'work' 
              ? 'Focus on your task and maintain concentration.' 
              : currentMode === 'short-break' 
                ? 'Take a short break to refresh your mind.' 
                : currentMode === 'long-break'
                  ? 'Enjoy a longer break before your next work session.'
                  : 'Take a custom break at your own pace.'}
          </div>
        </div>

        {/* Task Management Section */}
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input 
              placeholder="Enter task name" 
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
            />
            <Input 
              type="number" 
              value={newTaskEstimatedPomodoros}
              onChange={(e) => setNewTaskEstimatedPomodoros(Number(e.target.value))}
              min={1}
              max={10}
              className="w-20"
              placeholder="Est."
            />
            <Button onClick={addTask} variant="outline">
              Add Task
            </Button>
          </div>

          {/* Task List */}
          <div className="border rounded-lg p-4 max-h-[300px] overflow-y-auto">
            <h3 className="font-semibold mb-2 flex items-center">
              <ListTodo className="mr-2" /> Task List
            </h3>
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks added yet</p>
            ) : (
              <ul className="space-y-2">
                {tasks.map((task) => (
                  <li 
                    key={task.id} 
                    className={`flex justify-between items-center p-2 rounded ${
                      currentTask?.id === task.id ? 'bg-blue-100' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex-grow mr-2">
                      <span className="font-medium">{task.name}</span>
                      <div className="text-xs text-muted-foreground">
                        {task.completedPomodoros}/{task.estimatedPomodoros} Pomodoros
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant={currentTask?.id === task.id ? "default" : "outline"}
                        onClick={() => selectTask(task)}
                      >
                        {currentTask?.id === task.id ? 'Selected' : 'Select'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => removeTask(task.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Current Task Display */}
          {currentTask && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center">
                <Clock className="mr-2" /> Current Task
              </h3>
              <p className="text-sm">{currentTask.name}</p>
              <div className="text-xs text-muted-foreground">
                Completed {currentTask.completedPomodoros}/{currentTask.estimatedPomodoros} Pomodoros
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};