"use client";

import React from 'react';
import { ArrowRight, Chrome } from 'lucide-react';
import { Button } from '@repo/ui/components/ui/button';

const AddOllyButton = () => {
  const handleButtonClick = () => {
    window.open("https://chromewebstore.google.com/detail/olly-social-media-sidekic/ofjpapfmglfjdhmadpegoeifocomaeje", "_blank");
  }

  return (
    <Button variant="default" size="lg" onClick={handleButtonClick}>
      Add Olly to Chrome
      <Chrome className="h-4 w-4 ml-2" />
    </Button>
  );
};

export default AddOllyButton;
