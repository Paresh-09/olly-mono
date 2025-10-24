"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@repo/ui/components/ui/badge';
import { Loader2, Trophy, Swords, Flame, ChevronDown, ChevronUp } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';

interface LeaderboardEntry {
  username: string;
  totalComments: number;
  level: number;
  recentScore: number;
}

interface CachedData {
  data: LeaderboardEntry[];
  timestamp: number;
}

export const FloatingLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Cache reference
  const cache = useRef<CachedData | null>(null);
  // Interval reference
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // Track component visibility
  const isVisibleRef = useRef(isVisible);

  // Update visibility ref when state changes
  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  const fetchLeaderboard = useCallback(async (force: boolean = false) => {
    try {
      // Check cache if not forced
      if (!force && cache.current) {
        const now = Date.now();
        // Use cache if it's less than 30 seconds old
        if (now - cache.current.timestamp < 30000) {
          setLeaderboard(cache.current.data);
          setIsLoading(false);
          return;
        }
      }

      setError(null);
      const response = await fetch('/api/leaderboard/live');
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid leaderboard data');
      }

      // Update cache
      cache.current = {
        data,
        timestamp: Date.now()
      };

      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError('Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Setup polling when component mounts
  useEffect(() => {
    setMounted(true);

    // Initial fetch
    fetchLeaderboard(true);

    // Setup interval
    const setupInterval = () => {
      // Clear existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Only poll if component is visible
      if (isVisibleRef.current) {
        intervalRef.current = setInterval(() => {
          fetchLeaderboard(false);
        }, 30000); // Poll every 30 seconds when visible
      }
    };

    setupInterval();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchLeaderboard]);

  // Update polling when visibility changes
  useEffect(() => {
    if (isVisible) {
      fetchLeaderboard(true); // Fetch immediately when becoming visible
      // Setup polling
      intervalRef.current = setInterval(() => {
        fetchLeaderboard(false);
      }, 30000);
    } else {
      // Clear interval when hidden
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isVisible, fetchLeaderboard]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Trophy className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Trophy className="w-5 h-5 text-amber-600" />;
      default:
        return <Swords className="w-5 h-5 text-blue-500" />;
    }
  };

  // Don't render anything during SSR
  if (!mounted) return null;

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={isMobile ? { y: 500 } : { x: -300 }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: 500 } : { x: -300 }}
            transition={{ type: "spring", bounce: 0.2 }}
            className={`fixed z-50 bg-gradient-to-br from-gray-900/95 to-gray-800/95 rounded-lg shadow-lg backdrop-blur-sm border border-gray-700/50 ${
              isMobile 
                ? 'left-4 right-4 bottom-20 max-h-[70vh] overflow-y-auto' 
                : 'left-4 bottom-4 w-72'
            }`}
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                  <h3 className="font-bold text-lg text-white">Live Leaderboard</h3>
                </div>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-gray-400 hover:text-gray-200 p-1"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : error ? (
                <div className="text-sm text-red-400 text-center p-2">{error}</div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <motion.div
                      key={entry.username}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg border border-gray-700/50 hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {getRankIcon(index)}
                        <div>
                          <span className="text-sm font-semibold text-gray-200">
                            {entry.username}
                          </span>
                          <div className="flex items-center gap-1">
                            <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs">
                              Lvl {entry.level}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-orange-400">
                          {entry.recentScore}
                        </div>
                        <div className="text-xs text-gray-400">
                          {entry.totalComments} hits
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              <div className="mt-3 text-center text-xs text-gray-500">
                Last Hour Champions
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsVisible(!isVisible)}
        className={`fixed z-50 bg-gradient-to-r from-gray-900/95 to-gray-800/95 p-3 rounded-lg shadow-lg border border-gray-700/50 hover:bg-gray-800 transition-colors ${
          isMobile 
            ? 'left-4 right-4 bottom-4 flex items-center justify-center gap-2'
            : 'left-4 bottom-4 flex items-center gap-2'
        } ${isVisible ? 'opacity-0' : 'opacity-100'}`}
        animate={{ opacity: isVisible ? 0 : 1 }}
      >
        <Flame className="w-5 h-5 text-orange-500" />
        <span className="text-white font-semibold">Live Leaderboard</span>
        <ChevronUp className="w-5 h-5 text-gray-400" />
      </motion.button>
    </>
  );
}; 