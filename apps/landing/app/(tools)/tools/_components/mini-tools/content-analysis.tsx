"use client";

import { useState, useEffect } from 'react'
import { Card } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Progress } from '@repo/ui/components/ui/progress'
import { useToast } from '@repo/ui/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert"
import AuthPopup from "../authentication"

interface ContentAnalyzerProps {
  toolType: string;
  placeholder: string;
  platforms?: string[];
  showRegionSelect?: boolean;
}

interface AnalysisResult {
  analysis: string;
  score?: number;
  creditsRemaining: number;
}

interface AuthCheckResponse {
  authenticated: boolean;
  user: {
    id: string;
    email: string;
    username: string;
  } | null;
}

interface UsageTracking {
  count: number;
  date: string;
}

const DAILY_FREE_LIMIT = 1;

export const ContentAnalyzerTool: React.FC<ContentAnalyzerProps> = ({
  toolType,
  placeholder,
  platforms,
  showRegionSelect
}) => {
  const [content, setContent] = useState('')
  const [platform, setPlatform] = useState('instagram')
  const [region, setRegion] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuthPopup, setShowAuthPopup] = useState(false)
  const [dailyUsage, setDailyUsage] = useState<UsageTracking>({ count: 0, date: '' })
  const { toast } = useToast()

  useEffect(() => {
    checkAuthStatus();
    loadDailyUsage();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/user/auth');
      const data: AuthCheckResponse = await response.json();
      setIsAuthenticated(data.authenticated);
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const loadDailyUsage = () => {
    const today = new Date().toDateString();
    const savedUsage = localStorage.getItem(`contentAnalyzer_${toolType}_dailyUsage`);

    if (savedUsage) {
      const usage: UsageTracking = JSON.parse(savedUsage);
      if (usage.date === today) {
        setDailyUsage(usage);
      } else {
        // Reset for new day
        const newUsage = { count: 0, date: today };
        setDailyUsage(newUsage);
        localStorage.setItem(`contentAnalyzer_${toolType}_dailyUsage`, JSON.stringify(newUsage));
      }
    } else {
      const newUsage = { count: 0, date: today };
      setDailyUsage(newUsage);
      localStorage.setItem(`contentAnalyzer_${toolType}_dailyUsage`, JSON.stringify(newUsage));
    }
  };

  const incrementDailyUsage = () => {
    const today = new Date().toDateString();
    const newUsage = {
      count: dailyUsage.count + 1,
      date: today
    };
    setDailyUsage(newUsage);
    localStorage.setItem(`contentAnalyzer_${toolType}_dailyUsage`, JSON.stringify(newUsage));
  };

  const checkUsageLimit = (): boolean => {
    if (isAuthenticated) {
      return true;
    }

    if (dailyUsage.count >= DAILY_FREE_LIMIT) {
      setShowAuthPopup(true);
      toast({
        title: "Daily Limit Reached",
        description: `You've reached your daily limit of ${DAILY_FREE_LIMIT} free analysis. Please sign in for unlimited access.`,
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const analyzeContent = async () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content to analyze",
        variant: "destructive"
      });
      return;
    }

    if (!checkUsageLimit()) {
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('toolType', toolType);
      if (platforms) formData.append('platform', platform);
      if (showRegionSelect) formData.append('region', region);
      formData.append('userId', 'user-id'); // Replace with actual user ID

      const response = await fetch('/api/tools/generations', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setResult(data);

      if (!isAuthenticated) {
        incrementDailyUsage();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {!isAuthenticated && (
          <Alert>
            <AlertDescription>
              {dailyUsage.count >= DAILY_FREE_LIMIT
                ? "You've reached your daily limit. Sign in for unlimited access."
                : `You have ${DAILY_FREE_LIMIT - dailyUsage.count} free analysis remaining today. Sign in for unlimited access.`}
            </AlertDescription>
          </Alert>
        )}

        <Textarea
          className="min-h-[200px]"
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {platforms && (
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {platforms.map(p => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        )}

        {showRegionSelect && (
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Region</option>
            <option value="US">United States</option>
            <option value="UK">United Kingdom</option>
            <option value="EU">Europe</option>
            <option value="ASIA">Asia</option>
          </select>
        )}

        <Button
          onClick={analyzeContent}
          className="w-full"
          disabled={loading || (!isAuthenticated && dailyUsage.count >= DAILY_FREE_LIMIT)}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : 'Analyze Content'}
        </Button>

        {result && (
          <div className="mt-6 space-y-4">
            {result.score !== undefined && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Score</span>
                  <span>{result.score}%</span>
                </div>
                <Progress value={result.score} />
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Analysis:</h3>
              <p className="whitespace-pre-wrap text-gray-600">{result.analysis}</p>
            </div>

            <p className="text-sm text-gray-500">
              Credits remaining: {result.creditsRemaining}
            </p>
          </div>
        )}
      </div>

      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        onSuccess={() => {
          setIsAuthenticated(true);
          setShowAuthPopup(false);
          // After authentication, user can continue using the tool
        }}
      />
    </Card>
  )
}