import { Badge } from '@repo/ui/components/ui/badge'
import { Button } from '@repo/ui/components/ui/button'
import React from 'react'

const WatchDemo = () => {
    const handleWatchDemo = () => {
        window.open("https://youtu.be/8VJTHIgxy1Q?si=WUPdI49PASlSOjJs", "_blank")
      }

  return (
    <div className='hidden md:flex justify-center'>
        <Button variant="ghost" size="lg" className="mt-2 md:mt-0 md:ml-2" onClick={handleWatchDemo}>
            Watch Demo
      </Button>
      {/* <Badge className='w-10 h-5'>New </Badge> */}
    </div>
  )
}

export default WatchDemo