"use client"

import { Badge } from '@repo/ui/components/ui/badge';
import React, { useState, useEffect } from 'react';

const StickyBanner = () => {

  return (
    <div className="sticky top-0 bg-blue-600 text-white py-2 text-center z-50 p-3">
      <div className="container mx-auto">
        <p className="text-sm">
          {/* Add Text: We've just launched a new Platform Level Guide, check it here:  */}
          <span><Badge title='Guide' />How to use Olly across various Social Media Platforms: </span>
        </p>
      </div>
    </div>
  );
};

export default StickyBanner;
