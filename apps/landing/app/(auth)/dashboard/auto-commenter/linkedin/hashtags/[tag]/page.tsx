// app/(auth)/dashboard/auto-commenter/linkedin/hashtags/[tag]/page.tsx
'use client'

import { useEffect, useState, use } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { Skeleton } from '@repo/ui/components/ui/skeleton'
import CommentForm from '../../../_components/comment-form'

interface Post {
  id: string
  actor: {
    name: string
    profilePicture?: string
  }
  content: {
    text: string
    media?: {
      url: string
      type: string
    }[]
  }
  created: {
    time: number
  }
}

interface HashtagPageProps {
  params: Promise<{
    tag: string
  }>
}

export default function HashtagPage(props: HashtagPageProps) {
  const params = use(props.params);
  const { tag } = params
  const decodedTag = decodeURIComponent(tag)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/ac/linkedin/hashtags?tag=${encodeURIComponent(decodedTag)}`)
        if (!response.ok) {
          throw new Error('Failed to fetch posts')
        }
        const data = await response.json()
        setPosts(data.elements || [])
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [decodedTag])

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/dashboard/auto-commenter/linkedin/hashtags">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">#{decodedTag}</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Posts with #{decodedTag}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-3 w-[100px]" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-24 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        {post.actor.profilePicture && (
                          <img 
                            src={post.actor.profilePicture} 
                            alt={post.actor.name}
                            className="h-10 w-10 rounded-full" 
                          />
                        )}
                        <div>
                          <CardTitle className="text-lg">{post.actor.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {new Date(post.created.time).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p>{post.content.text}</p>
                        {post.content.media?.map((media, index) => (
                          media.type === 'image' && (
                            <img 
                              key={index}
                              src={media.url}
                              alt=""
                              className="rounded-lg max-h-96 w-full object-cover"
                            />
                          )
                        ))}
                        <div className="pt-4">
                          <CommentForm 
                            postUrn={`urn:li:activity:${post.id}`}
                            onCommentCreated={() => {}}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No posts found for #{decodedTag}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}