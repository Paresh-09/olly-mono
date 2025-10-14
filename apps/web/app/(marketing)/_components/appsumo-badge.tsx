import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const AppSumoBadge = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
      <Link 
        href="https://appsumo.com/products/olly" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center bg-black text-white px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors duration-200"
      >
        <div className="flex items-center gap-2">
          {/* AppSumo logo */}
          <Image 
            src="/appsumo.png"
            alt="AppSumo" 
            width={20} 
            height={20}
            className="rounded-sm"
          />
          
          {/* Divider */}
          <div className="h-4 w-px bg-gray-600"></div>
          
          {/* Taco rating */}
          <div className="flex items-center gap-1">
            <div className="flex">
              {[1, 2, 3, 4].map((index) => (
                <Image
                  key={index}
                  src="/tacos-appsumo-black.png"
                  alt="Full taco"
                  width={16}
                  height={16}
                  className="mr-0.5"
                />
              ))}
              {/* Half taco for 4.5 rating */}
              <div className="relative w-8 h-4 overflow-hidden">
                <Image
                  src="/tacos-appsumo-black.png"
                  alt="Half taco"
                  width={16}
                  height={16}
                  className="absolute left-0"
                />
              </div>
            </div>
            <span className="text-sm font-medium ml-1">4.5</span>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default AppSumoBadge