"use client";
import React, { useState, useEffect } from "react";

export default function HeroHeadingAB() {
  const carouselItems = ["Leads", "Sales", "Followers", "Reach"];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselItems.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const HeroAmplify = () => (
    <div className="flex flex-col items-center text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900">
      <div className="flex flex-col sm:flex-row items-center justify-center mb-3 text-center sm:text-left">
        <span className="mb-2 sm:mb-0">Skyrocket your&nbsp;</span>
        <div className="inline-block relative min-w-[120px] sm:min-w-[140px]">
          {carouselItems.map((item, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <span className="bg-gradient-to-r from-blue-500 to-[#33dfa0] bg-clip-text text-transparent whitespace-nowrap">
                {item}
              </span>
            </div>
          ))}
          <span className="invisible">{carouselItems[0]}</span>
        </div>
      </div>
      <div>
        <span className="relative inline-block">
          in days.
          <span className="absolute left-0 bottom-[-0.2em] w-full h-[0.2em] bg-[#33dfa0]"></span>
        </span>
      </div>
    </div>
  );
  return <HeroAmplify />;
}