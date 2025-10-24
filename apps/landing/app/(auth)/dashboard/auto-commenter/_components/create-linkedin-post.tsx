'use client'

import { useState } from 'react'
import { Button } from '@repo/ui/components/ui/button'
import { Textarea } from '@repo/ui/components/ui/textarea'

export default function LinkedInPost() {
  const [content, setContent] = useState('')
  const [isPosting, setIsPosting] = useState(false)

  const handlePost = async () => {
    if (!content.trim()) return

    setIsPosting(true)
    try {
      const response = await fetch('/api/ac/linkedin/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error('Failed to post')
      }

      setContent('')
      // Show success message or handle response
    } catch (error) {
      console.error('Post error:', error)
      // Show error message
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What do you want to share?"
        rows={4}
        className="w-full"
      />
      <Button 
        onClick={handlePost}
        disabled={isPosting || !content.trim()}
        className="w-full"
      >
        {isPosting ? 'Posting...' : 'Post to LinkedIn'}
      </Button>
    </div>
  )
}