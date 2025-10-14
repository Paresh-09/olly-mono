"use client"

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Logo {
  src: string;
  alt: string;
}

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
    { src: "/images/brand-logos/time-keepers.png", alt: "TimeKeepers Logo" },
    { src: "/images/brand-logos/matax.png", alt: "Matax Logo" },
    { src: "/images/brand-logos/r-royale.png", alt: "Rummathon Royale Logo" },
    { src: "/images/brand-logos/explainxai.png", alt: "Explainx AI Logo" },
    { src: "/testimonial/briton.png", alt: "Briton media Logo" },
  ];

  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Grid Background Component (matching hero design)
  const GridBackground: React.FC = () => {
    return (
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern
              id="logo-grid"
              width="2"
              height="2"
              patternUnits="userSpaceOnUse"
            >
              <rect
                width="2"
                height="2"
                fill="none"
                stroke="rgb(229, 231, 235)"
                strokeWidth="0.1"
                opacity="0.3"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#logo-grid)" />
        </svg>
      </div>
    );
  };

  return (
    <div className="relative mx-auto mt-20 max-w-7xl px-6 lg:px-8 py-16">
      {/* Grid Background */}
      <GridBackground />

      {/* Critical heading - optimized for LCP with hero-style typography */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-4">
          Trusted by{" "}
          <span className="text-teal-600 bg-gradient-to-r from-teal-500 to-teal-700 bg-clip-text text-transparent">
            5000+
          </span>{" "}
          businesses
        </h2>
        <p className="text-gray-600 text-lg md:text-xl font-medium">
          Influencers & agencies around the World
        </p>
      </motion.div>

      {/* Logo carousel with floating effect */}
      <motion.div
        className="relative h-32 overflow-hidden rounded-2xl bg-white/50 backdrop-blur-sm shadow-lg border border-gray-100"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        whileHover={{
          scale: 1.02,
          transition: { type: "spring", damping: 25, stiffness: 400 },
        }}
      >
        {isMounted && (
          <>
            <motion.div
              className={`logos-scroll flex ${isHovered ? 'paused' : ''}`}
              style={{
                width: `${logos.length * 180 * 2}px`,
                animation: 'scroll 45s linear infinite'
              }}
              initial={{ x: 0 }}
              animate={{ x: 0 }}
            >
              {/* First set of logos */}
              {logos.map((logo, index) => (
                <motion.div
                  key={`logo-1-${index}`}
                  className="flex-shrink-0 w-40 h-24 mx-6 flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.5,
                    type: "spring",
                    damping: 20,
                    stiffness: 300
                  }}
                  whileHover={{
                    scale: 1.1,
                    transition: { type: "spring", damping: 15, stiffness: 400 }
                  }}
                >
                  <div className="p-4 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={140}
                      height={80}
                      style={{ height: '48px', width: 'auto' }}
                      className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Sh6MB0Bd9NdSIydNDd4WxIsn6WVPj6VTT1X+wODG5SaAAAAABJRU5ErkJggg=="
                    />
                  </div>
                </motion.div>
              ))}

              {/* Second set of logos */}
              {logos.map((logo, index) => (
                <motion.div
                  key={`logo-2-${index}`}
                  className="flex-shrink-0 w-40 h-24 mx-6 flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: (index + logos.length) * 0.1,
                    duration: 0.5,
                    type: "spring",
                    damping: 20,
                    stiffness: 300
                  }}
                  whileHover={{
                    scale: 1.1,
                    transition: { type: "spring", damping: 15, stiffness: 400 }
                  }}
                >
                  <div className="p-4 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={140}
                      height={80}
                      style={{ height: '48px', width: 'auto' }}
                      className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Sh6MB0Bd9NdSIydNDd4WxIsn6WVPj6VTT1X+wODG5SaAAAAABJRU5ErkJggg=="
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Enhanced gradient fade effect */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-white/80 via-white/40 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-white/80 via-white/40 to-transparent" />
          </>
        )}
      </motion.div>

      <style jsx global>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .logos-scroll {
          display: flex;
          position: relative;
        }

        .logos-scroll.paused {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

export default LogoCloud;