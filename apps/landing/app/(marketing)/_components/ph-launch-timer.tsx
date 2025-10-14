"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const PHLaunchTimer = () => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date('2024-09-26T00:01:00-07:00').getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        setIsLive(false);
      } else {
        setIsLive(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-sm flex items-center justify-center space-x-2">
      <Link href="/giveaways" className="text-indigo-600 font-semibold hover:underline flex items-center">
        Support us and get a free lifetime license!
        <ArrowRight className="ml-1" size={16} />
      </Link>
      {!isLive && (
        <>
          <span className="text-gray-400">|</span>
          <span className="text-gray-600">
            Launches in <span className="font-bold">{timeLeft}</span>
          </span>
        </>
      )}
    </div>
  );
};

export default PHLaunchTimer;