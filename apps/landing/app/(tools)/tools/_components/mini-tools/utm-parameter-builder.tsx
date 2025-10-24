'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@repo/ui/components/ui/card'
import { Input } from '@repo/ui/components/ui/input'
import { Button } from '@repo/ui/components/ui/button'
import { Label } from '@repo/ui/components/ui/label'
import { ClipboardCopy, RefreshCw, Check } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@repo/ui/components/ui/select'
import { Alert, AlertDescription } from '@repo/ui/components/ui/alert'

// Common UTM source and medium options
const commonSources = [
  'google', 'facebook', 'instagram', 'twitter', 'linkedin',
  'pinterest', 'email', 'newsletter', 'youtube', 'tiktok', 'bing'
]

const commonMediums = [
  'cpc', 'organic', 'social', 'email', 'referral', 'display',
  'paid-social', 'paid-search', 'banner', 'affiliate'
]

export default function UTMParameterBuilder() {
  const [url, setUrl] = useState('')
  const [source, setSource] = useState('')
  const [customSource, setCustomSource] = useState('')
  const [medium, setMedium] = useState('')
  const [customMedium, setCustomMedium] = useState('')
  const [campaign, setCampaign] = useState('')
  const [term, setTerm] = useState('')
  const [content, setContent] = useState('')
  const [generatedUrl, setGeneratedUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const generateUrl = () => {
    // Reset states
    setError('')
    setCopied(false)

    // Validate URL
    if (!url) {
      setError('Please enter a valid URL')
      return
    }

    try {
      // Check if URL is valid and properly formatted
      new URL(url.trim().toLowerCase())
    } catch (e) {
      setError('Please enter a valid URL with http:// or https://')
      return
    }

    // Validate required UTM parameters
    if ((!source || source === "none") && !customSource || (!medium || medium === "none") && !customMedium) {
      setError('UTM source and medium are required')
      return
    }

    // Clean up the base URL
    let baseUrl = url.trim()

    // Start building UTM parameters
    const params = new URLSearchParams()

    // Add UTM source (prioritize custom value if entered)
    const finalSource = customSource || source
    if (finalSource) {
      params.append('utm_source', finalSource.trim().toLowerCase())
    }

    // Add UTM medium (prioritize custom value if entered)
    const finalMedium = customMedium || medium
    if (finalMedium) {
      params.append('utm_medium', finalMedium.trim().toLowerCase())
    }

    // Add optional parameters if they exist
    if (campaign) {
      params.append('utm_campaign', campaign.trim().toLowerCase())
    }

    if (term) {
      params.append('utm_term', term.trim())
    }

    if (content) {
      params.append('utm_content', content.trim().toLowerCase())
    }

    // Combine the URL and parameters
    const queryString = params.toString()
    const separator = baseUrl.includes('?') ? '&' : '?'
    const finalUrl = `${baseUrl}${separator}${queryString}`

    setGeneratedUrl(finalUrl)
  }

  const copyToClipboard = async () => {
    if (generatedUrl) {
      try {
        await navigator.clipboard.writeText(generatedUrl)
        setCopied(true)

        // Reset copied status after 2 seconds
        setTimeout(() => {
          setCopied(false)
        }, 2000)
      } catch (err) {
        console.error('Failed to copy: ', err)
      }
    }
  }

  const resetForm = () => {
    setUrl('')
    setSource('')
    setCustomSource('')
    setMedium('')
    setCustomMedium('')
    setCampaign('')
    setTerm('')
    setContent('')
    setGeneratedUrl('')
    setError('')
    setCopied(false)
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>UTM Parameter Builder</CardTitle>
        <CardDescription>
          Create trackable campaign URLs with UTM parameters for better marketing analytics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* URL Input */}
        <div className="space-y-2">
          <Label htmlFor="url" className="font-medium">
            Website URL <span className="text-red-500">*</span>
          </Label>
          <Input
            id="url"
            placeholder="https://yourdomain.com/landing-page"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <p className="text-sm text-gray-500">
            Enter the full URL including https://
          </p>
        </div>

        {/* UTM Source Input */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="source" className="font-medium">
              Campaign Source <span className="text-red-500">*</span>
            </Label>
            <Select value={source} onValueChange={(value) => {
              setSource(value)
              if (value) setCustomSource('')
            }}>
              <SelectTrigger id="source">
                <SelectValue placeholder="Select or enter custom" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select a source</SelectItem>
                {commonSources.map((src) => (
                  <SelectItem key={src} value={src}>{src}</SelectItem>
                ))}
                <SelectItem value="custom">Enter custom source</SelectItem>
              </SelectContent>
            </Select>
            {source === 'custom' && (
              <Input
                className="mt-2"
                placeholder="Enter custom source"
                value={customSource}
                onChange={(e) => setCustomSource(e.target.value)}
              />
            )}
            <p className="text-sm text-gray-500">
              Identifies which site sent the traffic (e.g., google, facebook)
            </p>
          </div>

          {/* UTM Medium Input */}
          <div className="space-y-2">
            <Label htmlFor="medium" className="font-medium">
              Campaign Medium <span className="text-red-500">*</span>
            </Label>
            <Select value={medium} onValueChange={(value) => {
              setMedium(value)
              if (value) setCustomMedium('')
            }}>
              <SelectTrigger id="medium">
                <SelectValue placeholder="Select or enter custom" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select a medium</SelectItem>
                {commonMediums.map((med) => (
                  <SelectItem key={med} value={med}>{med}</SelectItem>
                ))}
                <SelectItem value="custom">Enter custom medium</SelectItem>
              </SelectContent>
            </Select>
            {medium === 'custom' && (
              <Input
                className="mt-2"
                placeholder="Enter custom medium"
                value={customMedium}
                onChange={(e) => setCustomMedium(e.target.value)}
              />
            )}
            <p className="text-sm text-gray-500">
              Marketing medium (e.g., cpc, email, social)
            </p>
          </div>
        </div>

        {/* Optional UTM Parameters */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Campaign Name */}
          <div className="space-y-2">
            <Label htmlFor="campaign" className="font-medium">
              Campaign Name
            </Label>
            <Input
              id="campaign"
              placeholder="spring_sale"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              Product, promo code, or slogan
            </p>
          </div>

          {/* Campaign Term */}
          <div className="space-y-2">
            <Label htmlFor="term" className="font-medium">
              Campaign Term
            </Label>
            <Input
              id="term"
              placeholder="running+shoes"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              Identify paid search keywords
            </p>
          </div>
        </div>

        {/* Campaign Content */}
        <div className="space-y-2">
          <Label htmlFor="content" className="font-medium">
            Campaign Content
          </Label>
          <Input
            id="content"
            placeholder="top-banner"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <p className="text-sm text-gray-500">
            Used to differentiate similar content or links (e.g., logolink, textlink)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button className="w-full" onClick={generateUrl}>
            Generate UTM URL
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={resetForm}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset Form
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Generated URL Output */}
        {generatedUrl && (
          <div className="mt-6 space-y-3">
            <Label className="font-medium">Your Campaign URL:</Label>
            <div className="flex">
              <Input
                readOnly
                value={generatedUrl}
                className="rounded-r-none font-mono text-sm"
              />
              <Button
                variant="secondary"
                className="rounded-l-none"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <ClipboardCopy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Use this URL in your marketing campaigns to track performance
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}