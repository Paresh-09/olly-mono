'use client'
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs';
import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { AlertCircle, ArrowUpRight, BarChart2, Copy, ExternalLink, Link as LinkIcon, Trash2, QrCode, RotateCcw } from 'lucide-react';

// Import QR Code Generator component
import QRCodeGenerator from '../../_components/link-shortner/qr-component';
import StatsCard from './stats-component';
import EmptyState from './empty-state';
import Link from 'next/link';

interface ShortenedLink {
  id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: string;
  clicks: number;
  clickData: { date: string; clicks: number }[];
}

const LinkShortener: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [links, setLinks] = useState<ShortenedLink[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeLink, setActiveLink] = useState<ShortenedLink | null>(null);
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<string>("active");
  const [deletedLinks, setDeletedLinks] = useState<ShortenedLink[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredLinks, setFilteredLinks] = useState<ShortenedLink[]>([]);
  const [filteredDeletedLinks, setFilteredDeletedLinks] = useState<ShortenedLink[]>([]);
  const [qrModalLink, setQrModalLink] = useState<ShortenedLink | null>(null);

  // Load saved links from localStorage on component mount
  useEffect(() => {
    const savedLinks = localStorage.getItem('shortenedLinks');
    if (savedLinks) {
      setLinks(JSON.parse(savedLinks));
    }
    
    const savedDeletedLinks = localStorage.getItem('deletedLinks');
    if (savedDeletedLinks) {
      setDeletedLinks(JSON.parse(savedDeletedLinks));
    }
  }, []);

  // Save links to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('shortenedLinks', JSON.stringify(links));
    // Filter links based on search term
    setFilteredLinks(
      links.filter(link => 
        link.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) || 
        link.shortCode.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [links, searchTerm]);
  
  // Save deleted links to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('deletedLinks', JSON.stringify(deletedLinks));
    // Filter deleted links based on search term
    setFilteredDeletedLinks(
      deletedLinks.filter(link => 
        link.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) || 
        link.shortCode.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [deletedLinks, searchTerm]);

  const generateShortLink = async () => {
    if (!url) {
      setError('Please enter a URL to shorten');
      return;
    }

    try {
      // Validate URL format - add http:// if missing
      let urlToShorten = url;
      if (!/^https?:\/\//i.test(url)) {
        urlToShorten = 'https://' + url;
      }
      
      new URL(urlToShorten);
      
      setError(null);
      setIsGenerating(true);

      // Call the API to generate a short link
      const response = await fetch('/api/tools/link-shortener/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: urlToShorten }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create short link');
      }

      const data = await response.json();
      
      // Add to links array at the beginning
      setLinks(prevLinks => [
        {
          id: data.id,
          originalUrl: data.originalUrl,
          shortCode: data.shortCode,
          createdAt: data.createdAt,
          clicks: data.clicks,
          clickData: data.clickData || []
        }, 
        ...prevLinks
      ]);
      
      // Reset URL input
      setUrl('');
      
    } catch (error) {
      console.error('Error shortening URL:', error);
      setError('Failed to generate short link. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const trackClick = async (link: ShortenedLink) => {
    try {
      // Call the API to track the click
      await fetch(`/api/tools/link-shortener/track/${link.shortCode}`, {
        method: 'GET'
      });
      
      // Update the link's click count locally
      setLinks(prevLinks => 
        prevLinks.map(l => {
          if (l.id === link.id) {
            // Update the click count
            return {
              ...l,
              clicks: l.clicks + 1
            };
          }
          return l;
        })
      );
      
      // Open the original URL
      window.open(link.originalUrl, '_blank');
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  const copyToClipboard = (link: ShortenedLink) => {
    const fullShortUrl = `${window.location.origin}/s/${link.shortCode}`;
    navigator.clipboard.writeText(fullShortUrl).then(() => {
      setCopiedId(link.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const deleteLink = async (id: string) => {
    try {
      // Find the link to be moved to history
      const linkToDelete = links.find(link => link.id === id);
      
      if (linkToDelete) {
        // Add to deleted links history
        setDeletedLinks(prev => [linkToDelete, ...prev]);
      }
      
      // Call the API to delete the link (or implement soft delete if API supports it)
      try {
        await fetch(`/api/tools/link-shortener/delete/${id}`, {
          method: 'DELETE'
        });
      } catch (e) {
        console.error("API delete failed, continuing with local delete", e);
      }
      
      // Remove the link from the local state
      setLinks(prevLinks => prevLinks.filter(link => link.id !== id));
      
      if (activeLink?.id === id) {
        setActiveLink(null);
        setShowAnalytics(false);
      }
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  };
  
  const restoreLink = async (id: string) => {
    // Find the link to restore
    const linkToRestore = deletedLinks.find(link => link.id === id);
    
    if (linkToRestore) {
      try {
        // First try API restore if available
        try {
          await fetch(`/api/tools/link-shortener/restore/${id}`, {
            method: 'POST'
          });
        } catch (e) {
          console.error("API restore failed, recreating link", e);
          // Re-create the link via API as fallback
          await fetch('/api/tools/link-shortener/shorten', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: linkToRestore.originalUrl }),
          });
        }
        
        // Add back to active links
        setLinks(prevLinks => [
          linkToRestore, 
          ...prevLinks
        ]);
        
        // Remove from deleted links
        setDeletedLinks(prevDeleted => prevDeleted.filter(link => link.id !== id));
        
      } catch (error) {
        console.error('Error restoring link:', error);
      }
    }
  };
  
  const permanentlyDeleteLink = (id: string) => {
    // Remove from deleted links history
    setDeletedLinks(prevDeleted => prevDeleted.filter(link => link.id !== id));
  };
  
  const clearAllHistory = () => {
    if (confirm("Are you sure you want to clear all history? This cannot be undone.")) {
      setDeletedLinks([]);
    }
  };

  const getAnalytics = async (link: ShortenedLink) => {
    try {
      // Call the API to get analytics for the link
      const response = await fetch(`/api/tools/link-shortener/analytics/${link.shortCode}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const data = await response.json();
      
      // Update the link with the latest analytics data
      setLinks(prevLinks => 
        prevLinks.map(l => {
          if (l.id === link.id) {
            return {
              ...l,
              clicks: data.clicks,
              clickData: data.clickData
            };
          }
          return l;
        })
      );
      
      // Set the active link and show analytics
      setActiveLink({
        ...link,
        clicks: data.clicks,
        clickData: data.clickData
      });
      setShowAnalytics(true);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      
      // Fallback to show whatever data we have locally
      setActiveLink(link);
      setShowAnalytics(true);
    }
  };
  
  const showQrCode = (link: ShortenedLink) => {
    setQrModalLink(link);
  };
  
  const closeQrModal = () => {
    setQrModalLink(null);
  };

  const closeAnalytics = () => {
    setShowAnalytics(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  const getShortUrl = (shortCode: string) => {
    return `${window.location.origin}/s/${shortCode}`;
  };
  
  const truncateUrl = (url: string, maxLength = 40) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      generateShortLink();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold">URL Shortener</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter URL to Shorten
            </label>
            <div className="flex flex-col md:flex-row gap-3">
              <Input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/very-long-url-that-needs-shortening"
                onKeyDown={handleKeyDown}
                className="flex-grow"
              />
              <Button
                onClick={generateShortLink}
                disabled={isGenerating}
                className="md:w-auto w-full"
              >
                {isGenerating ? 'Generating...' : 'Shorten Link'}
              </Button>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {links.length > 0 && <StatsCard links={links} />}

      <Tabs defaultValue="active" value={selectedTab} onValueChange={setSelectedTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="active" className="relative">
              Active Links
              {links.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {links.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="relative">
              History
              {deletedLinks.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gray-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {deletedLinks.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            {selectedTab === "active" && links.length > 0 && (
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search links..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                {searchTerm && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                    onClick={() => setSearchTerm("")}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                )}
              </div>
            )}
            
            {selectedTab === "history" && deletedLinks.length > 0 && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={clearAllHistory}
              >
                Clear All History
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="active" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              {/* Active Links Table */}
              {links.length > 0 && filteredLinks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white mb-6">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-4 text-left font-medium text-gray-500 uppercase tracking-wider">Short Link</th>
                        <th className="py-3 px-4 text-center font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="py-3 px-4 text-center font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredLinks.map((link) => (
                        <tr key={link.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="max-w-xs truncate">
                              <Link
                                href={link.originalUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <span>{truncateUrl(link.originalUrl)}</span>
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-800">{getShortUrl(link.shortCode)}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => copyToClipboard(link)}
                                className="h-6 w-6"
                              >
                                {copiedId === link.id ? (
                                  <span className="text-green-600 text-xs">Copied!</span>
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </td>
             
                          <td className="py-3 px-4 text-center">{link.clicks}</td>
                          <td className="py-3 px-4">{formatDate(link.createdAt)}</td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => trackClick(link)}
                                title="Visit link"
                                className="h-8 w-8 text-blue-600 hover:text-blue-800"
                              >
                                <ArrowUpRight className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => showQrCode(link)}
                                title="Show QR code"
                                className="h-8 w-8 text-green-600 hover:text-green-800"
                              >
                                <QrCode className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => getAnalytics(link)}
                                title="View analytics"
                                className="h-8 w-8 text-purple-600 hover:text-purple-800"
                              >
                                <BarChart2 className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => deleteLink(link.id)}
                                title="Delete link"
                                className="h-8 w-8 text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState 
                  type={links.length === 0 ? "links" : "search"}
                  message={
                    links.length === 0 
                      ? "Enter a URL above to create your first short link."
                      : `No links found matching "${searchTerm}"`
                  }
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              {/* Deleted Links History */}
              {deletedLinks.length > 0 && filteredDeletedLinks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white mb-6">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-4 text-left font-medium text-gray-500 uppercase tracking-wider">Original URL</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-500 uppercase tracking-wider">Short Code</th>
                        <th className="py-3 px-4 text-center font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="py-3 px-4 text-center font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredDeletedLinks.map((link) => (
                        <tr key={link.id} className="hover:bg-gray-50 text-gray-500">
                          <td className="py-3 px-4">
                            <div className="max-w-xs truncate">
                              {truncateUrl(link.originalUrl)}
                            </div>
                          </td>
                          <td className="py-3 px-4">{link.shortCode}</td>
                          <td className="py-3 px-4 text-center">{link.clicks}</td>
                          <td className="py-3 px-4">{formatDate(link.createdAt)}</td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center space-x-2">
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => restoreLink(link.id)}
                                className="h-8 text-green-600 border-green-600 hover:bg-green-50"
                              >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Restore
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => permanentlyDeleteLink(link.id)}
                                title="Permanently delete"
                                className="h-8 w-8 text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState 
                  type={deletedLinks.length === 0 ? "history" : "search"}
                  message={
                    deletedLinks.length === 0 
                      ? "When you delete links, they'll appear here."
                      : `No deleted links found matching "${searchTerm}"`
                  }
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Analytics Modal */}
      {showAnalytics && activeLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Link Analytics</h3>
              <Button variant="ghost" size="icon" onClick={closeAnalytics}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Original URL</h4>
                <Link
                  href={activeLink.originalUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline break-all"
                >
                  {activeLink.originalUrl}
                </Link>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-green-800 mb-1">Short URL</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 break-all">{getShortUrl(activeLink.shortCode)}</span>
                  <Button
                    variant="ghost" 
                    size="icon"
                    onClick={() => copyToClipboard(activeLink)}
                    className="h-6 w-6"
                  >
                    {copiedId === activeLink.id ? (
                      <span className="text-green-600 text-xs">Copied!</span>
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-purple-800 mb-1">Total Clicks</h4>
                <p className="text-2xl font-bold text-purple-600">{activeLink.clicks}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Click Activity (Last 7 Days)</h4>
              {activeLink.clickData && activeLink.clickData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={activeLink.clickData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="clicks" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No click data available yet.</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={closeAnalytics}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* QR Code Modal */}
      {qrModalLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">QR Code Generator</h3>
              <Button variant="ghost" size="icon" onClick={closeQrModal}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            
            <QRCodeGenerator 
              url={getShortUrl(qrModalLink.shortCode)} 
              shortCode={qrModalLink.shortCode} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Import QR Code components


export default LinkShortener;