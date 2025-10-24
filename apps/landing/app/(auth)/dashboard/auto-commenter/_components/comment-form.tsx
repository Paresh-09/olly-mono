'use client'

import { useState } from 'react'
import { Button } from '@repo/ui/components/ui/button'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { toast } from '@repo/ui/hooks/use-toast'

interface CommentFormProps {
  postUrn: string
  onCommentCreated?: () => void
}

export default function CommentForm({ postUrn, onCommentCreated }: CommentFormProps) {
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!comment.trim()) return
  
      setIsSubmitting(true)
      try {

        
        const response = await fetch('/api/ac/linkedin/comments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            postUrn,
            comment: comment.trim()
          }),
        })
  
        const data = await response.json()
  
        if (!response.ok) {
          throw new Error(data.error || 'Failed to create comment')
        }
  
        toast({
          title: 'Success',
          description: 'Comment posted successfully',
        })
        
        setComment('')
        onCommentCreated?.()
      } catch (error: any) {
        console.error('Comment error:', error)
        toast({
          title: 'Error',
          description: error.message || 'Failed to post comment',
          variant: 'destructive',
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your comment..."
          className="min-h-[100px]"
          disabled={isSubmitting}
        />
        <Button 
          type="submit" 
          disabled={isSubmitting || !comment.trim()}
          className="w-full"
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </Button>
      </form>
    )
  }