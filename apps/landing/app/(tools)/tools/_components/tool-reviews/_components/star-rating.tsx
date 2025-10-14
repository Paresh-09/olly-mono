// components/product-reviews/star-rating.tsx
type StarRatingProps = {
    rating: number
    size?: 'sm' | 'md' | 'lg'
    interactive?: boolean
    onChange?: (rating: number) => void
  }
  
  export function StarRating({ 
    rating, 
    size = 'md', 
    interactive = false,
    onChange
  }: StarRatingProps) {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    }
    
    const renderStar = (position: number) => {
      const filled = position <= Math.round(rating)
      
      return (
        <button
          key={position}
          disabled={!interactive}
          onClick={() => interactive && onChange?.(position)}
          className={`${interactive ? 'cursor-pointer' : ''}`}
        >
          <svg 
            className={`${sizeClasses[size]} ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M10 15.28l6.18 3.73-1.64-7.03L20 7.24l-7.19-.62L10 0 7.19 6.62 0 7.24l5.46 4.73L3.82 19 10 15.28z" 
              clipRule="evenodd" 
            />
          </svg>
        </button>
      )
    }
  
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map(renderStar)}
      </div>
    )
  }
  