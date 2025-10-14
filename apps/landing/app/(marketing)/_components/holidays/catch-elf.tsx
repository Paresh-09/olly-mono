"use client"

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useToast } from "@repo/ui/hooks/use-toast";import { Sparkles } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

interface GameState {
  attempts: number;
  catches: number;
}

interface Props {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  sessionId: string;
  onComplete: () => void;
}

const CatchTheElf = ({ gameState, setGameState, sessionId, onComplete }: Props) => {
  const { toast } = useToast();
  const [elfPosition, setElfPosition] = useState<Position>({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);
  const [currentElfImage, setCurrentElfImage] = useState('/holidays/elves/christmas-elf.png');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const elfImages = [
    '/holidays/elves/christmas-elf.png',
    '/holidays/elves/elf-1.png',
    '/holidays/elves/elf-2.png',
    '/holidays/elves/elf-3.png',
    '/holidays/elves/elf-4.png',
  ];

  const catchChances = [
    { level: 1, chance: 1.0, speed: 2000, reward: '10%' },
    { level: 2, chance: 0.9, speed: 1500, reward: '20%' },
    { level: 3, chance: 0.8, speed: 1200, reward: '30%' },
    { level: 4, chance: 0.05, speed: 900, reward: '50%' },
    { level: 5, chance: 0.005, speed: 600, reward: '100%' }
  ];

  const getRandomElfImage = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * elfImages.length);
    return elfImages[randomIndex];
  }, []);

  const moveElf = useCallback(() => {
    const maxX = window.innerWidth - (isMobile ? 60 : 100);
    const maxY = window.innerHeight - (isMobile ? 60 : 100);
    const level = gameState.catches + 1;
    const randomOffset = level * (isMobile ? 20 : 40);
    
    const newX = Math.random() * (maxX - randomOffset) + randomOffset;
    const newY = Math.random() * (maxY - randomOffset) + randomOffset;
    
    setElfPosition({ x: newX, y: newY });
    setCurrentElfImage(getRandomElfImage());
  }, [gameState.catches, getRandomElfImage, isMobile]);

  useEffect(() => {
    const checkChristmasPeriod = (): boolean => {
      const today = new Date();
      const month = today.getMonth();
      const day = today.getDate();
      return month === 11 && day >= 20 && day <= 27;
    };

    if (!checkChristmasPeriod()) return;

    const currentLevel = gameState.catches + 1;
    const speedConfig = catchChances.find(c => c.level === currentLevel);
    const interval = setInterval(() => {
      moveElf();
      setIsVisible(prev => Math.random() > currentLevel * 0.15); // Slightly more disappearing
    }, speedConfig?.speed || 2000);

    return () => clearInterval(interval);
  }, [moveElf, gameState.catches]);

  const handleCatch = async () => {
    if (gameState.attempts <= 0) return;

    const currentLevel = gameState.catches + 1;
    const catchConfig = catchChances.find(c => c.level === currentLevel);
    
    try {
      const didCatch = Math.random() <= (catchConfig?.chance || 1);

      const response = await fetch('/api/holidays/elves/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          level: currentLevel,
          timestamp: Date.now(),
          position: elfPosition,
          didCatch
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Unable to process attempt. Please try again."
        });
        return;
      }
      
      setGameState({
        attempts: gameState.attempts - 1,
        catches: didCatch ? gameState.catches + 1 : gameState.catches,
      });
      
      if (didCatch) {
        toast({
          title: "🎄 Caught!",
          description: `Amazing! ${catchConfig?.reward} discount unlocked!`,
          variant: "default",
        });
      } else {
        toast({
          title: "Almost!",
          description: `Keep trying! ${gameState.attempts - 1} attempts left`,
          variant: "default",
        });
      }

      if (gameState.attempts <= 1 || gameState.catches >= 4) {
        setTimeout(() => {
          onComplete();
          if (gameState.catches >= 4) {
            toast({
              title: "🎄 Wow! 🎄",
              description: "You've mastered the elf hunt! Claim your reward!",
              variant: "default",
            });
          }
        }, 1500);
      }
    } catch (error) {
      console.error('Catch error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again."
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed cursor-pointer z-40 transition-all duration-500 ease-in-out
                 hover:scale-110 active:scale-95 group`}
      style={{
        transform: `translate(${elfPosition.x}px, ${elfPosition.y}px)`,
      }}
      onClick={handleCatch}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-green-400 blur-xl opacity-20 animate-pulse rounded-full scale-150" />
        
        <div className="relative group">
          <Image
            src={currentElfImage}
            alt="Holiday Elf"
            width={isMobile ? 50 : 90}
            height={isMobile ? 50 : 90}
            className="animate-bounce relative z-10"
            priority
          />
          <div className="absolute -top-2 -right-2 z-20">
            <Sparkles className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-yellow-400 animate-pulse`} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-200 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default CatchTheElf;