'use client'

import { useState, useEffect } from 'react';
import { useToast } from '@repo/ui/hooks/use-toast';

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

interface UseAuthLimitProps {
  toolId: string;
  dailyLimit: number;
}

export const useAuthLimit = ({ toolId, dailyLimit }: UseAuthLimitProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
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
    const savedUsage = localStorage.getItem(`${toolId}_dailyUsage`);
    
    if (savedUsage) {
      const usage: UsageTracking = JSON.parse(savedUsage);
      if (usage.date === today) {
        setDailyUsage(usage);
      } else {
        const newUsage = { count: 0, date: today };
        setDailyUsage(newUsage);
        localStorage.setItem(`${toolId}_dailyUsage`, JSON.stringify(newUsage));
      }
    } else {
      const newUsage = { count: 0, date: today };
      setDailyUsage(newUsage);
      localStorage.setItem(`${toolId}_dailyUsage`, JSON.stringify(newUsage));
    }
  };

  const incrementUsage = () => {
    const today = new Date().toDateString();
    const newUsage = {
      count: dailyUsage.count + 1,
      date: today
    };
    setDailyUsage(newUsage);
    localStorage.setItem(`${toolId}_dailyUsage`, JSON.stringify(newUsage));
  };

  const checkUsageLimit = (): boolean => {
    if (isAuthenticated) {
      return true;
    }

    if (dailyUsage.count >= dailyLimit) {
      setShowAuthPopup(true);
      toast({
        title: "Daily Limit Reached",
        description: `You've reached your daily limit of ${dailyLimit} free uses. Please sign in for unlimited access.`,
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSuccessfulAuth = () => {
    setIsAuthenticated(true);
    setShowAuthPopup(false);
  };

  return {
    isAuthenticated,
    showAuthPopup,
    dailyUsage,
    setShowAuthPopup,
    checkUsageLimit,
    incrementUsage,
    handleSuccessfulAuth,
    remainingUses: dailyLimit - dailyUsage.count
  };
};