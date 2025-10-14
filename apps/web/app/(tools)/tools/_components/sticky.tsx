
"use client";
import React, { useState, useEffect } from "react";

interface StickyBannerProps {
  show: boolean;
}


const StickyBanner: React.FC<StickyBannerProps> = ({ show }) => {
  const [seconds, setSeconds] = useState(1800); // Initialize timer with 30 minutes
  const formatTime = (s: number) => {
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds - 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return show ? (
    <div className="fixed top-30 left-0 right-0 z-50">
      <div className="sticky top-[64px] bg-blue-600 text-white py-2 text-center p-3">
        <div className="container mx-auto">
          We are running a limited-time promotion! Use code <strong>SAVE20</strong>{" "}
          for 20% off your order. Hurry, offer ends in {formatTime(seconds)}!
        </div>
      </div>
    </div>
  ) : null;
};


export default StickyBanner;
