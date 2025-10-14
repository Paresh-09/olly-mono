"use client"
import React, { useRef, useEffect, useState } from 'react';

interface LazyVideoProps {
    src: string;
    className?: string;
    ariaLabel?: string;
    poster?: string;
}

const LazyVideo: React.FC<LazyVideoProps> = ({
    src,
    className = "",
    ariaLabel = "Demo video",
    poster
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        // Load the video when it comes into view
                        if (!isLoaded) {
                            video.src = src;
                            setIsLoaded(true);
                        }
                        // Play video when in view
                        video.play().catch(() => {
                            // Handle autoplay restrictions
                        });
                    } else {
                        // Pause video when out of view to save resources
                        video.pause();
                    }
                });
            },
            {
                rootMargin: '100px', // Start loading 100px before entering viewport
                threshold: 0.1
            }
        );

        observer.observe(video);

        return () => {
            observer.disconnect();
        };
    }, [src, isLoaded]);

    return (
        <div className="relative w-full h-full">
            <video
                ref={videoRef}
                muted
                loop
                playsInline
                className={`w-full h-auto rounded-md object-cover transition-opacity duration-500 ${isInView ? 'opacity-100' : 'opacity-70'
                    } ${className}`}
                aria-label={ariaLabel}
                poster={poster}
                preload="none"
            />

            {/* Loading indicator */}
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-md">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#264e57]"></div>
                </div>
            )}
        </div>
    );
};

export default LazyVideo;