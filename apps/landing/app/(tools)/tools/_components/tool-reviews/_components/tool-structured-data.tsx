// components/product-reviews/product-review-schema.tsx
import { ToolReview } from './tool-review'

type ProductReviewSchemaProps = {
  productSlug: string
  reviews: ToolReview[]
  averageRating: number
  totalReviews: number
}

export function ProductReviewSchema({ 
  productSlug, 
  reviews, 
  averageRating, 
  totalReviews 
}: ProductReviewSchemaProps) {
 
  const productName = productSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  
  // Create the structured data object
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": productName,
    "category": "Social Media Tool",
    "image": `https://olly.social/tools/${productSlug}.png`,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      "url": `https://olly.social/tools/${productSlug}`
    },
    "review": reviews.map(review => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": "5"
      },
      "author": {
        "@type": "Person",
        "name": review.authorName
      },
      "reviewBody": review.reviewBody,
      "datePublished": review.createdAt
    })),
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": averageRating.toFixed(1),
      "reviewCount": totalReviews,
      "bestRating": "5"
    },
    "description": `${productName} is a tool that helps users create engaging comments for Instagram posts, making social media marketing more effective and saving time.`
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}