import React from 'react'
import { Metadata } from 'next'
import ProductRoadmap from './_components/roadmap'

export const metadata: Metadata = {
  title: 'Product Roadmap | Olly AI',
  description: 'Explore the future of Olly AI with our product roadmap. See what features and improvements we\'re planning to deliver in the coming months.',
  alternates: {
    canonical: "/product-roadmap",
  },
  openGraph: {
    title: 'Product Roadmap | Olly AI',
    description: 'Discover the exciting future plans for Olly AI',
    images: [
      {
        url: '/product-roadmap.png',
        width: 1200,
        height: 630,
        alt: 'Olly AI Product Roadmap',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Product Roadmap | Olly AI',
    description: 'Discover the exciting future plans for Olly AI',
    images: ['/product-roadmap.png'],
  },
}

const ProductRoadmapPage = () => {
  return (
    <div>
      <ProductRoadmap />
    </div>
  )
}

export default ProductRoadmapPage