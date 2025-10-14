"use client";

import { useState, useEffect } from 'react'
import { Card } from '@repo/ui/components/ui/card'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs'
import AuthPopup from "../authentication";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { useToast } from "@repo/ui/hooks/use-toast";
const PLATFORMS = {
  twitter: { limit: 280, name: 'Twitter' },
  instagram: { limit: 2200, name: 'Instagram' },
  linkedin: { limit: 3000, name: 'LinkedIn Post' },
  facebook: { limit: 63206, name: 'Facebook' },
  tiktok: { limit: 2200, name: 'TikTok' }
}

const DAILY_FREE_LIMIT = 3;

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

export const CharacterCounter = () => {
  const [text, setText] = useState('')
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dailyUsage, setDailyUsage] = useState<UsageTracking>({ count: 0, date: '' });
  const { toast } = useToast();

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
    const savedUsage = localStorage.getItem('characterCounter_dailyUsage');
    
    if (savedUsage) {
      const usage: UsageTracking = JSON.parse(savedUsage);
      if (usage.date === today) {
        setDailyUsage(usage);
      } else {
        // Reset for new day
        const newUsage = { count: 0, date: today };
        setDailyUsage(newUsage);
        localStorage.setItem('characterCounter_dailyUsage', JSON.stringify(newUsage));
      }
    } else {
      const newUsage = { count: 0, date: today };
      setDailyUsage(newUsage);
      localStorage.setItem('characterCounter_dailyUsage', JSON.stringify(newUsage));
    }
  };

  const incrementDailyUsage = () => {
    const today = new Date().toDateString();
    const newUsage = {
      count: dailyUsage.count + 1,
      date: today
    };
    setDailyUsage(newUsage);
    localStorage.setItem('characterCounter_dailyUsage', JSON.stringify(newUsage));
  };

  const handleTextCheck = async () => {
    if (isAuthenticated) {
      // Authenticated users have unlimited access
      return true;
    }

    if (dailyUsage.count >= DAILY_FREE_LIMIT) {
      setShowAuthPopup(true);
      toast({
        title: "Daily Limit Reached",
        description: `You've reached your daily limit of ${DAILY_FREE_LIMIT} free checks. Please sign in for unlimited access.`,
        variant: "destructive",
      });
      return false;
    }

    // Increment usage for free users
    incrementDailyUsage();
    return true;
  };

  const getProgressColor = (count: number, limit: number) => {
    const percentage = (count / limit) * 100
    if (percentage >= 90) return 'text-red-500'
    if (percentage >= 75) return 'text-yellow-500'
    return 'text-green-500'
  }

  return (
    <Card className="p-6">
      <Textarea
        className="w-full h-48 mb-4"
        placeholder="Type or paste your social media post here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      
      {!isAuthenticated && (
        <Alert className="mb-4">
          <AlertDescription>
            You have {DAILY_FREE_LIMIT - dailyUsage.count} free checks remaining today. Sign in for unlimited access.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Object.entries(PLATFORMS).map(([platform, { limit, name }]) => {
          const count = text.length
          return (
            <div 
              key={platform} 
              className="text-center p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
              onClick={() => handleTextCheck()}
            >
              <div className="text-sm font-medium">{name}</div>
              <div className={`text-2xl font-bold ${getProgressColor(count, limit)}`}>
                {count} / {limit}
              </div>
            </div>
          )
        })}
      </div>

      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        onSuccess={() => {
          setIsAuthenticated(true);
          setShowAuthPopup(false);
          // User is now authenticated, they can continue using the tool
        }}
      />
    </Card>
  )
}