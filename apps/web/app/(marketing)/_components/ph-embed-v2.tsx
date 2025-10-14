import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const AppSumoBadge = () => {
  return (
    <Link 
      href="https://appsumo.com/products/olly" 
      target="_blank" 
      rel="noopener noreferrer"
      className="inline-flex items-center bg-white hover:bg-gray-50 px-4 py-1.5 rounded-lg transition-all duration-200 border border-gray-200 shadow-sm hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        {/* AppSumo logo */}
        <Image 
          src="/appsumo.png"
          alt="AppSumo" 
          width={24}
          height={24}
          className="rounded-sm"
        />
        
        {/* Divider */}
        <div className="h-4 w-px bg-gray-200"></div>
        
        {/* Taco rating */}
        <div className="flex items-center gap-2">
          <div className="flex">
            {/* Full tacos */}
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
            {/* Half taco */}
            <div className="relative w-[8px] h-4 overflow-hidden">
              <Image
                src="/tacos-appsumo-black.png"
                alt="Half taco"
                width={16}
                height={16}
                className="absolute left-0"
              />
            </div>
          </div>
          <span className="text-sm font-medium text-gray-700">4.5</span>
        </div>
      </div>
    </Link>
  )
}

const PHBadgeV2 = () => {
  return (
    <Link href="https://www.producthunt.com/posts/olly-2?utm_source=badge-top-post-badge&utm_medium=badge&utm_souce=badge-olly-2" target="_blank" rel="noopener noreferrer">
      <Image 
        src="https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=430993&theme=neutral&period=daily" 
        alt="Olly - In-browser AI comments, posts, viral scores in seconds | Product Hunt" 
        width={200} 
        height={30} 
        unoptimized={true}
      />
    </Link>
  )
}

const BadgesDisplay = () => {
  return (
    <div className="mb-4">
      <div className="flex justify-center items-center space-x-4">
        <h3 className="hidden sm:block font-cal text-2xl text-gray-900">
        </h3>
        <PHBadgeV2 />
        {/* <AppSumoBadge /> */}
      </div>
    </div>
  )
}

export default BadgesDisplay