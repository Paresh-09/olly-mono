"use client"

import React, { useEffect, useState } from 'react';
import Snowfall from 'react-snowfall';

const ChristmasSnow = () => {
  const [isChristmasPeriod, setIsChristmasPeriod] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState<number>(0);

  useEffect(() => {
    const checkChristmasPeriod = (): boolean => {
      const today = new Date();
      const month = today.getMonth();
      const day = today.getDate();
      return month === 11 && day >= 20 && day <= 25; // December is month 11
    };

    // Set initial window width
    setWindowWidth(window.innerWidth);

    // Update window width on resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    setIsChristmasPeriod(checkChristmasPeriod());

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isChristmasPeriod) return null;

  // Adjust snowflake count based on screen width
  const getSnowflakeCount = () => {
    if (windowWidth < 640) return 50; // mobile
    if (windowWidth < 1024) return 75; // tablet
    return 100; // desktop
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <Snowfall 
        snowflakeCount={getSnowflakeCount()}
        style={{
          position: 'fixed',
          width: '100vw',
          height: '100vh',
        }}
        speed={[0.3, 1.5]} // Slightly reduced speed range
        wind={[-0.3, 1]} // Reduced wind effect
        radius={[0.3, 1.5]} // Slightly smaller snowflakes
        color="rgba(255, 255, 255, 0.8)" // Slightly transparent white
      />
    </div>
  );
};

export default ChristmasSnow;