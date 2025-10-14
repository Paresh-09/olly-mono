// OllyComponent.tsx
"use client";

import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react'; // Icon for the Olly button
import CommentOptionsPanel from './comment-panel';

const OllyComponent: React.FC = () => {
  const [showPanel, setShowPanel] = useState(false);

  return (
    <>
      {/* Olly Icon Button */}
      <div
        className="fixed right-4 top-1/2 transform -translate-y-1/2 cursor-pointer p-2 z-50"
        onClick={() => setShowPanel(true)}
      >
        <MessageCircle className="w-10 h-10 text-blue-500" />
      </div>

      {/* Comment Options Panel */}
      {showPanel && <CommentOptionsPanel onClose={() => setShowPanel(false)} />}
    </>
  );
};

export default OllyComponent;
