"use client"

import React, { useState, useEffect } from 'react';

interface StickyBuyButtonProps {
  showOnlyPriceText?: boolean;
  topMessage?: string;
}

const StickyBuyButton: React.FC<StickyBuyButtonProps> = ({ showOnlyPriceText = false, topMessage = '' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hasKeyboard, setHasKeyboard] = useState(true);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [leftCount, setLeftCount] = useState(5);

  const texts = showOnlyPriceText
    ? [
        {
          before: 'Get',
          emphasis: '30% OFF',
          after: 'on Lifetime Access',
          duration: 5000,
          subtext: `${leftCount} left`
        }
      ]
    : [
        {
          before: 'Select any text to',
          emphasis: 'Preview',
          after: 'Olly',
          duration: 2000
        },
        {
          before: 'Get',
          emphasis: '30% OFF',
          after: 'on Lifetime Access',
          duration: 5000,
          subtext: `${leftCount} left`
        }
      ];

  useEffect(() => {
    const checkForKeyboard = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setHasKeyboard(!isMobile);
    };

    checkForKeyboard();
    window.addEventListener('resize', checkForKeyboard);
    return () => window.removeEventListener('resize', checkForKeyboard);
  }, []);

  useEffect(() => {
    if (!hasKeyboard || showOnlyPriceText) return;
    const cycleText = () => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentTextIndex(prev => (prev + 1) % texts.length);
        setIsTransitioning(false);
      }, 300);
    };
    const interval = setInterval(cycleText, texts[currentTextIndex].duration + 300);
    return () => clearInterval(interval);
  }, [hasKeyboard, currentTextIndex, showOnlyPriceText, texts]);

  useEffect(() => {
    const randomizeLeftCount = () => {
      const counts = [5, 3, 4, 2, 6, 9];
      const randomIndex = Math.floor(Math.random() * counts.length);
      setLeftCount(counts[randomIndex]);
    };

    randomizeLeftCount();

    const interval = setInterval(() => {
      randomizeLeftCount();
    }, Math.floor(Math.random() * (4 - 3 + 1) + 3) * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleBuyClick = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discountCode: 'I2MDM5MG' }),
      });
      const data = await response.json();
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
      else console.error('Error creating checkout:', data.error);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasKeyboard) return null;

  const currentText = texts[currentTextIndex];

  return (
    <div 
      className={`fixed top-20 right-4 bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg cursor-pointer overflow-hidden transition-all duration-300 ${isHovered ? 'bg-blue-600' : ''} hidden md:block`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleBuyClick}
    >
      {topMessage && (
        <div className="text-xs mb-1 text-center">{topMessage}</div>
      )}
      <div className={`transition-all duration-300 ${isTransitioning ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
        <span className="mr-2 font-semibold">{currentText.before}</span>
        <span className="bg-white text-blue-500 px-2 py-1 rounded-md font-mono font-bold">{currentText.emphasis}</span>
        <span className="ml-2 font-semibold">{currentText.after}</span>
        {currentText.subtext && <span className="text-xs ml-2 opacity-70">({leftCount} left)</span>}
      </div>
    </div>
  );
};

export default StickyBuyButton;