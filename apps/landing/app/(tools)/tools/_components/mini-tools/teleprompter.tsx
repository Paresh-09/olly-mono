'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs'
import { Label } from '@repo/ui/components/ui/label'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Slider } from '@repo/ui/components/ui/slider'
import { Input } from '@repo/ui/components/ui/input'
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Settings,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Save,
  Trash2,
  FileText,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Clock
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select"

// Types
interface TeleprompterSettings {
  scrollSpeed: number;
  fontSize: number;
  backgroundColor: string;
  textColor: string;
  mirror: boolean;
  lineHeight: number;
  fontFamily: string;
  smoothScrolling: boolean;
  fadeEdges: boolean;
}

interface SavedScript {
  id: string;
  title: string;
  content: string;
  lastEdited: number;
}

// Default settings
const defaultSettings: TeleprompterSettings = {
  scrollSpeed: 2,
  fontSize: 36,
  backgroundColor: '#000000',
  textColor: '#ffffff',
  mirror: false,
  lineHeight: 1.5,
  fontFamily: 'Arial',
  smoothScrolling: true,
  fadeEdges: true
};

export const Teleprompter: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState('input');
  const [script, setScript] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [settings, setSettings] = useState<TeleprompterSettings>(defaultSettings);
  const [savedScripts, setSavedScripts] = useState<SavedScript[]>([]);
  const [currentScriptTitle, setCurrentScriptTitle] = useState('Untitled Script');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Refs
  const prompterRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved scripts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('teleprompterScripts');
    if (saved) {
      try {
        setSavedScripts(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading saved scripts', e);
      }
    }

    const savedSettings = localStorage.getItem('teleprompterSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Error loading saved settings', e);
      }
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('teleprompterSettings', JSON.stringify(settings));
  }, [settings]);

  // Control scrolling
  useEffect(() => {
    if (isPlaying && prompterRef.current) {
      // Clear any existing interval
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }

      // Set up scrolling interval
      scrollIntervalRef.current = setInterval(() => {
        if (prompterRef.current) {
          prompterRef.current.scrollTop += settings.scrollSpeed;
        }
      }, 16); // ~60fps
    } else if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }

    // Clean up on unmount
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [isPlaying, settings.scrollSpeed]);

  // Handle script changes
  const handleScriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setScript(e.target.value);
  };

  // Handle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Jump to start
  const jumpToStart = () => {
    if (prompterRef.current) {
      prompterRef.current.scrollTop = 0;
    }
  };

  // Jump to end
  const jumpToEnd = () => {
    if (prompterRef.current) {
      prompterRef.current.scrollTop = prompterRef.current.scrollHeight;
    }
  };

  // Update settings
  const updateSettings = (key: keyof TeleprompterSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Save current script
  const saveCurrentScript = () => {
    if (!script.trim()) return;

    const newScript: SavedScript = {
      id: Date.now().toString(),
      title: currentScriptTitle,
      content: script,
      lastEdited: Date.now()
    };

    const updatedScripts = [...savedScripts, newScript];
    setSavedScripts(updatedScripts);
    localStorage.setItem('teleprompterScripts', JSON.stringify(updatedScripts));
  };

  // Load a saved script
  const loadScript = (scriptId: string) => {
    const scriptToLoad = savedScripts.find(s => s.id === scriptId);
    if (scriptToLoad) {
      setScript(scriptToLoad.content);
      setCurrentScriptTitle(scriptToLoad.title);
      setActiveTab('input');
    }
  };

  // Delete a saved script
  const deleteScript = (scriptId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedScripts = savedScripts.filter(s => s.id !== scriptId);
    setSavedScripts(updatedScripts);
    localStorage.setItem('teleprompterScripts', JSON.stringify(updatedScripts));
  };

  // Format timestamp for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Clear current script
  const clearScript = () => {
    if (window.confirm('Are you sure you want to clear the current script?')) {
      setScript('');
      setCurrentScriptTitle('Untitled Script');
    }
  };

  // Enter fullscreen
  const enterFullscreen = () => {
    if (prompterRef.current && prompterRef.current.parentElement) {
      if (prompterRef.current.parentElement.requestFullscreen) {
        prompterRef.current.parentElement.requestFullscreen();
      }
    }
  };

  // Add effect to detect fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Calculate reading time
  const calculateReadingTime = () => {
    const words = script.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 150); // Average reading speed of 150 words per minute
    return minutes === 1 ? '1 minute' : `${minutes} minutes`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="input">Script Input</TabsTrigger>
              <TabsTrigger value="teleprompter">Teleprompter View</TabsTrigger>
              <TabsTrigger value="saved">Saved Scripts</TabsTrigger>
            </TabsList>

            {/* Script Input Tab */}
            <TabsContent value="input" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <FileText size={18} />
                    <Label htmlFor="script-title" className="text-base font-medium">Script Title</Label>
                  </div>
                  <Input
                    id="script-title"
                    value={currentScriptTitle}
                    onChange={(e) => setCurrentScriptTitle(e.target.value)}
                    placeholder="Enter a title for your script"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={clearScript}>
                    <Trash2 size={16} className="mr-1" />
                    Clear
                  </Button>
                  <Button variant="outline" size="sm" onClick={saveCurrentScript}>
                    <Save size={16} className="mr-1" />
                    Save
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="script-content" className="text-base font-medium">Script Content</Label>
                  </div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Clock size={14} className="mr-1" />
                    Reading time: {calculateReadingTime()}
                  </div>
                </div>
                <Textarea
                  id="script-content"
                  value={script}
                  onChange={handleScriptChange}
                  placeholder="Enter your script here..."
                  className="min-h-64 font-mono"
                />
              </div>

              <div className="pt-4 flex justify-between">
                <Button
                  variant="default"
                  onClick={() => setActiveTab('teleprompter')}
                  disabled={!script.trim()}
                >
                  Go to Teleprompter View
                </Button>

                <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Settings size={16} className="mr-1" />
                      Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Teleprompter Settings</DialogTitle>
                      <DialogDescription>
                        Customize the teleprompter appearance and behavior
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="scroll-speed">Scroll Speed</Label>
                        <div className="flex items-center space-x-4">
                          <Slider
                            id="scroll-speed"
                            min={0.5}
                            max={10}
                            step={0.5}
                            value={[settings.scrollSpeed]}
                            onValueChange={(value) => updateSettings('scrollSpeed', value[0])}
                            className="flex-1"
                          />
                          <span className="w-10 text-center">{settings.scrollSpeed}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="font-size">Font Size</Label>
                        <div className="flex items-center space-x-4">
                          <Slider
                            id="font-size"
                            min={16}
                            max={72}
                            step={2}
                            value={[settings.fontSize]}
                            onValueChange={(value) => updateSettings('fontSize', value[0])}
                            className="flex-1"
                          />
                          <span className="w-10 text-center">{settings.fontSize}px</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="line-height">Line Height</Label>
                        <div className="flex items-center space-x-4">
                          <Slider
                            id="line-height"
                            min={1}
                            max={3}
                            step={0.1}
                            value={[settings.lineHeight]}
                            onValueChange={(value) => updateSettings('lineHeight', value[0])}
                            className="flex-1"
                          />
                          <span className="w-10 text-center">{settings.lineHeight}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="font-family">Font Family</Label>
                        <Select
                          value={settings.fontFamily}
                          onValueChange={(value) => updateSettings('fontFamily', value)}
                        >
                          <SelectTrigger id="font-family">
                            <SelectValue placeholder="Select font" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Arial">Arial</SelectItem>
                            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                            <SelectItem value="Courier New">Courier New</SelectItem>
                            <SelectItem value="Georgia">Georgia</SelectItem>
                            <SelectItem value="Verdana">Verdana</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bg-color">Background Color</Label>
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: settings.backgroundColor }}
                          ></div>
                          <Input
                            id="bg-color"
                            type="color"
                            value={settings.backgroundColor}
                            onChange={(e) => updateSettings('backgroundColor', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="text-color">Text Color</Label>
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: settings.textColor }}
                          ></div>
                          <Input
                            id="text-color"
                            type="color"
                            value={settings.textColor}
                            onChange={(e) => updateSettings('textColor', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="mirror-text"
                          checked={settings.mirror}
                          onChange={(e) => updateSettings('mirror', e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="mirror-text">Mirror Text</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="smooth-scrolling"
                          checked={settings.smoothScrolling}
                          onChange={(e) => updateSettings('smoothScrolling', e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="smooth-scrolling">Smooth Scrolling</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="fade-edges"
                          checked={settings.fadeEdges}
                          onChange={(e) => updateSettings('fadeEdges', e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="fade-edges">Fade Edges</Label>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => setSettings(defaultSettings)}
                      >
                        Reset to Default
                      </Button>
                      <Button onClick={() => setIsSettingsOpen(false)}>
                        Apply Settings
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </TabsContent>

            {/* Teleprompter View Tab */}
            <TabsContent value="teleprompter" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">{currentScriptTitle}</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => updateSettings('fontSize', settings.fontSize - 2)}>
                    <ZoomOut size={16} />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => updateSettings('fontSize', settings.fontSize + 2)}>
                    <ZoomIn size={16} />
                  </Button>
                  <Button variant="outline" size="sm" onClick={enterFullscreen}>
                    Fullscreen
                  </Button>
                </div>
              </div>

              <div className="relative w-full" style={{ height: 'calc(100vh - 300px)', minHeight: '400px' }}>
                {/* Teleprompter container with controls */}
                <div
                  className={`relative ${isFullscreen ? 'fixed inset-0 z-50 flex flex-col' : 'w-full h-full'}`}
                  style={{
                    backgroundColor: settings.backgroundColor,
                  }}
                >
                  {/* Script container */}
                  <div
                    className={`${isFullscreen ? 'flex-grow' : 'absolute inset-0'} overflow-auto`}
                    style={{
                      scrollBehavior: settings.smoothScrolling ? 'smooth' : 'auto',
                    }}
                    ref={prompterRef}
                  >
                    {/* Fade top edge */}
                    {settings.fadeEdges && (
                      <div className="absolute top-0 left-0 right-0 h-16 z-10 pointer-events-none"
                        style={{
                          background: `linear-gradient(to bottom, ${settings.backgroundColor}, transparent)`
                        }}
                      />
                    )}

                    {/* Script text */}
                    <div
                      className="p-8 whitespace-pre-wrap"
                      style={{
                        color: settings.textColor,
                        fontSize: `${settings.fontSize}px`,
                        fontFamily: settings.fontFamily,
                        lineHeight: settings.lineHeight,
                        transform: settings.mirror ? 'scaleX(-1)' : 'none',
                        paddingTop: '100px',
                        paddingBottom: '100px',
                      }}
                    >
                      {script}
                    </div>

                    {/* Fade bottom edge - adjusted to prevent dark line */}
                    {settings.fadeEdges && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-16 z-10 pointer-events-none"
                        style={{
                          background: `linear-gradient(to top, ${settings.backgroundColor}, transparent)`,
                          bottom: '0px'
                        }}
                      />
                    )}
                  </div>

                  {/* Fullscreen controls - shown only in fullscreen mode */}
                  {isFullscreen && (
                    <div
                      className="p-4 flex flex-col items-center space-y-4"
                      style={{ backgroundColor: settings.backgroundColor }}
                    >
                      {/* Playback controls */}
                      <div className="flex justify-center space-x-4 items-center">
                        <Button variant="outline" onClick={jumpToStart}>
                          <SkipBack size={20} />
                        </Button>
                        <Button onClick={togglePlayPause} className="w-24">
                          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                        </Button>
                        <Button variant="outline" onClick={jumpToEnd}>
                          <SkipForward size={20} />
                        </Button>
                      </div>

                      {/* Speed controls */}
                      <div className="flex items-center justify-center space-x-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateSettings('scrollSpeed', Math.max(0.5, settings.scrollSpeed - 0.5))}
                        >
                          <ChevronDown size={16} className="mr-1" />
                          Slower
                        </Button>
                        <div className="text-center" style={{ color: settings.textColor }}>
                          <div className="text-sm opacity-80">Scroll Speed</div>
                          <div className="font-medium">{settings.scrollSpeed}</div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateSettings('scrollSpeed', Math.min(10, settings.scrollSpeed + 0.5))}
                        >
                          <ChevronUp size={16} className="mr-1" />
                          Faster
                        </Button>
                      </div>

                      {/* Exit fullscreen button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.exitFullscreen()}
                      >
                        Exit Fullscreen
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Non-fullscreen controls - only shown when not in fullscreen */}
              {!isFullscreen && (
                <>
                  {/* Playback controls */}
                  <div className="flex justify-center space-x-4 p-4 items-center">
                    <Button variant="outline" onClick={jumpToStart}>
                      <SkipBack size={20} />
                    </Button>
                    <Button onClick={togglePlayPause} className="w-24">
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </Button>
                    <Button variant="outline" onClick={jumpToEnd}>
                      <SkipForward size={20} />
                    </Button>
                  </div>

                  {/* Speed controls */}
                  <div className="flex items-center justify-center space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSettings('scrollSpeed', Math.max(0.5, settings.scrollSpeed - 0.5))}
                    >
                      <ChevronDown size={16} className="mr-1" />
                      Slower
                    </Button>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Scroll Speed</div>
                      <div className="font-medium">{settings.scrollSpeed}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSettings('scrollSpeed', Math.min(10, settings.scrollSpeed + 0.5))}
                    >
                      <ChevronUp size={16} className="mr-1" />
                      Faster
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Saved Scripts Tab */}
            <TabsContent value="saved" className="space-y-4">
              <h3 className="text-lg font-medium">Your Saved Scripts</h3>

              {savedScripts.length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                  <p>You don't have any saved scripts yet.</p>
                  <p className="text-sm mt-2">Write a script and save it to see it here.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedScripts.map(savedScript => (
                    <Card
                      key={savedScript.id}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => loadScript(savedScript.id)}
                    >
                      <CardContent className="p-4 flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{savedScript.title}</h4>
                          <p className="text-sm text-gray-500">
                            Last edited: {formatDate(savedScript.lastEdited)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {savedScript.content.split(/\s+/).length} words
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => deleteScript(savedScript.id, e)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};