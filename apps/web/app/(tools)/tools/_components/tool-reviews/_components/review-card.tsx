// components/product-reviews/review-card.tsx
import { formatDistanceToNow } from 'date-fns'
import { StarRating } from './star-rating'
import { ToolReview } from './tool-review'
import Image from 'next/image'

type ReviewCardProps = {
  review: ToolReview
}

export function ReviewCard({ review }: ReviewCardProps) {
  const formattedDate = formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })
    .replace(/months?/g, 'mon')
    .replace(/years?/g, 'yr')
    .replace(/weeks?/g, 'wk')
    .replace(/days?/g, 'd')

  return (
    <div className="border-b border-gray-100 pb-4 last:border-0">
      <div className="flex flex-col gap-2 mb-3">
        <div className="flex items-center">
          {review.authorPicture ? (
            <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
              <Image 
                src={review.authorPicture} 
                alt={review.authorName} 
                width={32} 
                height={32}
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 flex-shrink-0">
              <span className="text-gray-500 text-sm font-medium">
                {review.authorName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-2 min-w-0">
            <StarRating rating={review.rating} />
            <h3 className="font-medium text-sm sm:text-base truncate">{review.authorName}</h3>
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-2 text-xs text-gray-500">
          {review.isVerified && (
            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full flex-shrink-0">
              Verified
            </span>
          )}
          <span className="flex-shrink-0">{formattedDate}</span>
        </div>
      </div>
      
      <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{review.reviewBody}</p>
    </div>
  )
}