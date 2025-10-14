import Image from 'next/image'
import Link from 'next/link'
import AppLinks from './app-links'
import { cn } from '@/lib/utils'

interface HeroProps {
  title: string
  subtitle: string
}

const HeroText = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h1 
    className={cn(
      "font-cal text-4xl sm:text-5xl lg:text-6xl text-gray-900",
      className
    )}
  >
    {children}
  </h1>
)

const HeroSubtitle = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-6 text-xs sm:text-s leading-8 text-gray-500">
    {children}
  </p>
)

export default function Hero({ title, subtitle }: HeroProps) {
  return (
    <div className="inline-block min-h-screen">
      <div className="relative h-[80vh] w-screen bg-gradient-radial from-[#16825E] via-[#127A57] to-[#215F4A] mt-20">
        {/* QR Code */}
        <div className="absolute bottom-5 right-5 hidden bg-black rounded-lg p-2 lg:block">
          <Image 
            src="/mobile/images/OLLY_APP_QR_CODE.png"
            alt="Olly Logo"
            height={100}
            width={100}
          />
        </div>

        {/* Content */}
        <div className="flex flex-col items-center justify-start h-[calc(80vh-70px)] text-center">
          <div className="px-3">
            <HeroText className="text-gray">
              {title}
            </HeroText>
            <div className="flex justify-center">
              <HeroSubtitle>
                {subtitle}
              </HeroSubtitle>
            </div>
          </div>
          
          <div className="mt-4">
            <AppLinks />
          </div>

          {/* Phone Images */}
          <div className="mt-8 flex justify-center">
            <Image 
              src="/mobile/images/phones/device_15_home_feed2.png" 
              alt="Screenshot of Olly app showing the main player with several comments."
              height={400}
              width={200}
              className="mt-20 hidden md:block"
            />
            <Image 
              src="/mobile/images/phones/device_15_player_full.png" 
              alt="Screenshot of Olly app showing the main player with several comments."
              height={500}
              width={250}
              className="mx-4"
            />
            <Image 
              src="/mobile/images/phones/device_15_player_response.png" 
              alt="Screenshot of Olly app showing the main player with several comments."
              height={400}
              width={200}
              className="mt-20 hidden md:block"
            />
          </div>
        </div>
      </div>
    </div>
  )
}