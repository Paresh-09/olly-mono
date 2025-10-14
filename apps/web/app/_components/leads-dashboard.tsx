'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Label } from '@repo/ui/components/ui/label';
import { Loader2, Search, Copy, ExternalLink, CreditCard, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs';
import LeadSearch from './LeadSearch';
import { Lead, CreditInfo } from '@/app/_types';

export default function LeadsDashboard() {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [currentLead, setCurrentLead] = useState<Lead | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('url');
  const [creditInfo, setCreditInfo] = useState<CreditInfo>({});

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setIsLoadingLeads(true);
    try {
      const response = await fetch('/api/lead');
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }
      const data = await response.json();
      setLeads(data.leads);
    } catch (err) {
      console.error('Error fetching leads:', err);
      toast.error('Failed to fetch leads');
    } finally {
      setIsLoadingLeads(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!linkedinUrl) {
      toast.error('Please enter a LinkedIn URL');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setCurrentLead(null);
    setCreditInfo({});
    
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkedinUrl
        }),
      });
      
      const data = await response.json();
      
      if (response.status === 402) {
        // Insufficient credits
        setCreditInfo({
          insufficientCredits: true,
          creditCost: data.creditCost,
          currentBalance: data.currentBalance
        });
        throw new Error(`Insufficient credits. You need ${data.creditCost} credits but have ${data.currentBalance}.`);
      }
      
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to find lead');
      }
      
      setCurrentLead(data.lead);
      setFromCache(data.fromCache);
      
      // Add the new lead to the leads list if it's not already there
      setLeads(prevLeads => {
        const exists = prevLeads.some(lead => lead.id === data.lead.id);
        if (!exists) {
          return [data.lead, ...prevLeads];
        }
        return prevLeads;
      });
      
      if (data.fromCache) {
        toast.success('Lead found in database!');
      } else {
        setCreditInfo({
          creditsUsed: data.creditsUsed,
          remainingCredits: data.remainingCredits
        });
        toast.success(`Lead found and saved! Used ${data.creditsUsed} credits.`);
      }
    } catch (err) {
      console.error('Error finding lead:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error('Failed to find lead');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleBuyCredits = () => {
    window.location.href = '/plans';
  };

  const filteredLeads = leads.filter(lead => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      lead.firstName?.toLowerCase().includes(searchLower) ||
      lead.lastName?.toLowerCase().includes(searchLower) ||
      lead.email?.toLowerCase().includes(searchLower) ||
      lead.company?.toLowerCase().includes(searchLower) ||
      lead.title?.toLowerCase().includes(searchLower) ||
      lead.seniority?.toLowerCase().includes(searchLower) ||
      lead.location?.toLowerCase().includes(searchLower) ||
      lead.organizationDomain?.toLowerCase().includes(searchLower)
    );
  });

  const selectLead = (lead: Lead) => {
    setCurrentLead(lead);
    setFromCache(true);
  };

  const handleSearchComplete = (newLeads: Lead[]) => {
    // Add new leads to the leads list if they're not already there
    setLeads(prevLeads => {
      const updatedLeads = [...prevLeads];
      
      newLeads.forEach(newLead => {
        const exists = prevLeads.some(lead => 
          lead.apolloId === newLead.apolloId || 
          (lead.email && lead.email === newLead.email)
        );
        
        if (!exists) {
          updatedLeads.unshift(newLead);
        }
      });
      
      return updatedLeads;
    });
    
    // Select the first lead from the search results
    if (newLeads.length > 0) {
      setCurrentLead(newLeads[0]);
      setFromCache(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Find New Leads</CardTitle>
              <CardDescription>
                Search for leads using LinkedIn URL or advanced criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url">LinkedIn URL</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced Search</TabsTrigger>
                </TabsList>
                
                <TabsContent value="url" className="space-y-4 mt-4">
                  <div className="mb-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Credit Cost</AlertTitle>
                      <AlertDescription>
                        Each new lead search costs 2 credits. Previously found leads are free to access.
                      </AlertDescription>
                    </Alert>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                      <Input
                        id="linkedinUrl"
                        type="url"
                        placeholder="https://www.linkedin.com/in/username"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Searching
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Find Lead
                        </>
                      )}
                    </Button>
                  </form>
                  
                  {error && (
                    <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
                      {error}
                      {creditInfo.insufficientCredits && (
                        <div className="mt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleBuyCredits}
                            className="flex items-center"
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Buy Credits
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {creditInfo.creditsUsed && !fromCache && (
                    <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md flex flex-col">
                      <span>Used {creditInfo.creditsUsed} credits for this search</span>
                      <span className="font-semibold">{creditInfo.remainingCredits} credits remaining</span>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="advanced" className="mt-4">
                  <LeadSearch onSearchComplete={handleSearchComplete} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Your Leads</CardTitle>
              <CardDescription>
                View and manage your saved leads
              </CardDescription>
              <div className="mt-2">
                <Input
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingLeads ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : filteredLeads.length > 0 ? (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {filteredLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
                        currentLead?.id === lead.id ? 'bg-gray-50 border-blue-300' : ''
                      }`}
                      onClick={() => selectLead(lead)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">
                            {lead.firstName} {lead.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {lead.title} {lead.company ? `at ${lead.company}` : ''}
                          </p>
                          {lead.seniority && (
                            <p className="text-xs text-gray-400 mt-1">
                              {lead.seniority} • {lead.location || 'Unknown location'}
                            </p>
                          )}
                          {lead.emailStatus && (
                            <p className="text-xs text-gray-400">
                              Email: <span className={`${lead.emailStatus === 'verified' ? 'text-green-500' : ''}`}>
                                {lead.emailStatus}
                              </span>
                            </p>
                          )}
                        </div>
                        {lead.email && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(lead.email || '');
                            }}
                            title="Copy email"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? 'No leads match your search' : 'No leads found. Search for a LinkedIn profile to get started.'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {currentLead && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>
                {currentLead.firstName} {currentLead.lastName}
              </CardTitle>
              {fromCache && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  From Database
                </span>
              )}
            </div>
            <CardDescription>
              {currentLead.title} {currentLead.company ? `at ${currentLead.company}` : ''}
              {currentLead.seniority && ` • ${currentLead.seniority}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentLead.email && (
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <span className="text-sm text-gray-500">Email</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{currentLead.email}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(currentLead.email || '')}
                      title="Copy email"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {currentLead.phoneNumber && (
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <span className="text-sm text-gray-500">Phone</span>
                  <div className="flex items-center space-x-2">
                    <span>{currentLead.phoneNumber}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(currentLead.phoneNumber || '')}
                      title="Copy phone"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {currentLead.location && (
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <span className="text-sm text-gray-500">Location</span>
                  <span>{currentLead.location}</span>
                </div>
              )}
              
              {currentLead.organizationDomain && (
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <span className="text-sm text-gray-500">Company Domain</span>
                  <span>{currentLead.organizationDomain}</span>
                </div>
              )}
              
              {currentLead.organizationSize && (
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <span className="text-sm text-gray-500">Company Size</span>
                  <span>{currentLead.organizationSize}</span>
                </div>
              )}
              
              {currentLead.organizationLocation && (
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <span className="text-sm text-gray-500">Company Location</span>
                  <span>{currentLead.organizationLocation}</span>
                </div>
              )}
              
              {currentLead.emailStatus && (
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <span className="text-sm text-gray-500">Email Status</span>
                  <span className={`${currentLead.emailStatus === 'verified' ? 'text-green-500 font-medium' : ''}`}>
                    {currentLead.emailStatus}
                  </span>
                </div>
              )}
              
              {currentLead.linkedinUrl && (
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <span className="text-sm text-gray-500">LinkedIn</span>
                  <div className="flex items-center space-x-2">
                    <a
                      href={currentLead.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      View Profile
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center p-3 border rounded-md">
                <span className="text-sm text-gray-500">Added On</span>
                <span>
                  {new Date(currentLead.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 