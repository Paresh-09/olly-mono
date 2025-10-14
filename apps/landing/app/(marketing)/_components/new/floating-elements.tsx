'use client';

import { lazy, Suspense } from 'react';
import Image from 'next/image';

// Lazy load the floating animation components
const Floating = lazy(() => import('./floating').then(module => ({ default: module.default })));
const FloatingElement = lazy(() => import('./floating').then(module => ({ default: module.FloatingElement })));

// Import social icons
import { Instagram, Facebook, Twitter, Youtube, Linkedin } from '../shared-icons';

const mockImages = [
  {
    url: "/assets/1.webp",
    title: "Charcoal Beauty Products",
    author: "Beauty Brand"
  },
  {
    url: "/assets/2.webp",
    title: "Influencer Portrait",
    author: "Shanice Crystal"
  },
  {
    url: "/assets/5.webp",
    title: "Campaign Dashboard",
    author: "Marketing Tools"
  },
  {
    url: "/assets/4.webp",
    title: "Skincare Routine",
    author: "Beauty Content"
  },
  {
    url: "/assets/3.webp",
    title: "Analytics Dashboard",
    author: "Performance Data"
  }
];

export const FloatingElements = () => {
  return (
    <Suspense fallback={<div className="absolute inset-0" />}>
      <Floating sensitivity={-0.3} easingFactor={0.25} className="h-full z-40 absolute inset-0">

        {/* Social Media Icons */}
        <FloatingElement depth={0.8} className="floating-element top-[12%] left-[15%] md:top-[18%] md:left-[20%]">
          <div className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-150 hover:scale-110">
            <Instagram className="w-6 h-6 text-pink-500" />
          </div>
        </FloatingElement>

        <FloatingElement depth={1.2} className="top-[8%] right-[25%] md:top-[15%] md:right-[30%]">
          <div className="p-2 md:p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-150 hover:scale-110">
            <Facebook className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
          </div>
        </FloatingElement>

        <FloatingElement depth={0.6} className="top-[25%] right-[10%] md:top-[35%] md:right-[15%]">
          <div className="p-1.5 md:p-2.5 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-150 hover:scale-110">
            <Twitter className="w-3 h-3 md:w-5 md:h-5 text-sky-500" />
          </div>
        </FloatingElement>

        <FloatingElement depth={1.5} className="bottom-[20%] left-[12%] md:bottom-[25%] md:left-[18%]">
          <div className="p-2 md:p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-150 hover:scale-110">
            <Youtube className="w-4 h-4 md:w-6 md:h-6 text-red-500" />
          </div>
        </FloatingElement>

        <FloatingElement depth={0.9} className="bottom-[15%] right-[20%] md:bottom-[20%] md:right-[25%]">
          <div className="p-2.5 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-150 hover:scale-110">
            <Linkedin className="w-5 h-5 text-blue-700" />
          </div>
        </FloatingElement>
      </Floating>

      {/* Floating Images */}
      <Floating sensitivity={-0.5} easingFactor={0.25} className="h-full z-30 absolute inset-0">
        {mockImages.map((image, index) => (
          <FloatingElement
            key={index}
            depth={[3, 1, 4, 2, 1][index]}
            className={getImagePosition(index)}
          >
            <div className={getImageContainer(index)}>
              <Image
                src={image.url}
                alt={image.title}
                width={getImageWidth(index)}
                height={getImageHeight(index)}
                className="object-cover w-full h-full"
                sizes={getImageSizes(index)}
                loading="lazy"
                quality={75}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Sh6MB0Bd9NdSIydNDd4WxIsn6WVPj6VTT1X+wODG5SaAAAAABJRU5ErkJggg=="
              />
            </div>
          </FloatingElement>
        ))}
      </Floating>
    </Suspense>
  );
};

// Helper functions for image positioning and sizing
function getImagePosition(index: number): string {
  const positions = [
    "top-[45%] left-[10%] md:top-[25%] md:left-[5%]",
    "top-[6%] left-[8%] md:top-[6%] md:left-[11%]",
    "top-[75%] left-[6%] md:top-[80%] md:left-[8%]",
    "top-[6%] left-[70%] md:top-[2%] md:left-[83%]",
    "top-[60%] left-[70%] md:top-[68%] md:left-[83%]"
  ];
  return positions[index];
}

function getImageContainer(index: number): string {
  const containers = [
    "w-16 h-12 sm:w-24 sm:h-16 md:w-28 md:h-20 lg:w-32 lg:h-24 hover:scale-105 duration-150 cursor-pointer transition-transform -rotate-[3deg] shadow-2xl rounded-xl overflow-hidden",
    "w-40 h-28 sm:w-48 sm:h-36 md:w-56 md:h-44 lg:w-60 lg:h-48 hover:scale-105 duration-150 cursor-pointer transition-transform -rotate-12 shadow-2xl rounded-xl overflow-hidden",
    "w-40 h-40 sm:w-48 sm:h-48 md:w-60 md:h-60 lg:w-64 lg:h-64 -rotate-[4deg] hover:scale-105 duration-150 cursor-pointer transition-transform shadow-2xl rounded-xl overflow-hidden",
    "w-28 h-24 sm:w-48 sm:h-44 md:w-60 md:h-52 lg:w-64 lg:h-56 hover:scale-105 duration-150 cursor-pointer transition-transform shadow-2xl rotate-[6deg] rounded-xl overflow-hidden",
    "w-44 h-44 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 hover:scale-105 duration-150 cursor-pointer transition-transform shadow-2xl rotate-[19deg] rounded-xl overflow-hidden"
  ];
  return containers[index];
}

function getImageWidth(index: number): number {
  const widths = [128, 240, 256, 256, 320];
  return widths[index];
}

function getImageHeight(index: number): number {
  const heights = [96, 192, 256, 224, 320];
  return heights[index];
}

function getImageSizes(index: number): string {
  const sizes = [
    "(max-width: 640px) 64px, (max-width: 768px) 96px, (max-width: 1024px) 112px, 128px",
    "(max-width: 640px) 160px, (max-width: 768px) 192px, (max-width: 1024px) 224px, 240px",
    "(max-width: 640px) 160px, (max-width: 768px) 192px, (max-width: 1024px) 240px, 256px",
    "(max-width: 640px) 112px, (max-width: 768px) 192px, (max-width: 1024px) 240px, 256px",
    "(max-width: 640px) 176px, (max-width: 768px) 256px, (max-width: 1024px) 288px, 320px"
  ];
  return sizes[index];
}
