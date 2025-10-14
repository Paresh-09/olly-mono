"use client"

import React, { useEffect, useState } from 'react';
import Smartlook from 'smartlook-client';

const SmartlookScript = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set the state to true once the component is mounted
    setIsClient(true);
    // Initialize Smartlook only if we're on the client side
    if (typeof window !== 'undefined') {
      Smartlook.init('4e687ab80472d319342344f93e8a4848da4c53fd');
    }
  }, []);

  if (!isClient) {
    // Render nothing on the server
    return null;
  }

  // Your client-side script goes here, if necessary
  return (
    <div>
      {/* Client-side script can be placed here, if needed */}
    </div>
  );
};

export default SmartlookScript;
