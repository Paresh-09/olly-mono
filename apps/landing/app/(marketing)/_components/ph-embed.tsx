import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const ProductHuntBadge = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
      <Link href="https://www.producthunt.com/posts/olly-2?utm_source=badge-top-post-badge&utm_medium=badge&utm_souce=badge-olly-2" target="_blank" rel="noopener noreferrer">
        <Image 
          src="https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=430993&theme=neutral&period=daily" 
          alt="Olly - In-browser AI comments, posts, viral scores in seconds | Product Hunt" 
          width={200} 
          height={30} 
          unoptimized={true}
        />
      </Link>
      <Link href="https://appsumo.com/products/olly?utm_source=partner-badge&utm_medium=referral&utm_campaign=partner-216439" target="_blank" rel="noopener noreferrer" className="hidden sm:block">
        <Image 
          src="https://appsumo2ppnuxt.b-cdn.net/img/as-badge-featured.2433f63.png" 
          alt="AppSumo badge" 
          width={150} 
          height={23} 
          unoptimized={true}
        />
      </Link>
    </div>
  )
}

export default ProductHuntBadge