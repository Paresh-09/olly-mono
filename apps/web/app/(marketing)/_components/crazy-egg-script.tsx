"use client"

import Script from 'next/script'
import React from 'react'

const CrazyEggScript = () => {
  return (
    <Script
    id="crazy-egg" 
    src="//script.crazyegg.com/pages/scripts/0121/1949.js" 
    strategy="afterInteractive" 
    async 
  />
  )
}

export default CrazyEggScript