'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@repo/ui/components/ui/tabs'
import { Switch } from '@repo/ui/components/ui/switch'
import { useToast } from '@repo/ui/hooks/use-toast'
import { 
  Loader2, 
  Copy, 
  CheckSquare, 
  Download,
  Search,
  FileText,
  Bot,
  Clock,
  ListVideo,
  BookKey,
  HelpCircle,
  RefreshCw,
  Play,
  ThumbsUp,
  Calendar,
  Tag,
  ChevronDown,
  ChevronUp,
  Youtube,
  TrendingUp,
  BarChart3
} from 'lucide-react'
import { Badge } from '@repo/ui/components/ui/badge'
import { Progress } from '@repo/ui/components/ui/progress'

interface TranscriptSegment {
  timestamp: string;
  text: string;
  offset: number;
}

interface ViralityScore {
  overall: number;
  engagement: number;
  quality: number;
  trend: number;
  metrics: {
    viewToLikeRatio?: number;
    viewsPerDay?: number;
    commentEngagement?: number;
    contentQuality?: number;
    videoLength?: number;
    titleEffectiveness?: number;
    topicTrend?: number;
  };
  insights: string[];
  recommendations: string[];
}

interface TranscriptData {
  transcript: TranscriptSegment[];
  summary?: string;
  chapters?: string;
  keyPoints?: string;
  questions?: string;
  metadata: {
    videoId: string;
    language: string;
    thumbnailUrl: string;
    title?: string;
    duration?: number;
    channelName?: string;
    viewCount?: string;
    likeCount?: string;
    publishDate?: string;
    description?: string;
    categories?: string[];
    tags?: string[];
  }
  viralityScore?: ViralityScore;
}

type AIAction = 'summarize' | 'chapters' | 'key_points' | 'questions' | 'virality';
type TabType = 'transcript' | 'chapters' | 'summary' | 'keyPoints' | 'questions' | 'virality';

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Helper function to get score color
const getScoreColor = (score: number): string => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
};

export default function TranscriptViewer({ videoId }: { videoId: string }) {
  // Store the last videoId to prevent unnecessary reloads
  const lastVideoIdRef = useRef<string | null>(null);

  const [data, setData] = useState<TranscriptData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [showTimestamps, setShowTimestamps] = useState(true)
  const [processingAI, setProcessingAI] = useState<AIAction | null>(null)
  const [showDescription, setShowDescription] = useState(false)
  const [showTags, setShowTags] = useState(false)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  const [tabProcessed, setTabProcessed] = useState<Record<TabType, boolean>>({
    transcript: true,
    chapters: false,
    summary: false,
    keyPoints: false,
    questions: false,
    virality: false
  })
  const { toast } = useToast()

  useEffect(() => {
    // First check if we've already processed this exact videoId in the current component instance
    if (lastVideoIdRef.current === videoId && data?.metadata?.videoId === videoId) {
      // Make sure loading is false
      setLoading(false);
      return;
    }
    
    // Save this videoId as the last one we processed
    lastVideoIdRef.current = videoId;
    
    // Create a flag to track if component is mounted
    let isMounted = true;
    
    // Only fetch if videoId changed or we don't have data
    if (!data || data.metadata?.videoId !== videoId) {
      // Modified fetch function with isMounted check
      const fetchData = async () => {
        try {
          // Signal that the component is in loading state
          setLoading(true);
          
          // Construct URL with refresh parameter
          const url = `/api/tools/youtube/transcript/extractor?videoId=${videoId}`;
          
          // Fetch with timeout and abort controller
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000);
          
          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch transcript: ${response.status}`);
          }
          
          const rawData = await response.json();
          
          // Process the data only if component is still mounted
          if (isMounted) {
            if (!rawData || !rawData.transcript || !Array.isArray(rawData.transcript)) {
              throw new Error('Invalid transcript data format');
            }
            
            // Validate transcript segments
            const validatedTranscript = rawData.transcript.map((segment: any) => ({
              timestamp: segment.timestamp || "00:00:00",
              text: segment.text || "",
              offset: typeof segment.offset === 'number' ? segment.offset : 0
            }));
            
            // Create validated data object
            const validatedData: TranscriptData = {
              transcript: validatedTranscript,
              metadata: {
                videoId: rawData.metadata?.videoId || videoId,
                language: rawData.metadata?.language || "en",
                thumbnailUrl: rawData.metadata?.thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                title: rawData.metadata?.title,
                duration: rawData.metadata?.duration,
              }
            };
            
            // Add optional metadata if available
            if (rawData.metadata?.channelName) validatedData.metadata.channelName = rawData.metadata.channelName;
            if (rawData.metadata?.publishDate) validatedData.metadata.publishDate = rawData.metadata.publishDate;
            if (rawData.metadata?.description) validatedData.metadata.description = rawData.metadata.description;
            if (rawData.metadata?.viewCount) validatedData.metadata.viewCount = rawData.metadata.viewCount;
            if (rawData.metadata?.likeCount) validatedData.metadata.likeCount = rawData.metadata.likeCount;
            if (rawData.metadata?.categories) validatedData.metadata.categories = rawData.metadata.categories;
            if (rawData.metadata?.tags) validatedData.metadata.tags = rawData.metadata.tags;
            
            // Set the data only if component is still mounted
            setData(validatedData);
            setTabProcessed(prev => ({...prev, transcript: true}));
            
            // Finally set loading to false
            setLoading(false);
          }
        } catch (error) {
          // Only show error if component is still mounted
          if (isMounted) {
            toast({
              title: "Error Loading Transcript",
              description: "Failed to load transcript. Please try again.",
              variant: "destructive"
            });
            setLoading(false);
          }
        }
      };
      
      // Start the fetch
      fetchData();
    } else {
      // Ensure loading is false in this case too
      setLoading(false);
    }
    
    // Cleanup function runs on unmount or when dependency changes
    return () => {
      isMounted = false;
    };
  }, [videoId, toast, lastVideoIdRef]);

  const copyToClipboard = async (content: string | undefined | null, type: string) => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMap(prev => ({ ...prev, [type]: true }))
      toast({ title: "Copied!", description: `${type} copied to clipboard` })
      setTimeout(() => {
        setCopiedMap(prev => ({ ...prev, [type]: false }))
      }, 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      })
    }
  }

  const handleAIAction = async (action: AIAction, forceRefresh = false) => {
    if (processingAI) return;
    if (!data) return;
    
    setProcessingAI(action);
    
    try {
      let endpoint;
      let tabKey: TabType;
      
      switch (action) {
        case 'summarize':
          endpoint = '/api/tools/youtube/transcript/ai';
          tabKey = 'summary';
          break;
        case 'chapters':
          endpoint = '/api/tools/youtube/transcript/ai';
          tabKey = 'chapters';
          break;
        case 'key_points':
          endpoint = '/api/tools/youtube/transcript/ai';
          tabKey = 'keyPoints';
          break;
        case 'questions':
          endpoint = '/api/tools/youtube/transcript/ai';
          tabKey = 'questions';
          break;
        case 'virality':
          endpoint = '/api/tools/youtube/transcript/virality';
          tabKey = 'virality';
          break;
        default:
          throw new Error('Invalid action');
      }
      
      // Construct different payloads for different endpoints
      const payload = action === 'virality' 
        ? { videoId: data.metadata.videoId, forceRefresh } 
        : { videoId: data.metadata.videoId, action, forceRegenerate: forceRefresh };
      
      // Log request for debugging
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error details');
        console.error(`Failed to ${action}:`, response.status, errorText);
        throw new Error(`Failed to ${action}: ${response.status}`);
      }
      
      const result = await response.json();

      // Update the data based on the action
      if (action === 'virality') {
        setData(prev => prev ? {
          ...prev,
          viralityScore: result.viralityScore
        } : null);
      } else {
        // Handle other AI content types - get content from correct property
        setData(prev => {
          if (!prev) return null;
          
          const updatedData: TranscriptData = { ...prev };
          
          // Access the data using the correct property name from the response
          if (action === 'summarize') {
            updatedData.summary = result.summary;
          } else if (action === 'chapters') {
            updatedData.chapters = result.chapters || result[action];
          } else if (action === 'key_points') {
            updatedData.keyPoints = result.key_points || result[action];
          } else if (action === 'questions') {
            updatedData.questions = result.questions || result[action];
          }
          
          return updatedData;
        });
      }
      
      setTabProcessed(prev => ({...prev, [tabKey]: true}));
      toast({ 
        title: "Success", 
        description: `Retrieved ${action.replace('_', ' ')}` 
      });
      
    } catch (error) {
      console.error(`AI ${action} error:`, error);
      toast({
        title: "Error",
        description: `Failed to generate ${action.replace('_', ' ')}`,
        variant: "destructive"
      });
    } finally {
      setProcessingAI(null);
    }
  };

  const downloadTranscript = (format: 'txt' | 'srt' | 'vtt') => {
    if (!data?.transcript) return
    
    const filename = data.metadata.title 
      ? `${data.metadata.title.slice(0, 30).replace(/[^\w\s]/gi, '')}_transcript.${format}`
      : `transcript_${videoId}.${format}`;
    
    const content = data.transcript
      .map(segment => {
        if (format === 'srt') {
          return `${segment.offset}\n${segment.timestamp} --> ${segment.timestamp}\n${segment.text}\n\n`
        }
        return `${showTimestamps ? `[${segment.timestamp}] ` : ''}${segment.text}`
      })
      .join(format === 'txt' ? '\n' : '');

    const element = document.createElement('a')
    const file = new Blob([content], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = filename
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const formatTranscriptText = () => {
    if (!data?.transcript) return 'No transcript available';
    
    const filteredTranscript = searchQuery
      ? data.transcript.filter(segment => 
          segment.text.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : data.transcript;

    return filteredTranscript
      .map(segment => `${showTimestamps ? `[${segment.timestamp}] ` : ''}${segment.text}`)
      .join('\n');
  }

  const getTranscriptForCopy = () => {
    if (!data?.transcript) return '';
    return data.transcript
      .map(segment => `${showTimestamps ? `[${segment.timestamp}] ` : ''}${segment.text}`)
      .join('\n');
  }

  const getContentForTab = (tab: TabType): string => {
    if (tab === 'transcript') return formatTranscriptText();
    if (tab === 'virality') {
      if (!data?.viralityScore) return 'Virality analysis not available';
      // This tab has a custom rendering, not a string
      return '';
    }
    if (tab === 'summary') return data?.summary || 'Summary not available';
    if (tab === 'chapters') return data?.chapters || 'Chapters not available';
    if (tab === 'keyPoints') return data?.keyPoints || 'Key points not available';
    if (tab === 'questions') return data?.questions || 'Questions not available';
    return '';
  }

  const openYouTubeVideo = () => {
    // Toggle video player visibility instead of redirecting
    setShowVideoPlayer(!showVideoPlayer);
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  const renderViralityTab = () => {
    if (!data?.viralityScore) return null;
    
    const score = data.viralityScore;
    
    return (
      <div className="space-y-6">
        {/* Overall Score */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h3 className="text-lg font-medium">Overall Virality Score</h3>
            <p className="text-sm text-muted-foreground">
              Based on engagement metrics and content analysis
            </p>
          </div>
          <div className="flex items-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl ${getScoreColor(score.overall)}`}>
              {score.overall}
            </div>
          </div>
        </div>
        
        {/* Score Breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-medium">Engagement</h4>
              <div className={`px-2 py-1 rounded text-white text-sm font-semibold ${getScoreColor(score.engagement)}`}>
                {score.engagement}
              </div>
            </div>
            <Progress value={score.engagement} className="h-1.5" />
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-medium">Quality</h4>
              <div className={`px-2 py-1 rounded text-white text-sm font-semibold ${getScoreColor(score.quality)}`}>
                {score.quality}
              </div>
            </div>
            <Progress value={score.quality} className="h-1.5" />
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-medium">Trend</h4>
              <div className={`px-2 py-1 rounded text-white text-sm font-semibold ${getScoreColor(score.trend)}`}>
                {score.trend}
              </div>
            </div>
            <Progress value={score.trend} className="h-1.5" />
          </div>
        </div>
        
        {/* Insights */}
        {score.insights && score.insights.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Insights</h3>
            <ul className="space-y-2">
              {score.insights.map((insight, index) => (
                <li key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Recommendations */}
        {score.recommendations && score.recommendations.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Recommendations</h3>
            <ul className="space-y-2">
              {score.recommendations.map((recommendation, index) => (
                <li key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 flex gap-2">
                  <span className="font-bold">{index + 1}.</span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading transcript data...</p>
        <p className="text-xs text-muted-foreground max-w-[300px] text-center">
          This may take a moment as we transcribe the video or retrieve a cached transcript
        </p>
      </div>
    );
  }

  // No data state
  if (!data || !data.transcript || data.transcript.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-center p-6 space-y-4">
          <p className="text-red-500 font-medium">Unable to load transcript</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            We couldn't load the transcript for this video. The video may not have captions,
            or there could be an issue with our transcript service.
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Button onClick={() => {
              // Reset loading state and let the useEffect handle the fetch
              setLoading(true);
              
              // Force a re-fetch by clearing the data
              setData(null);
              
              // Display toast to indicate retry
              toast({
                title: "Retrying",
                description: "Attempting to load transcript again..."
              });
            }}>
              Retry Loading
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4"> 
      <Card className="p-0 md:p-0 overflow-hidden border-none shadow-lg">
        <div className="grid lg:grid-cols-[380px_1fr] gap-0"> 
          {/* Thumbnail and Sidebar Section */}
          <div className="bg-gray-50 dark:bg-gray-900 p-6 border-r border-gray-100 dark:border-gray-800">
            <div className="space-y-5">
              <div className="relative group rounded-lg overflow-hidden shadow-md">
                {showVideoPlayer ? (
                  <div className="relative pb-[56.25%] h-0">
                    <iframe 
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <>
                    <img
                      src={data?.metadata.thumbnailUrl}
                      alt="Video thumbnail"
                      className="w-full rounded-lg"
                    />
                    <div 
                      className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all cursor-pointer"
                      onClick={openYouTubeVideo}
                    >
                      <Play className="text-white h-12 w-12 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                    {data?.metadata.duration && (
                      <Badge variant="secondary" className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white">
                        {formatDuration(data.metadata.duration)}
                      </Badge>
                    )}
                  </>
                )}
              </div>
              
              <div className="space-y-3">
                {data?.metadata.title && (
                  <h1 className="text-xl font-semibold line-clamp-2">{data.metadata.title}</h1>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    {data?.metadata.channelName && (
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-0 h-auto font-medium text-primary hover:bg-transparent hover:text-primary/80"
                          onClick={() => window.open(`https://www.youtube.com/channel/search?query=${encodeURIComponent(data.metadata.channelName || '')}`, '_blank')}
                        >
                          {data.metadata.channelName}
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {data?.metadata.viewCount && (
                        <span>{parseInt(data.metadata.viewCount).toLocaleString()} views</span>
                      )}
                      
                      {data?.metadata.publishDate && (
                        <>
                          <span className="text-xs">•</span>
                          <span>{formatDate(data.metadata.publishDate)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {data?.metadata.likeCount && (
                    <div className="flex items-center gap-1 text-sm">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{parseInt(data.metadata.likeCount).toLocaleString()}</span>
                    </div>
                  )}
                </div>
                
                {/* Video Tags */}
                {data?.metadata.tags && data.metadata.tags.length > 0 && (
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto flex items-center gap-1 text-sm text-muted-foreground"
                      onClick={() => setShowTags(!showTags)}
                    >
                      <Tag className="h-3.5 w-3.5" />
                      <span>Tags</span>
                      {showTags ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </Button>
                    
                    {showTags && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {data.metadata.tags.slice(0, 10).map((tag, i) => (
                          <Badge key={i} variant="outline" className="bg-gray-100 dark:bg-gray-800 text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {data.metadata.tags.length > 10 && (
                          <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800 text-xs">
                            +{data.metadata.tags.length - 10} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Video Description */}
                {data?.metadata.description && (
                  <div className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto flex items-center gap-1 text-sm text-muted-foreground"
                      onClick={() => setShowDescription(!showDescription)}
                    >
                      <span>Description</span>
                      {showDescription ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </Button>
                    
                    {showDescription && (
                      <div className="text-sm text-muted-foreground mt-2 whitespace-pre-line line-clamp-10">
                        {data.metadata.description}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Controls */}
              <div className="space-y-4 mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                <div className="flex items-center justify-between p-3 bg-gray-100/50 dark:bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Show timestamps</span>
                  </div>
                  <Switch
                    checked={showTimestamps}
                    onCheckedChange={setShowTimestamps}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => downloadTranscript('txt')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    TXT
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => downloadTranscript('srt')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    SRT
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={openYouTubeVideo}
                  >
                    <Youtube className="h-4 w-4 mr-2" />
                    {showVideoPlayer ? 'Hide Video' : 'Play Video'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Transcript Section */}
          <div className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold">Video Transcript</h2>
              <Button 
                variant="outline" 
                onClick={() => copyToClipboard(getTranscriptForCopy(), 'transcript')}
                className="w-full sm:w-auto"
              >
                {copiedMap['transcript'] ? (
                  <CheckSquare className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copiedMap['transcript'] ? 'Copied!' : 'Copy Full Transcript'}
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transcript..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  className="w-full sm:w-auto"
                  onClick={() => setSearchQuery('')}
                >
                  Clear
                </Button>
              )}
            </div>

            <Tabs defaultValue="transcript" className="w-full">
              <TabsList className="mb-4 w-full flex-wrap h-auto p-1 bg-gray-100/50 dark:bg-gray-800/30">
                <TabsTrigger value="transcript">
                  <FileText className="h-4 w-4 mr-2 hidden sm:block" />
                  Transcript
                </TabsTrigger>
                <TabsTrigger 
                  value="summary" 
                  onClick={() => !tabProcessed.summary && handleAIAction('summarize')}
                >
                  <Bot className="h-4 w-4 mr-2 hidden sm:block" />
                  Summary
                  {processingAI === 'summarize' && (
                    <Loader2 className="h-3 w-3 ml-2 animate-spin" />
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="chapters" 
                  onClick={() => !tabProcessed.chapters && handleAIAction('chapters')}
                >
                  <ListVideo className="h-4 w-4 mr-2 hidden sm:block" />
                  Chapters
                  {processingAI === 'chapters' && (
                    <Loader2 className="h-3 w-3 ml-2 animate-spin" />
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="keyPoints" 
                  onClick={() => !tabProcessed.keyPoints && handleAIAction('key_points')}
                >
                  <BookKey className="h-4 w-4 mr-2 hidden sm:block" />
                  Key Points
                  {processingAI === 'key_points' && (
                    <Loader2 className="h-3 w-3 ml-2 animate-spin" />
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="questions" 
                  onClick={() => !tabProcessed.questions && handleAIAction('questions')}
                >
                  <HelpCircle className="h-4 w-4 mr-2 hidden sm:block" />
                  Questions
                  {processingAI === 'questions' && (
                    <Loader2 className="h-3 w-3 ml-2 animate-spin" />
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="virality" 
                  onClick={() => !tabProcessed.virality && handleAIAction('virality')}
                >
                  <TrendingUp className="h-4 w-4 mr-2 hidden sm:block" />
                  Virality
                  {processingAI === 'virality' && (
                    <Loader2 className="h-3 w-3 ml-2 animate-spin" />
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Tab Contents */}
              {(['transcript', 'summary', 'chapters', 'keyPoints', 'questions'] as TabType[]).map((tab) => (
                <TabsContent key={tab} value={tab} className="relative mt-0">
                  {/* Special handling for transcript tab - it's not AI generated */}
                  {tab === 'transcript' ? (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-sm relative">
                      <pre className="whitespace-pre-wrap p-5 text-sm overflow-y-auto max-h-[70vh] font-sans">
                        {getContentForTab(tab)}
                      </pre>
                      
                      {/* Controls Overlay */}
                      <div className="absolute top-2 right-2 flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                          onClick={() => copyToClipboard(getContentForTab(tab), tab)}
                        >
                          {copiedMap[tab] ? (
                            <>
                              <CheckSquare className="h-3.5 w-3.5" />
                              <span className="ml-1.5 text-xs">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span className="ml-1.5 text-xs">Copy</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // AI generated tabs (summary, chapters, keyPoints, questions)
                    processingAI === (
                      tab === 'summary' ? 'summarize' : 
                      tab === 'keyPoints' ? 'key_points' : 
                      tab === 'questions' ? 'questions' : 
                      tab === 'chapters' ? 'chapters' : null
                    ) ? (
                      // Processing AI state
                      <div className="flex flex-col items-center justify-center h-60 gap-4 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p className="text-muted-foreground">Generating {tab}...</p>
                      </div>
                    ) : (
                      // Content ready state
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-sm relative">
                        <pre className="whitespace-pre-wrap p-5 text-sm overflow-y-auto max-h-[70vh] font-sans">
                          {getContentForTab(tab)}
                        </pre>
                        
                        {/* Controls Overlay */}
                        <div className="absolute top-2 right-2 flex items-center space-x-2">
                          {/* Regenerate Button (for AI tabs only) */}
                          {tabProcessed[tab] && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                              onClick={() => {
                                const action = tab === 'summary' ? 'summarize' : 
                                            tab === 'chapters' ? 'chapters' : 
                                            tab === 'keyPoints' ? 'key_points' : 'questions';
                                handleAIAction(action, true);
                              }}
                              disabled={processingAI !== null}
                            >
                              <RefreshCw className={`h-3.5 w-3.5 ${processingAI ? 'animate-spin' : ''}`} />
                              <span className="ml-1.5 text-xs">Regenerate</span>
                            </Button>
                          )}
                          
                          {/* Copy Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                            onClick={() => copyToClipboard(getContentForTab(tab), tab)}
                            disabled={!tabProcessed[tab]}
                          >
                            {copiedMap[tab] ? (
                              <>
                                <CheckSquare className="h-3.5 w-3.5" />
                                <span className="ml-1.5 text-xs">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span className="ml-1.5 text-xs">Copy</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )
                  )}
                </TabsContent>
              ))}
              
              {/* Virality Tab Content (Special rendering) */}
              <TabsContent value="virality" className="relative mt-0">
                {processingAI === 'virality' ? (
                  <div className="flex flex-col items-center justify-center h-60 gap-4 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-muted-foreground">Analyzing video virality...</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-sm relative p-5 overflow-y-auto max-h-[70vh]">
                    {tabProcessed.virality && data?.viralityScore ? (
                      renderViralityTab()
                    ) : (
                      <div className="flex flex-col items-center justify-center h-40 gap-4">
                        <Button 
                          onClick={() => data && handleAIAction('virality')}
                          disabled={processingAI !== null || !data}
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Analyze Video Virality
                        </Button>
                        <p className="text-sm text-muted-foreground">
                          Get insights on what makes this video successful and how it could perform better
                        </p>
                      </div>
                    )}
                    
                    {/* Controls Overlay */}
                    <div className="absolute top-2 right-2 flex items-center space-x-2">
                      {/* Regenerate Button */}
                      {tabProcessed.virality && data?.viralityScore && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                          onClick={() => data && handleAIAction('virality', true)}
                          disabled={processingAI !== null}
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${processingAI ? 'animate-spin' : ''}`} />
                          <span className="ml-1.5 text-xs">Regenerate</span>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Card>
    </div>
  )
}