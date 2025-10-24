'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/components/ui/card'
import { Trash2, Loader2, AlertCircle, Tag } from 'lucide-react'
import { toast } from '@repo/ui/hooks/use-toast'
import { type Hashtag, type Url } from '@/types/auto-comment'
import {
 AlertDialog,
 AlertDialogContent, 
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
} from '@repo/ui/components/ui/alert-dialog'

const HASHTAGS: Hashtag[] = [
 'SALES', 'TECHNOLOGY', 'GENAI', 'MARKETING', 'STARTUP',
 'CONTENTCREATION', 'SOFTWAREENGINEERING', 'ECOMMERCE',
 'TRENDING', 'FASHION', 'HIRING'
]

const formatHashtag = (hashtag: string) => {
 return hashtag.split('_').map(word => 
   word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
 ).join(' ')
}

const removeUrlsParams = (url: string): string => {
 try {
   
   const baseUrl = url.split('?')[0].split('#')[0]
   const cleanedUrl = baseUrl.replace(/\/+$/, '')
   return cleanedUrl
 } catch (error) {
   console.error('URL sanitization error:', error)
   return url
 }
}

const isLinkedInPostUrl = (url: string): boolean => {
 const linkedInPostRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/(feed\/update|posts)\/([^\/]+)(\/|-)[a-zA-Z0-9-_]+$/
 return linkedInPostRegex.test(url)
}

const AddPosts = () => {
 const [urlInput, setUrlInput] = useState('')
 const [urls, setUrls] = useState<Url[]>([])
 const [nextId, setNextId] = useState(1)
 const [isLoading, setIsLoading] = useState(false)
 const [showConfirmDialog, setShowConfirmDialog] = useState(false)
 const [selectedHashtag, setSelectedHashtag] = useState<Hashtag | null>(null)

 const processUrls = (input: string): string[] => {
   return input
     .split(/[\n,\s]+/)
     .map(url => removeUrlsParams(url.trim()))
     .filter(url => url !== '')
 }

 const addUrls = (urlsToAdd: string[]) => {
   if (!selectedHashtag) {
     toast({
       title: "No Hashtag Selected",
       description: "Please select a hashtag before adding URLs.",
       variant: "destructive",
     })
     return
   }

   const newUrls = urlsToAdd.map((url, index) => {
     let isValid = true
     let errorType: 'invalid' | 'non-linkedin' | undefined

     if (!isLinkedInPostUrl(url)) {
       isValid = false
       errorType = 'non-linkedin'
     }

     const isDuplicate = urls.some(existingUrl => existingUrl.url === url)
     if (isDuplicate) {
       isValid = false
       errorType = 'invalid'
       toast({
         title: "Duplicate URL",
         description: "This URL has already been added.",
         variant: "destructive",
       })
       return null
     }

     return {
       id: nextId + index,
       url,
       isValid,
       errorType,
       hashtag: selectedHashtag
     }
   }).filter(Boolean) as Url[]

   setUrls(prevUrls => [...prevUrls, ...newUrls])
   setNextId(nextId + urlsToAdd.length)
   setUrlInput('')
 }

 const handleHashtagChange = (hashtag: Hashtag) => {
   setSelectedHashtag(prevHashtag => prevHashtag === hashtag ? null : hashtag)
 }

 const handleSubmitUrls = async () => {
   const validUrls = urls.filter(url => url.isValid)
   
   if (validUrls.length === 0) {
     toast({
       title: "No Valid URLs to Submit",
       description: "Please add at least one valid LinkedIn post URL before submitting.",
       variant: "destructive",
     })
     return
   }

   setIsLoading(true)
   try {
     const response = await fetch('/api/auto-commenter/linkedin/addPosts', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({ 
         urls: validUrls.map(u => ({
           url: u.url,
           hashtag: u.hashtag
         }))
       }),
     })

     const data = await response.json()

     if (!response.ok) throw new Error(data.error || 'Failed to save URLs')

     if (data.addedUrls === 0) {
       toast({
         title: "URLs Already Exist",
         description: "All URLs have already been added previously.",
       })
     } else {
       toast({
         title: "Success!",
         description: `Added ${data.addedUrls} new URL${data.addedUrls !== 1 ? 's' : ''}${
           data.skippedUrls > 0 ? ` (${data.skippedUrls} already existed)` : ''
         }.`,
       })
     }

     setUrls([])
     setSelectedHashtag(null)
     setNextId(1)
     setShowConfirmDialog(false)
   } catch (error) {
     console.error(error)
     toast({
       title: "Error",
       description: error instanceof Error ? error.message : "Failed to save URLs. Please try again.",
       variant: "destructive",
     })
   } finally {
     setIsLoading(false)
   }
 }

 return (
   <div className="container mx-auto py-8">
     <Card>
       <CardHeader>
         <div className="flex items-center justify-between">
           <div>
             <CardTitle className="flex items-center gap-2">
               Add Post URLs to Comment
             </CardTitle>
             <CardDescription>
               Select a hashtag and add LinkedIn post Url's for auto-commenting
             </CardDescription>
           </div>
           {urls.length > 0 && (
             <Button
               variant="ghost"
               size="icon"
               onClick={() => setUrls([])}
               disabled={isLoading}
               className="text-muted-foreground hover:text-destructive"
             >
               <Trash2 className="h-5 w-5" />
             </Button>
           )}
         </div>
       </CardHeader>
       <CardContent>
         <div className="mb-6">
           <label className="text-sm font-medium mb-2 block">Select a Hashtag</label>
           <div className="flex flex-wrap gap-2">
             {HASHTAGS.map((hashtag) => (
               <Button
                 key={hashtag}
                 variant={selectedHashtag === hashtag ? "default" : "outline"}
                 size="sm"
                 onClick={() => handleHashtagChange(hashtag)}
                 className="flex items-center gap-1"
               >
                 <Tag className="h-3 w-3" />
                 {formatHashtag(hashtag)}
               </Button>
             ))}
           </div>
         </div>

         <form onSubmit={(e) => {
           e.preventDefault()
           if (!urlInput.trim()) return
           const newUrls = processUrls(urlInput)
           addUrls(newUrls)
         }} className="flex gap-2 mb-6">
           <Input
             type="text"
             value={urlInput}
             onChange={(e) => {
               setUrlInput(e.target.value)
               const detectedUrls = processUrls(e.target.value)
               if (detectedUrls.length > 1) {
                 addUrls(detectedUrls)
               }
             }}
             placeholder="Enter LinkedIn post URLs (separated by spaces, commas, or newlines)"
             className="flex-1"
           />
           <Button type="submit" disabled={!selectedHashtag}>Add URL</Button>
         </form>

         <div className="space-y-2">
           {urls.map((url) => (
             <div 
               key={url.id} 
               className={`flex items-center gap-2 p-2 rounded-lg ${
                 url.isValid ? 'bg-secondary' : 'bg-red-100 dark:bg-red-900/20'
               }`}
             >
               <div className="flex-1">
                 <div className="break-all">{url.url}</div>
                 {url.isValid && url.hashtag && (
                   <div className="text-sm text-muted-foreground mt-1">
                     #{formatHashtag(url.hashtag)}
                   </div>
                 )}
                 {!url.isValid && (
                   <div className="text-sm text-red-500 dark:text-red-400 mt-1 flex items-center gap-1">
                     <AlertCircle className="h-4 w-4" />
                     Not a LinkedIn post URL
                   </div>
                 )}
               </div>
               <Button
                 variant="ghost"
                 size="icon"
                 onClick={() => setUrls(prevUrls => prevUrls.filter(u => u.id !== url.id))}
               >
                 <Trash2 className="h-4 w-4" />
               </Button>
             </div>
           ))}
         </div>

         {urls.length > 0 && (
           <div className="mt-6">
             <Button
               className="w-40"
               onClick={() => setShowConfirmDialog(true)}
               disabled={isLoading || !urls.some(url => url.isValid)}
             >
               {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               Submit {urls.filter(url => url.isValid).length} URL{urls.filter(url => url.isValid).length !== 1 ? 's' : ''}
             </Button>
           </div>
         )}
       </CardContent>
     </Card>

     <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
       <AlertDialogContent>
         <AlertDialogHeader>
           <AlertDialogTitle>Confirm Submission</AlertDialogTitle>
           <AlertDialogDescription>
             Are you sure you want to submit {urls.filter(url => url.isValid).length} URL{urls.filter(url => url.isValid).length !== 1 ? 's' : ''}?
             This action cannot be undone.
           </AlertDialogDescription>
         </AlertDialogHeader>
         <AlertDialogFooter>
           <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
             Cancel
           </Button>
           <Button onClick={handleSubmitUrls} disabled={isLoading}>
             {isLoading ? 'Submitting...' : 'Submit'}
           </Button>
         </AlertDialogFooter>
       </AlertDialogContent>
     </AlertDialog>
   </div>
 )
}

export default AddPosts