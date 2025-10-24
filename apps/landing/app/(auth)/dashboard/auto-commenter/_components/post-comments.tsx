'use client'

import { useState } from "react"
import CommentForm from "./comment-form"
import { Card } from "@repo/ui/components/ui/card"

interface Comment {
  id: string
  actor: string // URN of the actor
  'actor~'?: { // Decorated profile info
    localizedFirstName: string
    localizedLastName: string
    profilePicture?: {
      'displayImage~'?: {
        elements?: Array<{
          identifiers?: Array<{
            identifier?: string
          }>
        }>
      }
    }
  }
  message: {
    text: string
  }
  created: {
    time: number
  }
}

export default function PostComments({ postUrn }: { postUrn: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/ac/linkedin/comments/${encodeURIComponent(postUrn)}`)
      if (!response.ok) throw new Error('Failed to fetch comments')
      const data = await response.json()
      setComments(data.elements || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  // Rest of the component remains the same, but update the rendering to use the new structure:
  return (
    <div className="space-y-6">
      <CommentForm postUrn={postUrn} onCommentCreated={fetchComments} />
      
      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id} className="p-4">
            <div className="flex items-start gap-4">
              {comment['actor~']?.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier && (
                <img 
                  src={comment['actor~'].profilePicture['displayImage~'].elements[0].identifiers[0].identifier}
                  alt={`${comment['actor~'].localizedFirstName} ${comment['actor~'].localizedLastName}`}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div className="flex-1">
                <div className="font-medium">
                  {comment['actor~'] ? 
                    `${comment['actor~'].localizedFirstName} ${comment['actor~'].localizedLastName}` :
                    'LinkedIn User'}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(comment.created.time).toLocaleString()}
                </div>
                <div className="mt-2">{comment.message.text}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}