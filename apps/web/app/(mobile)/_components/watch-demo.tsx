import { VideoDemo } from '@/app/(marketing)/_components/video-demo'
import Image from 'next/image'
import React from 'react'

const WatchDemoMobile = () => {
  return (
    <div className="mx-auto max-w-3xl px-4">
      <div className="relative rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl lg:p-4">
        <Image
          src="/new_video_thumbnail.webp"
          alt="Olly Social Alternatives"
          width={1216}
          height={721}
          className="rounded-md shadow ring-1 ring-gray-900/10"
        />
        <VideoDemo />
      </div>
    </div>
  )
}

export default WatchDemoMobile