// app/components/app-links.tsx
import Image from 'next/image'
import Link from 'next/link'

interface AppLinksProps {
  forNav?: boolean
}

const APPLE_LINK = "https://apps.apple.com/app/olly-ai-powered-comments/id123456789" // Replace with actual App Store ID
const GOOGLE_LINK = "https://play.google.com/store/apps/details?id=social.olly.app" // Replace with actual Play Store ID

const isBeforeDecFirst = () => {
  const today = new Date()
  const decFirst = new Date(today.getFullYear(), 11, 1)
  return today < decFirst
}

export default function AppLinks({ forNav }: AppLinksProps) {
  const isComingSoon = isBeforeDecFirst()

  if (isComingSoon) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-wrap justify-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-md"></div>
            <div className="relative bg-white/5 rounded-xl p-1">
              <Image 
                src="/mobile/images/download_apple.png"
                alt="Download Olly on the App Store"
                height={50}
                width={150}
                className="opacity-40 grayscale transition-all duration-300 group-hover:opacity-50"
              />
              <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px] rounded-xl">
                <span className="text-sm font-semibold text-gray-700 bg-white/90 px-3 py-1 rounded-full shadow-sm border border-gray-100">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-md"></div>
            <div className="relative bg-white/5 rounded-xl p-1">
              <Image 
                src="/mobile/images/download_google.png"
                alt="Download Olly on the Play Store"
                height={50}
                width={150}
                className="opacity-40 grayscale transition-all duration-300 group-hover:opacity-50"
              />
              <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px] rounded-xl">
                <span className="text-sm font-semibold text-gray-700 bg-white/90 px-3 py-1 rounded-full shadow-sm border border-gray-100">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-4 py-2 rounded-full shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">
            🚀 Launching December 1st, 2024
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap justify-center gap-4">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-md"></div>
        <Link href={APPLE_LINK} className="relative block p-1 rounded-xl transition-transform duration-300 hover:scale-[1.02]">
          <Image 
            src="/mobile/images/download_apple.png"
            alt="Download Olly on the App Store"
            height={50}
            width={150}
            className="transition-all duration-300 group-hover:brightness-105"
          />
        </Link>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-md"></div>
        <Link href={GOOGLE_LINK} className="relative block p-1 rounded-xl transition-transform duration-300 hover:scale-[1.02]">
          <Image 
            src="/mobile/images/download_google.png"
            alt="Download Olly on the Play Store"
            height={50}
            width={150}
            className="transition-all duration-300 group-hover:brightness-105"
          />
        </Link>
      </div>
    </div>
  )
}