
// components/product-reviews/index.tsx


'use client'
import { useState } from 'react'
import { ToolReview } from './_components/tool-review'
import { ReviewForm } from './_components/review-form'

type ToolReviewsSectionProps = {
  productSlug: string
  title?: string
  showForm?: boolean
  userEmail?: string
  userName?: string
}

export function ToolReviewsSection({
  productSlug,
  title = "Customer Reviews",
  showForm = true,
  userEmail,
  userName
}: ToolReviewsSectionProps) {
  const [refreshKey, setRefreshKey] = useState(0)
  
  // Refresh the reviews list when a new review is submitted
  const handleReviewSubmitted = () => {
    setRefreshKey(prev => prev + 1)
  }
  
  return (
    <div className="mt-8">
      {showForm && (
        <ReviewForm 
          productSlug={productSlug} 
          onSuccess={handleReviewSubmitted}
          userEmail={userEmail}
          userName={userName}
        />
      )}
      
      <ToolReview 
        productSlug={productSlug} 
        title={title} 
      />
    </div>
  )
}

