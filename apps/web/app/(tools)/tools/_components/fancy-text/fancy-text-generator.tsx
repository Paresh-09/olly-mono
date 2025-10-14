'use client'

import React, { useState, useEffect, FC } from 'react'
import { Card, CardContent } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Label } from '@repo/ui/components/ui/label'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs'
import { 
  transformToAllStyles, 
  getAvailableStyles, 
  FavoriteStyle, 
  StyleResult 
} from '@/lib/tools/fancy-text-tranformer'
import { CopyButton } from './copy-btn'

// Define category groups for styles
type StyleCategoryGroups = {
  [key: string]: StyleResult[];
}

interface StyleCardProps {
  result: StyleResult;
  isFavorite: boolean;
  toggleFavorite: () => void;
}

// StyleCard component with TypeScript
const StyleCard: FC<StyleCardProps> = ({ result, isFavorite, toggleFavorite }) => {
  return (
    <Card className="group relative transition-all hover:shadow-md">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="space-y-1 w-full">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">{result.name}</p>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFavorite}
                className="h-8 px-2 text-xs"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={`w-4 h-4 ${isFavorite ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
              <CopyButton text={result.text} />
            </div>
          </div>
          <p className="text-lg break-words">{result.text}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export const FancyTextGenerator: FC = () => {
  const [inputText, setInputText] = useState<string>('')
  const [outputResults, setOutputResults] = useState<StyleResult[]>([])
  const [favorites, setFavorites] = useState<FavoriteStyle[]>([])
  const [activeTab, setActiveTab] = useState<string>('all')
  const [styleCategories, setStyleCategories] = useState<StyleCategoryGroups>({})

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('textStyleFavorites')
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch (e) {
        console.error('Error loading favorites:', e)
      }
    }
  }, [])

  // Generate fancy text when input changes
  useEffect(() => {
    if (inputText) {
      const results = transformToAllStyles(inputText)
      setOutputResults(results)
      
      // Group styles by category
      const categories: StyleCategoryGroups = {
        'Mathematical': results.filter(r => 
          ['serif', 'serifBold', 'sansSerif', 'sansSerifBold', 'italic', 'monospace', 'doubleStruck'].includes(r.key)
        ),
        'Decorative': results.filter(r => 
          ['script', 'boldScript', 'fraktur', 'circled', 'bubbles'].includes(r.key)
        ),
        'Aesthetic': results.filter(r => 
          ['vaporwave', 'smallCaps'].includes(r.key)
        )
      }
      
      setStyleCategories(categories)
    } else {
      setOutputResults([])
      setStyleCategories({})
    }
  }, [inputText])

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('textStyleFavorites', JSON.stringify(favorites))
  }, [favorites])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value)
  }

  const toggleFavorite = (result: StyleResult) => {
    const exists = favorites.some(fav => fav.key === result.key)
    
    if (exists) {
      // Remove from favorites
      setFavorites(favorites.filter(fav => fav.key !== result.key))
    } else {
      // Add to favorites with current text
      setFavorites([...favorites, { 
        key: result.key, 
        name: result.name,
        text: result.text 
      }])
    }
  }

  const isFavorite = (key: string): boolean => {
    return favorites.some(fav => fav.key === key)
  }

  // Clear all generated text
  const handleClear = () => {
    setInputText('')
    setOutputResults([])
  }

  return (
    <div className="space-y-6">
      <Card className="relative">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="input-text" className="text-base font-medium">
                Enter Your Text
              </Label>
              <Textarea
                id="input-text"
                placeholder="Type your text here to convert it to fancy text..."
                className="mt-1.5 min-h-24"
                value={inputText}
                onChange={handleInputChange}
              />
              {inputText && (
                <div className="mt-2 flex justify-end">
                  <Button variant="outline" size="sm" onClick={handleClear}>
                    Clear
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {outputResults.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Styles</TabsTrigger>
                <TabsTrigger value="mathematical">Mathematical</TabsTrigger>
                <TabsTrigger value="decorative">Decorative</TabsTrigger>
                <TabsTrigger value="aesthetic">Aesthetic</TabsTrigger>
                <TabsTrigger value="favorites" disabled={favorites.length === 0}>
                  Favorites {favorites.length > 0 && `(${favorites.length})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <div className="grid gap-4">
                  {outputResults.map((result) => (
                    <StyleCard 
                      key={result.key}
                      result={result}
                      isFavorite={isFavorite(result.key)}
                      toggleFavorite={() => toggleFavorite(result)}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="mathematical" className="space-y-4">
                <div className="grid gap-4">
                  {styleCategories['Mathematical']?.map((result) => (
                    <StyleCard 
                      key={result.key}
                      result={result}
                      isFavorite={isFavorite(result.key)}
                      toggleFavorite={() => toggleFavorite(result)}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="decorative" className="space-y-4">
                <div className="grid gap-4">
                  {styleCategories['Decorative']?.map((result) => (
                    <StyleCard 
                      key={result.key}
                      result={result}
                      isFavorite={isFavorite(result.key)}
                      toggleFavorite={() => toggleFavorite(result)}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="aesthetic" className="space-y-4">
                <div className="grid gap-4">
                  {styleCategories['Aesthetic']?.map((result) => (
                    <StyleCard 
                      key={result.key}
                      result={result}
                      isFavorite={isFavorite(result.key)}
                      toggleFavorite={() => toggleFavorite(result)}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="favorites" className="space-y-4">
                {favorites.length > 0 ? (
                  <div className="grid gap-4">
                    {favorites.map((fav) => (
                      <Card key={fav.key} className="group relative transition-all hover:shadow-md">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="space-y-1 w-full">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-500">{fav.name}</p>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleFavorite({
                                    key: fav.key,
                                    name: fav.name,
                                    text: inputText ? outputResults.find(r => r.key === fav.key)?.text || '' : fav.text
                                  })}
                                  className="h-8 px-2 text-xs"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-4 h-4 text-yellow-400"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </Button>
                                <CopyButton text={inputText ? outputResults.find(r => r.key === fav.key)?.text || '' : fav.text} />
                              </div>
                            </div>
                            <p className="text-lg break-words">
                              {inputText ? outputResults.find(r => r.key === fav.key)?.text || '' : fav.text}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No favorites saved yet.</p>
                    <p className="text-sm mt-2">Click the star icon on any style to add it to your favorites.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}