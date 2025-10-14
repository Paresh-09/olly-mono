"use client"

import { Badge } from '@repo/ui/components/ui/badge';
import { Label } from '@repo/ui/components/ui/label';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

const NewUpdates = () => {
  const [timeLeft, setTimeLeft] = useState('');
  const [showTimer, setShowTimer] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date('2024-09-11T23:59:59').getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setShowTimer(true);
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setShowTimer(false);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className='mb-2 flex flex-col items-center text-center text-gray-600'>
      <Label className='text-xs'>
        <Link href="/release-notes" className='text-blue-500'>📣 v2.0.0 Live: </Link>
        <span>Panel updates, Updated UI, Custom Actions, Native Language support rolled out, brand new analytics dashboard & more.</span>
      </Label>
      {showTimer && (
        <Badge variant="default" className='mt-4 text-xs'>
          Price increases to $49 for lifetime plan in {timeLeft}
        </Badge>
      )}
    </div>
  );
};

export default NewUpdates;