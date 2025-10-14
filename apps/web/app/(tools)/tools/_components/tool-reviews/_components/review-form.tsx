// components/product-reviews/review-form.tsx
import { useState } from 'react'
import { StarRating } from './star-rating'

type ReviewFormProps = {
  productSlug: string
  onSuccess?: () => void
  userEmail?: string
  userName?: string
}

export function ReviewForm({
  productSlug,
  onSuccess,
  userEmail,
  userName
}: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [reviewBody, setReviewBody] = useState('')
  const [authorName, setAuthorName] = useState(userName || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    if (!reviewBody.trim()) {
      setError('Please enter a review')
      return
    }

    if (!authorName.trim()) {
      setError('Please enter your name')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Submit to your existing API endpoint using POST
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productSlug,
          rating,
          reviewBody,
          authorName,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit review')
      }

      setSuccess(true)
      setRating(0)
      setReviewBody('')
      
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 p-4 rounded-lg text-green-800 mb-6">
        <h3 className="font-medium">Thank you for your review!</h3>
        <p>Your review has been submitted and is pending approval.</p>
        <button 
          onClick={() => setSuccess(false)}
          className="mt-2 text-green-700 underline"
        >
          Write another review
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-6">
      <h3 className="text-lg font-medium mb-4">Write a Review</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block mb-2 font-medium">Rating</label>
        <StarRating 
          rating={rating} 
          interactive 
          onChange={setRating} 
          size="lg"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="reviewBody" className="block mb-2 font-medium">
          Your Review
        </label>
        <textarea
          id="reviewBody"
          value={reviewBody}
          onChange={(e) => setReviewBody(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md"
          rows={4}
          placeholder="What did you like or dislike about this tool?"
          required
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="authorName" className="block mb-2 font-medium">
          Your Name
        </label>
        <input
          id="authorName"
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md"
          placeholder="Your name"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}