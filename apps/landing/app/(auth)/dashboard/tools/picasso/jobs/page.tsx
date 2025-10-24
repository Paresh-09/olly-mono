'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FilterX, Download, Trash2, Calendar, ImageIcon, Sparkles, Info, RefreshCw, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';

// Define types
interface ImageGeneration {
  id: string;
  prompt: string;
  imageUrl: string;
  referenceImageUrl?: string;
  style: string;
  customStyle?: string;
  quality?: string;
  size: string;
  createdAt: string;
}

interface StyleStat {
  name: string;
  count: number;
}

export default function PicassoGalleryPage() {
  const router = useRouter();
  const [images, setImages] = useState<ImageGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [styleStats, setStyleStats] = useState<StyleStat[]>([]);
  
  // Filter states
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [dateRange, setDateRange] = useState<string>('all');
  const [filtersVisible, setFiltersVisible] = useState(false);

  // For pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Fetch images
  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', '20');
        
        if (selectedStyle !== 'all') {
          params.append('style', selectedStyle);
        }
        
        if (dateRange !== 'all') {
          params.append('timeframe', dateRange);
        }
        
        params.append('sortOrder', sortOrder);

        const response = await fetch(`/api/tools/picasso/jobs?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch images');
        }
        
        const data = await response.json();
        
        if (page === 1) {
          setImages(data.images);
        } else {
          setImages(prev => [...prev, ...data.images]);
        }
        
        // Set style stats on first load
        if (page === 1) {
          setStyleStats(data.styles);
        }
        
        setTotalPages(data.totalPages);
        setHasMore(page < data.totalPages);
      } catch (err) {
        console.error('Error fetching images:', err);
        setError('Failed to load images. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [page, selectedStyle, dateRange, sortOrder]);
  
  // Handle style filter change
  const handleStyleChange = (style: string) => {
    setSelectedStyle(style);
    setPage(1); // Reset to first page when filter changes
  };
  
  // Handle sort order change
  const handleSortChange = (order: 'newest' | 'oldest') => {
    setSortOrder(order);
    setPage(1); // Reset to first page when sort changes
  };
  
  // Handle date range change
  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    setPage(1); // Reset to first page when date range changes
  };
  
  // Reset filters
  const resetFilters = () => {
    setSelectedStyle('all');
    setDateRange('all');
    setSortOrder('newest');
    setPage(1);
  };
  
  // Load more images
  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };
  
  // Download image
  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectURL = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = objectURL;
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(objectURL);
    } catch (err) {
      console.error('Failed to download image:', err);
    }
  };
  
  // Delete image
  const deleteImage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/tools/picasso/jobs/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete image');
      }
      
      // Remove the deleted image from the state
      setImages(prev => prev.filter(img => img.id !== id));
      
      // Update style stats if needed
      const deletedImage = images.find(img => img.id === id);
      if (deletedImage) {
        setStyleStats(prev => 
          prev.map(style => 
            style.name === deletedImage.style 
              ? { ...style, count: style.count - 1 } 
              : style
          ).filter(style => style.count > 0)
        );
      }
    } catch (err) {
      console.error('Failed to delete image:', err);
    }
  };
  
  // Format image quality for display
  const formatQuality = (quality?: string) => {
    if (!quality) return null;
    return quality.charAt(0).toUpperCase() + quality.slice(1);
  };

  // Get style display name
  const getStyleDisplayName = (style: string, customStyle?: string) => {
    if (style === 'custom' && customStyle) {
      return 'Custom';
    }
    return style.charAt(0).toUpperCase() + style.slice(1);
  };

  return (
    <div className="container mx-auto p-4 max-w-screen-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center">
          <button 
            onClick={() => router.back()} 
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Image Gallery</h1>
            <p className="text-sm text-gray-500">View and manage your generated images</p>
          </div>
        </div>
        
        <button 
          onClick={() => router.push('/dashboard/tools/picasso')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate New Images
        </button>
      </div>
      
      {/* Filters Toggle (Mobile) */}
      <div className="md:hidden mb-4">
        <button 
          onClick={() => setFiltersVisible(!filtersVisible)}
          className="w-full flex items-center justify-between bg-white border border-gray-200 p-3 rounded-md"
        >
          <span className="font-medium">Filters & Sorting</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${filtersVisible ? 'transform rotate-180' : ''}`} />
        </button>
      </div>
      
      {/* Filters */}
      <div className={`mb-6 ${filtersVisible ? 'block' : 'hidden md:block'}`}>
        <div className="bg-white p-4 border-l-4 border-purple-400 rounded-md shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center text-gray-700 font-medium">
              <span>Filters</span>
              
              {/* Reset button - only show if any filters are active */}
              {(selectedStyle !== 'all' || dateRange !== 'all' || sortOrder !== 'newest') && (
                <button 
                  onClick={resetFilters}
                  className="ml-3 text-sm flex items-center text-gray-500 hover:text-gray-700"
                >
                  <FilterX className="w-4 h-4 mr-1" />
                  Reset
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              {/* Style Filter */}
              <div className="flex-1 md:flex-initial">
                <select 
                  value={selectedStyle}
                  onChange={(e) => handleStyleChange(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-300 outline-none"
                >
                  <option value="all">All Styles</option>
                  {styleStats.map(style => (
                    <option key={style.name} value={style.name}>
                      {getStyleDisplayName(style.name)} ({style.count})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Date Range Filter */}
              <div className="flex-1 md:flex-initial">
                <select 
                  value={dateRange}
                  onChange={(e) => handleDateRangeChange(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-300 outline-none"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
              
              {/* Sort Order */}
              <div className="flex-1 md:flex-initial">
                <select 
                  value={sortOrder}
                  onChange={(e) => handleSortChange(e.target.value as 'newest' | 'oldest')}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-300 outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Image Grid */}
      {loading && images.length === 0 ? (
        <div className="flex flex-col justify-center items-center min-h-[300px] bg-white border border-gray-100 rounded-md p-8">
          <RefreshCw className="w-8 h-8 text-purple-500 animate-spin mb-4" />
          <p className="text-gray-500">Loading your images...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      ) : images.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-md p-8 text-center shadow-sm">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
          <p className="text-gray-600 mb-6">
            {selectedStyle !== 'all' || dateRange !== 'all' 
              ? "No images match your current filters." 
              : "You haven't generated any images yet."}
          </p>
          {selectedStyle !== 'all' || dateRange !== 'all' ? (
            <button 
              onClick={resetFilters}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-md mx-2"
            >
              <FilterX className="w-4 h-4 mr-2 inline-block" />
              Reset Filters
            </button>
          ) : (
            <button 
              onClick={() => router.push('/dashboard/tools/picasso')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-md"
            >
              <Sparkles className="w-4 h-4 mr-2 inline-block" />
              Generate Images
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Results count */}
          <div className="text-sm text-gray-500 mb-4">
            Showing {images.length} {images.length === 1 ? 'image' : 'images'}
            {selectedStyle !== 'all' && ` in ${getStyleDisplayName(selectedStyle)} style`}
            {dateRange !== 'all' && ` from ${dateRange}`}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {images.map((image) => (
              <div key={image.id} className="bg-white border border-gray-100 hover:border-purple-200 hover:shadow-sm transition-all rounded-md overflow-hidden">
                {/* Image */}
                <div className="relative aspect-square">
                  <Image 
                    src={image.imageUrl} 
                    alt={image.prompt ? image.prompt.substring(0, 30) : 'Generated image'}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover"
                    priority={false}
                  />
                  
                  {/* Reference image hover overlay */}
                  {image.referenceImageUrl && (
                    <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-70 flex items-center justify-center">
                      <div className="relative w-3/4 h-3/4">
                        <Image 
                          src={image.referenceImageUrl} 
                          alt="Reference image" 
                          fill
                          sizes="(max-width: 640px) 75vw, (max-width: 768px) 37.5vw, (max-width: 1024px) 25vw, 18.75vw"
                          className="object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Image Info */}
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-purple-600 capitalize">
                        {getStyleDisplayName(image.style, image.customStyle)}
                      </span>
                      {formatQuality(image.quality) && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {formatQuality(image.quality)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{format(new Date(image.createdAt), 'MMM d')}</span>
                  </div>
                  
                  {image.prompt && (
                    <p className="text-xs text-gray-700 line-clamp-2 mb-2">{image.prompt}</p>
                  )}
                  
                  {/* Action buttons */}
                  <div className="flex justify-between border-t pt-2 mt-1">
                    <button 
                      onClick={() => downloadImage(image.imageUrl, `image-${image.id}`)}
                      className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-50"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    
                    <button 
                      onClick={() => deleteImage(image.id)}
                      className="text-gray-600 hover:text-red-600 p-1 rounded-full hover:bg-gray-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button 
                onClick={loadMore}
                disabled={loading}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 px-6 py-2 rounded-md disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}