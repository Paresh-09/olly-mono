"use client"

import React, { useState, useEffect } from 'react';
import { Progress } from "@repo/ui/components/ui/progress";
import { Button } from "@repo/ui/components/ui/button";
import { useToast } from "@repo/ui/hooks/use-toast";import { Gift, Sparkles, RefreshCcw, Timer } from 'lucide-react';
import CatchTheElf from './catch-elf';

const GAME_DURATION = 60;

const HolidayGame = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameState, setGameState] = useState({
    attempts: 6,
    catches: 0,
  });
  const [sessionId, setSessionId] = useState<string>("");
  const [hasPlayed, setHasPlayed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset timer when starting a new game
  useEffect(() => {
    if (isPlaying) {
      setTimeLeft(GAME_DURATION);
    }
  }, [isPlaying]);

  // Timer countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleGameComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, timeLeft]);

  // Discount percentages matching game logic
  const getDiscountPercentage = (catches: number) => {
    const discounts = {
      1: 10,
      2: 20,
      3: 30,
      4: 50,
      5: 100
    };
    return discounts[catches as keyof typeof discounts] || 0;
  };

  useEffect(() => {
    const storedSessionId = localStorage.getItem('elfGameSession');
    const newSessionId = storedSessionId || crypto.randomUUID();
    setSessionId(newSessionId);
    
    if (!storedSessionId) {
      localStorage.setItem('elfGameSession', newSessionId);
    }
  }, []);

  const handleClaimDiscount = async () => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          catches: gameState.catches,
          sessionId,
          checkoutData: {
            custom_price: null,
            product_options: {
              redirect_url: 'https://www.olly.social/checkout/success'
            }
          }
        }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim discount');
      }
      
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to apply discount. Please try again."
      });
    }
  };

  const handleGameComplete = () => {
    setIsPlaying(false);
    setHasPlayed(true);
    if (timeLeft <= 0) {
      toast({
        title: "Time's Up!",
        description: `You caught ${gameState.catches} elves. Try again for a bigger discount!`,
        variant: "default",
      });
    }
  };

  const handleRetry = () => {
    setGameState({
      attempts: 6,
      catches: 0,
    });
    setTimeLeft(GAME_DURATION);
    setIsPlaying(true);
    setHasPlayed(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!sessionId) return null;

  if (isPlaying) {
    return (
      <>
        <div className={`fixed ${isMobile ? 'top-2 right-2 w-auto' : 'top-4 right-4 w-64'} z-50 bg-white/90 p-2 md:p-4 rounded-lg shadow-lg backdrop-blur-sm border`}>
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm font-medium">Elf Hunt</span>
              <div className="flex items-center gap-1 md:gap-2 text-xs text-gray-500">
                <Timer className="w-3 h-3 md:w-4 md:h-4" />
                <span className={timeLeft <= 10 ? "text-red-500 font-bold" : ""}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
            <Progress value={(gameState.catches / 5) * 100} className="h-1 md:h-2" />
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600">{gameState.catches}/5</span>
              {gameState.catches > 0 && (
                <Button 
                  variant="ghost" 
                  size={isMobile ? "sm" : "default"}
                  onClick={handleClaimDiscount}
                  className="text-xs py-1 px-2 h-auto"
                >
                  {getDiscountPercentage(gameState.catches)}% OFF
                </Button>
              )}
            </div>
          </div>
        </div>
        <CatchTheElf 
          gameState={gameState}
          setGameState={setGameState}
          sessionId={sessionId}
          onComplete={handleGameComplete}
        />
      </>
    );
  }

  return (
    <div className={`fixed ${isMobile ? 'bottom-4 right-4 left-4' : 'bottom-8 right-8'} z-50`}>
      <div className="bg-white/90 p-3 md:p-6 rounded-xl shadow-lg backdrop-blur-sm border max-w-sm">
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
            <h3 className="font-semibold text-sm md:text-base">Holiday Special!</h3>
          </div>
          
          {hasPlayed ? (
            <div className="space-y-2">
              {gameState.catches > 0 ? (
                <>
                  <p className="text-xs md:text-sm text-gray-600">
                    {timeLeft <= 0 
                      ? `Time's up! ${gameState.catches} ${gameState.catches === 1 ? 'elf' : 'elves'} = ${getDiscountPercentage(gameState.catches)}% OFF!`
                      : `${gameState.catches} ${gameState.catches === 1 ? 'elf' : 'elves'} = ${getDiscountPercentage(gameState.catches)}% OFF!`
                    }
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleClaimDiscount}
                      className="bg-green-600 hover:bg-green-700 flex-1 text-xs md:text-sm py-1 h-auto"
                    >
                      Claim {getDiscountPercentage(gameState.catches)}% OFF
                    </Button>
                    <Button
                      onClick={handleRetry}
                      variant="outline"
                      className="flex items-center gap-1 text-xs md:text-sm py-1 h-auto"
                    >
                      <RefreshCcw className="w-3 h-3 md:w-4 md:h-4" />
                      Retry
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs md:text-sm text-gray-600">
                    No elves caught! Try again?
                  </p>
                  <Button
                    onClick={handleRetry}
                    className="bg-green-600 hover:bg-green-700 w-full text-xs md:text-sm py-1 h-auto"
                  >
                    <RefreshCcw className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                    Try Again
                  </Button>
                </>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs md:text-sm text-gray-600">
                Catch 5 elves in 60s for 100% OFF! Start small, aim big!
              </p>
              <div className="flex justify-end">
                <Button 
                  onClick={() => setIsPlaying(true)}
                  className="bg-green-600 hover:bg-green-700 text-xs md:text-sm py-1 h-auto"
                >
                  <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                  Begin Hunt
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HolidayGame;