// components/product-reviews/product-reviews.tsx
import { useState, useEffect } from 'react'
import { StarRating } from './star-rating'
import { ReviewCard } from './review-card'
import { ProductReviewSchema } from './tool-structured-data'

export type ToolReview = {
  id: string
  authorName: string
  rating: number
  reviewBody: string
  createdAt: string
  isVerified: boolean
  authorPicture: string | null
}

type ToolReviewsProps = {
  productSlug: string 
  title?: string      
  limit?: number      
}

export function ToolReview({ productSlug, title = "Customer Reviews", limit = 5 }: ToolReviewsProps) {
  const [reviews, setReviews] = useState<ToolReview[]>([])
  const [loading, setLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)

  useEffect(() => {
    async function fetchReviews() {
      try {        
        const response = await fetch(`/api/reviews/${productSlug}`)
        if (!response.ok) {
          throw new Error('Failed to fetch reviews')
        }
        
        const data = await response.json() as ToolReview[]
        
        
        setReviews(data.slice(0, limit))
        setTotalReviews(data.length)
        
        // Calculate average rating from the reviews
        if (data.length > 0) {
          const sum = data.reduce((acc, review) => acc + review.rating, 0)
          setAverageRating(sum / data.length)
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [productSlug, limit])

  if (loading) {
    return <div className="animate-pulse h-40 bg-gray-100 rounded-lg"></div>
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <p className="text-gray-500">Be the first to review this tool!</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <ProductReviewSchema 
        productSlug={productSlug} 
        reviews={reviews} 
        averageRating={averageRating} 
        totalReviews={totalReviews} 
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          <StarRating rating={averageRating} size="lg" />
          <span className="text-sm sm:text-base text-gray-600">
            {averageRating.toFixed(1)} ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  )
}