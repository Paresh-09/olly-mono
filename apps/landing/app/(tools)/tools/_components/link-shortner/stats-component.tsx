'use client'
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Copy, Link, MousePointerClick, Calendar } from 'lucide-react';

interface StatsCardProps {
  links: {
    id: string;
    originalUrl: string;
    shortCode: string;
    createdAt: string;
    clicks: number;
    clickData?: { date: string; clicks: number }[];
  }[];
}

const StatsCard: React.FC<StatsCardProps> = ({ links }) => {
  const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);
  const totalLinks = links.length;
  

  const mostClickedLink = links.length > 0 
    ? links.reduce((prev, current) => (prev.clicks > current.clicks) ? prev : current)
    : null;
    
 
  const newestLink = links.length > 0 
    ? links.reduce((prev, current) => {
        const prevDate = new Date(prev.createdAt);
        const currentDate = new Date(current.createdAt);
        return currentDate > prevDate ? current : prev;
      })
    : null;
  

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
  };
  
  const truncateUrl = (url: string, maxLength = 25) => {
    if (!url || url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Total Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className="mr-4 rounded-full p-2 bg-blue-100">
              <Link className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalLinks}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Total Clicks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className="mr-4 rounded-full p-2 bg-green-100">
              <MousePointerClick className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalClicks}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Most Clicked Link</CardTitle>
        </CardHeader>
        <CardContent>
          {mostClickedLink ? (
            <div className="flex flex-col">
              <p className="text-lg font-bold">{mostClickedLink.clicks} clicks</p>
              <p className="text-xs text-gray-500 truncate" title={mostClickedLink.originalUrl}>
                {truncateUrl(mostClickedLink.originalUrl)}
              </p>
            </div>
          ) : (
            <p className="text-gray-400">No links yet</p>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Latest Link</CardTitle>
        </CardHeader>
        <CardContent>
          {newestLink ? (
            <div className="flex flex-col">
              <p className="text-lg font-bold">{getRelativeTime(newestLink.createdAt)}</p>
              <p className="text-xs text-gray-500 truncate" title={newestLink.originalUrl}>
                {truncateUrl(newestLink.originalUrl)}
              </p>
            </div>
          ) : (
            <p className="text-gray-400">No links yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCard;