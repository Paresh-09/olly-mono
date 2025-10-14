import Image from 'next/image'
import React from 'react'

const MobileFlower = () => {
  return (
    <div>
                {/* Mobile Images Section */}
                <div className="mt-20 flex flex-col items-center">
          <div className="relative w-full max-w-4xl">
            {/* Background gradient for phones */}
            <div className="absolute rounded-3xl" />
            
            <div className="relative flex justify-center items-end">
              <Image 
                src="/mobile/images/phones/device_15_home_feed2.png" 
                alt="Olly mobile app screenshot showing the home feed"
                height={400}
                width={200}
                className="relative hidden md:block transform -rotate-6 translate-x-16 shadow-xl rounded-3xl"
              />
              <Image
                src="/mobile/images/phones/device_15_player_full.png" 
                alt="Olly mobile app screenshot showing the main player"
                height={500}
                width={250}
                className="relative z-10 shadow-xl rounded-3xl"
              />
              <Image 
                src="/mobile/images/phones/device_15_player_response.png" 
                alt="Olly mobile app screenshot showing a response"
                height={400}
                width={200}
                className="relative hidden md:block transform rotate-6 -translate-x-16 shadow-xl rounded-3xl"
              />
            </div>
          </div>
        </div>
    </div>
  )
}

export default MobileFlower