// components/hashtag-search.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@repo/ui/components/ui/input'
import { Button } from '@repo/ui/components/ui/button'
import { Search } from 'lucide-react'

export default function HashtagSearch() {
  const [hashtag, setHashtag] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (hashtag.trim()) {
      router.push(`/hashtags/${encodeURIComponent(hashtag.trim().replace('#', ''))}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <Input
        value={hashtag}
        onChange={(e) => setHashtag(e.target.value)}
        placeholder="Search hashtag..."
        className="min-w-[200px]"
      />
      <Button type="submit" disabled={!hashtag.trim()}>
        <Search className="h-4 w-4" />
        <span className="ml-2">Search</span>
      </Button>
    </form>
  )
}