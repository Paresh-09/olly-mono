'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { AlertCircle, ArrowRight, KeyRound, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@repo/ui/components/ui/alert'
import { toast } from 'sonner'

interface WorkshopInfo {
  id: string
  name: string
  canJoin: boolean
  needsAccessCode: boolean
  joinMode: string
  message?: string
}

export default function JoinWorkshopForm() {
  const router = useRouter()
  const [workshopId, setWorkshopId] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleJoinWorkshop = async () => {
    if (!workshopId.trim()) {
      toast.error('Please enter a workshop ID')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // First, check if the workshop exists
      const response = await axios.get(`/api/workshops/join?workshopId=${workshopId.trim()}${accessCode ? `&accessCode=${accessCode.trim()}` : ''}`)
      const info = response.data

      // If we need an access code but it wasn't provided
      if (!info.canJoin && info.needsAccessCode && !accessCode) {
        setError('This workshop requires an access code')
        setLoading(false)
        return
      }

      // If any other reason we can't join
      if (!info.canJoin) {
        setError(info.message || 'Unable to join workshop')
        setLoading(false)
        return
      }

      // All good, navigate to participant page with both params
      router.push(`/tools/workshop-group-organizer/participant?workshopId=${workshopId.trim()}${accessCode ? `&accessCode=${accessCode.trim()}` : ''}`)

    } catch (err: any) {
      console.error('Error checking workshop:', err)
      setError(err.response?.data?.error || 'Workshop not found')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join a Workshop</CardTitle>
        <CardDescription>
          Enter the workshop ID and access code provided by your instructor
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="workshop-id">Workshop ID*</Label>
          <Input
            id="workshop-id"
            placeholder="Enter workshop ID"
            value={workshopId}
            onChange={e => setWorkshopId(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && workshopId.trim()) {
                handleJoinWorkshop()
              }
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="access-code">Access Code (if required)</Label>
          <Input
            id="access-code"
            placeholder="Enter access code"
            value={accessCode}
            onChange={e => setAccessCode(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && workshopId.trim()) {
                handleJoinWorkshop()
              }
            }}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleJoinWorkshop}
          className="w-full"
          disabled={loading || !workshopId.trim()}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>Join Workshop<ArrowRight className="ml-2 h-4 w-4" /></>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
} 