"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

function LoadingSpinner() {
  const [text, setText] = useState('');
  const fullText = "Getting things in order.. Please hold on.. You're almost there..";
  const typingSpeed = 50; // milliseconds per character

  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, typingSpeed);

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <div className="animate-bounce">
        <Image
          src="/icon-2.png"  // Replace with the path to your Olly logo
          alt="Olly Logo"
          width={300}
          height={300}
        />
      </div>
      <p className="mt-4 text-xl font-semibold text-gray-800">{text}</p>
    </div>
  );
}

export default LoadingSpinner;