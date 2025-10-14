'use client';

import { useState, useEffect, useRef } from 'react';
import { format, parseISO, isToday, isBefore, subDays } from 'date-fns';
import { Button } from '@repo/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Textarea } from '@repo/ui/components/ui/textarea';
import { Switch } from '@repo/ui/components/ui/switch';
import { Label } from '@repo/ui/components/ui/label';
import { toast } from '@repo/ui/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@repo/ui/components/ui/alert-dialog';
import { Mic, MicOff, Calendar, Trash2, Edit, Save, X, CalendarIcon, PlusCircle, Sparkles } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui/components/ui/popover';
import { Calendar as CalendarComponent } from '@repo/ui/components/ui/calendar';
import { cn } from '@/lib/utils';
import TrajectoryButton from './TrajectoryButton';

// Add TypeScript interfaces for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  error: any;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
}

// Extend Window interface
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface DailyVlog {
  id: string;
  date: string;
  content: string;
  transcription: string;
  isPublic: boolean;
  reminderEnabled: boolean;
  createdAt: string;
  enhanced?: boolean;
}

export default function DailyVlogContent() {
  const [vlogs, setVlogs] = useState<DailyVlog[]>([]);
  const [selectedVlog, setSelectedVlog] = useState<DailyVlog | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [enhanceWithAI, setEnhanceWithAI] = useState(false);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [isLoadingCredits, setIsLoadingCredits] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  useEffect(() => {
    loadVlogs();
    loadUserCredits();
    
    // Check if browser supports speech recognition
    if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        recognitionRef.current = new SpeechRecognitionAPI();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              transcript += event.results[i][0].transcript + ' ';
            }
          }
          setTranscription(prev => prev + transcript);
        };
        
        recognitionRef.current.onerror = (event: SpeechRecognitionEvent) => {
          console.error('Speech recognition error', event.error);
          stopRecording();
          toast({
            title: 'Error',
            description: `Speech recognition error: ${event.error}`,
            variant: 'destructive',
          });
        };
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        stopRecording();
      }
    };
  }, []);
  
  const loadVlogs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/daily-vlog');
      const data = await response.json();
      
      if (data.vlogs) {
        const sortedVlogs = data.vlogs.sort((a: DailyVlog, b: DailyVlog) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setVlogs(sortedVlogs);
        
        // Check if there's a vlog for today
        const today = format(new Date(), 'yyyy-MM-dd');
        const todayEntry = sortedVlogs.find((vlog: DailyVlog) => 
          format(new Date(vlog.date), 'yyyy-MM-dd') === today
        );
        
        if (todayEntry) {
          setSelectedVlog(todayEntry);
        } else if (sortedVlogs.length > 0) {
          setSelectedVlog(sortedVlogs[0]);
        }
      }
    } catch (error) {
      console.error('Error loading vlogs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your vlogs. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadUserCredits = async () => {
    try {
      setIsLoadingCredits(true);
      const response = await fetch('/api/user/credits');
      const data = await response.json();
      
      if (data.success) {
        setUserCredits(data.balance);
      }
    } catch (error) {
      console.error('Error loading user credits:', error);
    } finally {
      setIsLoadingCredits(false);
    }
  };
  
  const startRecording = () => {
    if (!recognitionRef.current) {
      toast({
        title: 'Error',
        description: 'Speech recognition is not supported in your browser.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      recognitionRef.current.start();
      setIsRecording(true);
      toast({
        title: 'Recording started',
        description: 'Speak clearly into your microphone.',
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Error',
        description: 'Failed to start recording. Please check your microphone permissions.',
        variant: 'destructive',
      });
    }
  };
  
  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
      setIsRecording(false);
      toast({
        title: 'Recording stopped',
        description: 'Your speech has been transcribed to text.',
      });
    }
  };
  
  const handleSubmit = async () => {
    if (!transcription.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some text for your daily vlog.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Process the input text with or without AI
      const processResponse = await fetch('/api/daily-vlog/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          transcription: transcription,
          enhanceWithAI: enhanceWithAI
        }),
      });
      
      if (!processResponse.ok) {
        const errorData = await processResponse.json();
        if (processResponse.status === 402) {
          toast({
            title: 'Insufficient Credits',
            description: 'You need at least 0.5 credits to enhance with AI. Your entry will be saved as-is.',
            variant: 'destructive',
          });
          // Fall back to non-AI processing
          setEnhanceWithAI(false);
          return handleSubmit();
        }
        throw new Error(errorData.error || 'Failed to process input text');
      }
      
      const processData = await processResponse.json();
      
      // Save the vlog entry with the selected date
      const saveResponse = await fetch('/api/daily-vlog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcription: processData.transcription,
          content: processData.content,
          isPublic: false,
          reminderEnabled: false,
          date: date?.toISOString() || new Date().toISOString(),
          enhanced: processData.enhanced
        }),
      });
      
      if (!saveResponse.ok) {
        throw new Error('Failed to save vlog entry');
      }
      
      const savedVlog = await saveResponse.json();
      setSelectedVlog(savedVlog);
      setTranscription('');
      setIsCreatingNew(false);
      
      // Refresh the vlogs list
      loadVlogs();
      
      toast({
        title: 'Success',
        description: processData.enhanced 
          ? 'Your daily vlog has been enhanced with AI and saved!' 
          : 'Your daily vlog has been saved as-is!',
      });
    } catch (error) {
      console.error('Error processing vlog:', error);
      toast({
        title: 'Error',
        description: 'Failed to process your vlog. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const toggleVlogSetting = async (vlogId: string, field: 'isPublic' | 'reminderEnabled', value: boolean) => {
    try {
      const response = await fetch(`/api/daily-vlog/${vlogId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: value }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update vlog settings');
      }
      
      // Update local state
      setVlogs(vlogs.map(vlog => 
        vlog.id === vlogId ? { ...vlog, [field]: value } : vlog
      ));
      
      if (selectedVlog && selectedVlog.id === vlogId) {
        setSelectedVlog({ ...selectedVlog, [field]: value });
      }
      
      toast({
        title: 'Settings Updated',
        description: `Vlog settings have been updated.`,
      });
    } catch (error) {
      console.error('Error updating vlog settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update vlog settings. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const deleteVlog = async (vlogId: string) => {
    try {
      const response = await fetch(`/api/daily-vlog/${vlogId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete vlog');
      }
      
      // Update local state
      const updatedVlogs = vlogs.filter(vlog => vlog.id !== vlogId);
      setVlogs(updatedVlogs);
      
      // If the deleted vlog was selected, select another one
      if (selectedVlog && selectedVlog.id === vlogId) {
        if (updatedVlogs.length > 0) {
          setSelectedVlog(updatedVlogs[0]);
        } else {
          setSelectedVlog(null);
        }
      }
      
      toast({
        title: 'Vlog Deleted',
        description: 'Your vlog entry has been deleted.',
      });
    } catch (error) {
      console.error('Error deleting vlog:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete vlog. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const startEditing = () => {
    if (selectedVlog) {
      setEditText(selectedVlog.content);
      setIsEditing(true);
    }
  };
  
  const saveEdit = async () => {
    if (!selectedVlog || !editText.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      // Process the edited text with or without AI
      const processResponse = await fetch('/api/daily-vlog/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          transcription: editText,
          enhanceWithAI: enhanceWithAI
        }),
      });
      
      if (!processResponse.ok) {
        const errorData = await processResponse.json();
        if (processResponse.status === 402) {
          toast({
            title: 'Insufficient Credits',
            description: 'You need at least 0.5 credits to enhance with AI. Your entry will be saved as-is.',
            variant: 'destructive',
          });
          // Fall back to non-AI processing
          setEnhanceWithAI(false);
          return saveEdit();
        }
        throw new Error(errorData.error || 'Failed to process edited text');
      }
      
      const processData = await processResponse.json();
      
      // Update the vlog entry
      const updateResponse = await fetch(`/api/daily-vlog/${selectedVlog.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcription: processData.transcription,
          content: processData.content,
          enhanced: processData.enhanced
        }),
      });
      
      if (!updateResponse.ok) {
        throw new Error('Failed to update vlog entry');
      }
      
      const updatedVlog = await updateResponse.json();
      
      // Update local state
      setVlogs(vlogs.map(vlog => 
        vlog.id === updatedVlog.id ? updatedVlog : vlog
      ));
      setSelectedVlog(updatedVlog);
      setIsEditing(false);
      
      toast({
        title: 'Success',
        description: processData.enhanced 
          ? 'Your vlog entry has been enhanced with AI and updated!' 
          : 'Your vlog entry has been updated as-is!',
      });
    } catch (error) {
      console.error('Error updating vlog:', error);
      toast({
        title: 'Error',
        description: 'Failed to update your vlog. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const cancelEdit = () => {
    setIsEditing(false);
    setEditText('');
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'EEEE, MMMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  const startNewEntry = () => {
    setSelectedVlog(null);
    setTranscription('');
    setDate(new Date());
    setIsCreatingNew(true);
  };
  
  const checkDateHasEntry = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return vlogs.some(vlog => format(new Date(vlog.date), 'yyyy-MM-dd') === dateStr);
  };
  
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Check if there's already an entry for this date
    const dateStr = format(date, 'yyyy-MM-dd');
    const existingVlog = vlogs.find(vlog => 
      format(new Date(vlog.date), 'yyyy-MM-dd') === dateStr
    );
    
    if (existingVlog) {
      // If entry exists, select it
      setSelectedVlog(existingVlog);
      setIsCreatingNew(false);
    } else {
      // If no entry exists, set up to create a new one
      setDate(date);
      setSelectedVlog(null);
      setTranscription('');
      setIsCreatingNew(true);
    }
  };
  
  const renderVlogList = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      );
    }
    
    if (vlogs.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">You haven't created any vlog entries yet.</p>
          <Button onClick={startNewEntry}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Your First Entry
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Entries</h2>
          <div className="flex gap-2">
            {userCredits > 0 && (
              <TrajectoryButton userCredits={userCredits} />
            )}
            <Button onClick={startNewEntry} variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Entry
            </Button>
          </div>
        </div>
        
        <div className="space-y-2 border rounded-md p-2 bg-background">
          {vlogs.map((vlog) => (
            <div 
              key={vlog.id} 
              className={cn(
                "p-3 hover:bg-muted cursor-pointer border-b last:border-b-0",
                selectedVlog?.id === vlog.id ? "bg-muted" : ""
              )}
              onClick={() => setSelectedVlog(vlog)}
            >
              <div className="flex justify-between items-center">
                <div className="font-medium">
                  {formatDate(vlog.date)}
                  {isToday(new Date(vlog.date)) && (
                    <span className="ml-2 text-xs text-muted-foreground">(Today)</span>
                  )}
                  {vlog.enhanced && (
                    <span className="ml-2 inline-flex items-center text-xs text-yellow-500">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Enhanced
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selectedVlog?.id === vlog.id) {
                        setIsEditing(true);
                        setEditText(vlog.content);
                      } else {
                        setSelectedVlog(vlog);
                        setTimeout(() => {
                          setIsEditing(true);
                          setEditText(vlog.content);
                        }, 100);
                      }
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-destructive"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Vlog Entry</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this vlog entry? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteVlog(vlog.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {vlog.content.substring(0, 150)}...
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="grid grid-cols-1 gap-6">
        {isCreatingNew ? (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>New Vlog Entry</CardTitle>
                <div className="flex items-center gap-2">
                  <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => setIsDatePickerOpen(true)}
                      >
                        <CalendarIcon className="h-4 w-4" />
                        {date ? format(date, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        disabled={(date) => isBefore(date, subDays(new Date(), 30))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setIsCreatingNew(false);
                      if (selectedVlog) {
                        setIsEditing(false);
                      }
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                Record or type your thoughts for {date ? format(date, 'MMMM d, yyyy') : 'today'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      size="icon"
                      variant={isRecording ? "destructive" : "outline"}
                      onClick={isRecording ? stopRecording : startRecording}
                    >
                      {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                    <span className="text-sm">
                      {isRecording ? 'Recording...' : 'Click to record'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enhance-ai"
                      checked={enhanceWithAI}
                      onCheckedChange={setEnhanceWithAI}
                    />
                    <Label htmlFor="enhance-ai" className="flex items-center gap-1">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      Enhance with AI
                      <span className="text-xs text-muted-foreground">(0.5 credits)</span>
                    </Label>
                  </div>
                </div>
                <Textarea
                  placeholder="Start typing or recording your thoughts..."
                  className="min-h-[200px]"
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                />
                <Button 
                  className="w-full" 
                  onClick={handleSubmit}
                  disabled={isSubmitting || !transcription.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⟳</span>
                      Saving...
                    </>
                  ) : (
                    'Save Entry'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : selectedVlog ? (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>{formatDate(selectedVlog.date)}</CardTitle>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={saveEdit} disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <span className="animate-spin mr-2">⟳</span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save
                          </>
                        )}
                      </Button>
                      <Button variant="ghost" onClick={cancelEdit}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" onClick={startEditing}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Vlog Entry</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this vlog entry? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteVlog(selectedVlog.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </div>
              {selectedVlog.enhanced && (
                <div className="flex items-center text-xs text-yellow-500 mt-1">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Enhanced
                </div>
              )}
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  className="min-h-[300px]"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {selectedVlog.content.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}
        
        {renderVlogList()}
      </div>
    </div>
  );
} 