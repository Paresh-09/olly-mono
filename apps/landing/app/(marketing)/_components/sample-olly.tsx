"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Camera, FileText, TrendingUp, RefreshCw, CornerDownLeft, ThumbsDown, ThumbsUp, Cloud, Book } from 'lucide-react';

const OllyComponent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ top: '50%', transform: 'translateY(-50%)' });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const ollyButtonRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const lastSelectionRef = useRef<string>('');
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleMouseUp = (event: MouseEvent) => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        lastSelectionRef.current = selection.toString().trim();
        setIsVisible(true);
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
      } else if (!isDrawerOpen) {
        // Start the hide timer when text is unselected
        hideTimeoutRef.current = setTimeout(() => {
          setIsVisible(false);
        }, 1500);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isDrawerOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof Element && e.target.id === 'olly-drawer-toggle') return;
    setIsDragging(true);
  };

  const handleFeedback = async (isPositive: boolean) => {
    setFeedback(isPositive);
    
    try {
      const response = await fetch('/api/olly-component-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedbackType: isPositive ? 'Positive' : 'Negative',
          feedback: isPositive ? 'Thumbs Up' : 'Thumbs Down',
          skipped: false,
          source: 'OllyPopup',
          context: {
            responseText: responseText,
            selectedText: lastSelectionRef.current,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send feedback');
      }

      console.log('Feedback sent successfully');
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };



  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newTop = e.clientY;
      setPosition({ top: `${newTop}px`, transform: 'none' });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleOptionClick = () => {
    setIsLoading(true);
    setResponseText('');
    setTimeout(() => {
      setIsLoading(false);
      setResponseText("Hi 👋 this is Olly, and this is where your comments, posts and viral scores will appear after you click any of the above actions. Please note this is an upcoming preview of the component.");
    }, 1000);
  };

  const handleIconClick = () => {
    setIsDrawerOpen(true);
    handleOptionClick();
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Modify toggleDrawer to clear the hide timeout when the drawer is opened
  const toggleDrawer = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDrawerOpen(!isDrawerOpen);
    if (!isDrawerOpen) {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    }
  };


  const options = [
    { title: "Comment on a Post", icon: <Cloud className="w-5 h-5" /> },
    { title: "Summarize a Post", icon: <Book className="w-5 h-5" /> },
    { title: "Check Virality score of a Post", icon: <TrendingUp className="w-5 h-5" /> },
    { title: "Generate a Similar Post", icon: <RefreshCw className="w-5 h-5" /> },
    { title: "Reply to a Comment", icon: <CornerDownLeft className="w-5 h-5" /> },
  ];

  if (!isVisible) return null;

  return (
    <>
      <div 
        ref={ollyButtonRef}
        className="fixed flex items-center bg-blue-500 rounded-full shadow-lg cursor-pointer z-50 transition-all duration-300 ease-in-out p-1.5"
        style={{ right: '20px', ...position }}
        onMouseDown={handleMouseDown}
      >
        <div onClick={handleIconClick}>
          <Image src="/icon-2.png" alt="Olly" width={36} height={36} className="rounded-full" />
        </div>
        <div 
          id="olly-drawer-toggle"
          className="text-white text-xl ml-1.5 mr-1.5 cursor-pointer w-8 h-8 flex items-center justify-center"
          onClick={toggleDrawer}
        >
          {isDrawerOpen ? '\u25B7' : '\u25C1'}
        </div>
      </div>
      {isDrawerOpen && (
        <div 
          ref={drawerRef}
          className="fixed bg-white rounded-xl shadow-lg z-50 flex flex-col items-center font-sans transition-all duration-300 ease-in-out p-2.5 overflow-hidden"
          style={{ right: '80px', ...position, width: `${options.length * 48 + (options.length - 1) * 8 + 20}px` }}
        >
          <div className="flex items-center mb-2.5">
            {options.map((option, index) => (
              <button
                key={index}
                className="w-10 h-10 rounded-full border-none bg-gray-100 text-gray-700 text-lg cursor-pointer mr-2 transition-colors duration-300 ease-in-out hover:bg-gray-200 flex items-center justify-center"
                onClick={handleOptionClick}
                title={option.title}
              >
                {option.icon}
              </button>
            ))}
          </div>
          <div className="w-full p-3.5 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            {isLoading ? (
              <p className="m-0 mb-2.5 text-gray-700">Generating text...</p>
            ) : responseText ? (
              <>
                <p className="m-0 mb-2.5 text-gray-700">{responseText}</p>
                <div className="flex justify-between mb-2">
                  <button 
                    className="px-2.5 py-1.5 border-none rounded bg-blue-500 text-white cursor-pointer text-xs"
                    onClick={() => navigator.clipboard.writeText(responseText)}
                  >
                    Copy
                  </button>
                  <button 
                    className="px-2.5 py-1.5 border-none rounded bg-blue-500 text-white cursor-pointer text-xs"
                    onClick={() => setResponseText('')}
                  >
                    Close
                  </button>
                </div>
                <div className="flex justify-center items-center mt-2">
                  <button
                    className={`mr-2 p-1 rounded ${feedback === true ? 'bg-green-100' : 'bg-gray-100'}`}
                    onClick={() => handleFeedback(true)}
                    title="Thumbs Up"
                  >
                    <ThumbsUp className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    className={`p-1 rounded ${feedback === false ? 'bg-red-100' : 'bg-gray-100'}`}
                    onClick={() => handleFeedback(false)}
                    title="Thumbs Down"
                  >
                    <ThumbsDown className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
};

export default OllyComponent;