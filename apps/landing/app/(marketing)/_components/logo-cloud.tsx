'use client';

import Image from "next/image";
import React, { useRef, useEffect, useState } from 'react';

interface Logo {
  src: string;
  alt: string;
}

interface LazyLogoProps {
  logo: Logo;
  index: number;
  duplicate?: boolean;
  priority?: boolean;
}

const LazyLogo: React.FC<LazyLogoProps> = ({
  logo,
  index,
  duplicate = false,
  priority = false
}) => {
  const logoRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const logoElement = logoRef.current;
    if (!logoElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            // Load the image when it comes into view
            if (!isLoaded) {
              setIsLoaded(true);
            }
          } else {
            setIsInView(false);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.1
      }
    );

    observer.observe(logoElement);

    return () => {
      observer.disconnect();
    };
  }, [isLoaded]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    console.warn(`Failed to load logo: ${logo.src}`);
    setImageLoaded(true); // Still set to true to remove loading state
  };

  return (
    <div
      ref={logoRef}
      className="flex-shrink-0 w-32 h-20 mx-4 flex items-center justify-center relative"
      aria-hidden={duplicate}
    >
      {isLoaded ? (
        <>
          <Image
            src={logo.src}
            alt={duplicate ? "" : logo.alt}
            width={120}
            height={60}
            className={`h-10 w-auto object-contain filter grayscale hover:grayscale-0 transition-all duration-500 ${isInView && imageLoaded ? 'opacity-100' : 'opacity-70'
              }`}
            loading={priority ? "eager" : "lazy"}
            quality={60}
            sizes="120px"
            placeholder="empty"
            priority={priority}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />

          {/* Loading indicator for image */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-500"></div>
            </div>
          )}
        </>
      ) : (
        // Initial loading placeholder
        <div className="relative h-10 w-28 bg-gray-100 rounded animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export function LogoCloud() {
  const logos: Logo[] = [
    { src: "/images/brand-logos/appsumo.png", alt: "AppSumo" },
    { src: "/images/brand-logos/benefits-logo.png", alt: "Benefits" },
    { src: "/images/brand-logos/google-logo.png", alt: "Google" },
    { src: "/images/brand-logos/level-365.png", alt: "Level 365" },
    { src: "/images/brand-logos/ms-logo.png", alt: "Microsoft" },
    { src: "/images/brand-logos/msn-logo.png", alt: "MSN" },
    { src: "/images/brand-logos/secret-alchemist-logo-india.png", alt: "Secret Alchemist" },
    { src: "/images/brand-logos/snapy-ai-logo.png", alt: "Snapy AI" },
    { src: "/images/brand-logos/viprata.png", alt: "Viprata" },
    { src: "/images/brand-logos/lab316.png", alt: "Lab 316" },
    { src: "/images/brand-logos/time-keepers.png", alt: "TimeKeepers" },
    { src: "/images/brand-logos/matax.png", alt: "Matax" },
    { src: "/images/brand-logos/r-royale.png", alt: "Rummathon Royale" },
    { src: "/images/brand-logos/explainxai.png", alt: "Explainx AI" },
    { src: "/testimonial/briton.png", alt: "Briton Media" },
  ];

  return (
    <div className="mx-auto mt-16 max-w-7xl px-6 lg:px-8">
      <h2 className="text-center font-cal text-2xl leading-8 text-gray-900 mb-10">
        Trusted by <span className="text-teal-500">5000+</span> businesses, influencers & agencies around the World
      </h2>

      <div className="relative h-24 overflow-hidden group">
        <div className="logo-carousel flex animate-scroll group-hover:animate-pause">
          {/* First set of logos */}
          {logos.map((logo, index) => (
            <LazyLogo
              key={`logo-1-${index}`}
              logo={logo}
              index={index}
              priority={index < 3}
            />
          ))}

          {/* Duplicate set for seamless loop */}
          {logos.map((logo, index) => (
            <LazyLogo
              key={`logo-2-${index}`}
              logo={logo}
              index={index}
              duplicate={true}
            />
          ))}
        </div>

        {/* Gradient fade effects */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />
      </div>
    </div>
  );
}

export default LogoCloud;
