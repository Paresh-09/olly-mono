'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@repo/ui/components/ui/table';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@repo/ui/components/ui/pagination';
import { Loader2, Search, Copy, ExternalLink, RefreshCw, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Lead {
  id: string;
  linkedinUrl: string;
  firstName: string;
  lastName: string;
  email: string | null;
  title: string | null;
  company: string | null;
  phoneNumber: string | null;
  apolloId: string | null;
  createdAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function LeadsDashboard() {
  const [activeTab, setActiveTab] = useState('find');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [lead, setLead] = useState<Lead | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [creditInfo, setCreditInfo] = useState<{
    creditsUsed?: number;
    remainingCredits?: number;
    insufficientCredits?: boolean;
    creditCost?: number;
    currentBalance?: number;
  }>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');

  // Fetch leads on component mount and when pagination or search changes
  useEffect(() => {
    fetchLeads();
  }, [pagination.page, searchQuery]);

  const fetchLeads = async () => {
    setIsLoadingLeads(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });
      
      if (searchQuery) {
        queryParams.append('search', searchQuery);
      }
      
      const response = await fetch(`/api/lead?${queryParams.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch leads');
      }
      
      setLeads(data.leads);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching leads:', err);
      toast.error('Failed to fetch leads');
    } finally {
      setIsLoadingLeads(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset to first page when searching
    setPagination(prev => ({ ...prev, page: 1 }));
    // fetchLeads will be called by the useEffect when pagination.page changes
  };

  const handleFindLead = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!linkedinUrl && !showAdvanced) {
      toast.error('Please enter a LinkedIn URL');
      return;
    }
    
    if (showAdvanced && !keywords && !jobTitle && !company && !location) {
      toast.error('Please enter at least one search criteria');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setLead(null);
    setCreditInfo({});
    
    try {
      // Prepare search data
      const searchData: any = {};
      
      if (!showAdvanced) {
        // Simple LinkedIn URL search
        searchData.linkedinUrl = linkedinUrl;
      } else {
        // Advanced search
        if (keywords) searchData.q_keywords = keywords;
        if (jobTitle) searchData.person_titles = [jobTitle];
        if (company) searchData.q_organization_domains_list = [company];
        if (location) searchData.person_locations = [location];
      }
      
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchData),
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
      
      if (data.lead) {
        // Single lead result
        setLead(data.lead);
        
        if (data.fromCache) {
          toast.success('Lead found in database!');
        } else {
          setCreditInfo({
            creditsUsed: data.creditsUsed,
            remainingCredits: data.remainingCredits
          });
          toast.success(`Lead found and saved! Used ${data.creditsUsed} credits.`);
        }
      } else if (data.leads) {
        // Multiple leads result
        setLeads(data.leads);
        setActiveTab('manage');
        
        if (data.fromCache) {
          toast.success('Leads found in database!');
        } else {
          setCreditInfo({
            creditsUsed: data.creditsUsed,
            remainingCredits: data.remainingCredits
          });
          toast.success(`Found ${data.leads.length} leads! Used ${data.creditsUsed} credits.`);
        }
        
        // Update pagination if provided
        if (data.pagination) {
          setPagination(data.pagination);
        }
      }
      
      // Refresh the leads list if we're on the manage tab
      if (activeTab === 'manage') {
        fetchLeads();
      }
    } catch (err) {
      console.error('Error finding lead:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error('Failed to find lead');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyCredits = () => {
    window.location.href = '/plans';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  return (
    <Tabs defaultValue="find" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
        <TabsTrigger value="find">Find New Lead</TabsTrigger>
        <TabsTrigger value="manage">Manage Leads</TabsTrigger>
      </TabsList>
      
      <TabsContent value="find" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Find Lead</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFindLead} className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Search Type</span>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? 'Simple Search' : 'Advanced Search'}
                </Button>
              </div>
              
              {!showAdvanced ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="linkedinUrl" className="text-sm font-medium">
                      LinkedIn URL
                    </label>
                    <Input
                      id="linkedinUrl"
                      placeholder="https://www.linkedin.com/in/username"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="keywords" className="text-sm font-medium">
                      Keywords
                    </label>
                    <Input
                      id="keywords"
                      placeholder="Enter keywords (e.g., marketing, sales)"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="jobTitle" className="text-sm font-medium">
                      Job Title
                    </label>
                    <Input
                      id="jobTitle"
                      placeholder="Enter job title (e.g., Marketing Manager)"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="company" className="text-sm font-medium">
                      Company Domain
                    </label>
                    <Input
                      id="company"
                      placeholder="Enter company domain (e.g., example.com)"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium">
                      Location
                    </label>
                    <Input
                      id="location"
                      placeholder="Enter location (e.g., New York, Remote)"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Find
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
            
            {creditInfo.creditsUsed && (
              <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md flex flex-col">
                <span>Used {creditInfo.creditsUsed} credits for this search</span>
                <span className="font-semibold">{creditInfo.remainingCredits} credits remaining</span>
              </div>
            )}
            
            {lead && (
              <div className="mt-6 border rounded-md p-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">
                    {lead.firstName} {lead.lastName}
                  </h3>
                </div>
                
                <div className="space-y-2">
                  {lead.title && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Title</span>
                      <span>{lead.title}</span>
                    </div>
                  )}
                  
                  {lead.company && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Company</span>
                      <span>{lead.company}</span>
                    </div>
                  )}
                  
                  {lead.email && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Email</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{lead.email}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(lead.email || '')}
                          title="Copy email"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {lead.phoneNumber && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Phone</span>
                      <div className="flex items-center space-x-2">
                        <span>{lead.phoneNumber}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(lead.phoneNumber || '')}
                          title="Copy phone"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">LinkedIn</span>
                    <div className="flex items-center space-x-2">
                      <a
                        href={lead.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        View Profile
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="manage" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Leads</CardTitle>
            <div className="flex items-center space-x-2">
              <form onSubmit={handleSearch} className="flex space-x-2">
                <Input
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
                <Button type="submit" variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={fetchLeads} 
                disabled={isLoadingLeads}
              >
                {isLoadingLeads ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingLeads ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : leads.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No leads found. Try searching for a LinkedIn profile.
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Added</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">
                            {lead.firstName} {lead.lastName}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {lead.email || 'N/A'}
                              {lead.email && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => copyToClipboard(lead.email || '')}
                                  title="Copy email"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{lead.company || 'N/A'}</TableCell>
                          <TableCell>{lead.title || 'N/A'}</TableCell>
                          <TableCell>{formatDate(lead.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <a
                              href={lead.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline inline-flex items-center"
                            >
                              LinkedIn
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {pagination.totalPages > 1 && (
                  <Pagination className="mt-4">
                    <PaginationContent>
                      {pagination.page > 1 && (
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(pagination.page - 1);
                            }} 
                          />
                        </PaginationItem>
                      )}
                      
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        // Show pages around the current page
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }
                        
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink 
                              href="#" 
                              isActive={pageNum === pagination.page}
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(pageNum);
                              }}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      {pagination.page < pagination.totalPages && (
                        <PaginationItem>
                          <PaginationNext 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(pagination.page + 1);
                            }} 
                          />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
} 