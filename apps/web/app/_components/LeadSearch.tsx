'use client';

import { useState } from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Label } from '@repo/ui/components/ui/label';
import { Loader2, Search, CreditCard, AlertCircle, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/ui/alert';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@repo/ui/components/ui/select';
import { Badge } from '@repo/ui/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs';

interface SearchParams {
  person_titles?: string[];
  person_locations?: string[];
  person_seniorities?: string[];
  organization_locations?: string[];
  q_organization_domains_list?: string[];
  contact_email_status?: string[];
  organization_num_employees_ranges?: string[];
  q_keywords?: string;
}

export default function LeadSearch({ onSearchComplete }: { onSearchComplete: (leads: any[]) => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [creditInfo, setCreditInfo] = useState<{
    creditsUsed?: number;
    remainingCredits?: number;
    insufficientCredits?: boolean;
    creditCost?: number;
    currentBalance?: number;
  }>({});

  // Basic search fields
  const [keywords, setKeywords] = useState('');
  
  // Advanced search fields
  const [searchParams, setSearchParams] = useState<SearchParams>({
    person_titles: [],
    person_locations: [],
    person_seniorities: [],
    organization_locations: [],
    q_organization_domains_list: [],
    contact_email_status: ['verified'],
    organization_num_employees_ranges: [],
  });
  
  // Input fields for adding new items to arrays
  const [newTitle, setNewTitle] = useState('');
  const [newPersonLocation, setNewPersonLocation] = useState('');
  const [newOrgLocation, setNewOrgLocation] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newEmployeeRange, setNewEmployeeRange] = useState('');

  const handleAddItem = (field: keyof SearchParams, value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (!value.trim()) return;
    
    setSearchParams(prev => {
      const currentArray = prev[field] as string[] || [];
      return {
        ...prev,
        [field]: [...currentArray, value.trim()]
      };
    });
    
    setter('');
  };

  const handleRemoveItem = (field: keyof SearchParams, index: number) => {
    setSearchParams(prev => {
      const currentArray = [...(prev[field] as string[] || [])];
      currentArray.splice(index, 1);
      return {
        ...prev,
        [field]: currentArray
      };
    });
  };

  const handleSeniorityChange = (value: string) => {
    const currentSeniorities = [...(searchParams.person_seniorities || [])];
    
    // Toggle the seniority - if it exists, remove it, otherwise add it
    const index = currentSeniorities.indexOf(value);
    if (index >= 0) {
      currentSeniorities.splice(index, 1);
    } else {
      currentSeniorities.push(value);
    }
    
    setSearchParams(prev => ({
      ...prev,
      person_seniorities: currentSeniorities
    }));
  };

  const handleEmailStatusChange = (value: string) => {
    const currentStatuses = [...(searchParams.contact_email_status || [])];
    
    // Toggle the status - if it exists, remove it, otherwise add it
    const index = currentStatuses.indexOf(value);
    if (index >= 0) {
      currentStatuses.splice(index, 1);
    } else {
      currentStatuses.push(value);
    }
    
    setSearchParams(prev => ({
      ...prev,
      contact_email_status: currentStatuses
    }));
  };

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    setCreditInfo({});
    
    // Prepare search parameters
    const searchData: SearchParams = { ...searchParams };
    
    // Add keywords if provided
    if (keywords.trim()) {
      searchData.q_keywords = keywords.trim();
    }
    
    // Remove empty arrays
    Object.keys(searchData).forEach(key => {
      const typedKey = key as keyof SearchParams;
      if (Array.isArray(searchData[typedKey]) && searchData[typedKey]?.length === 0) {
        delete searchData[typedKey];
      }
    });
    
    // Validate that at least one search parameter is provided
    if (Object.keys(searchData).length === 0) {
      setError('Please provide at least one search parameter');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/lead/search', {
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
        throw new Error(data.error || data.details || 'Failed to search for leads');
      }
      
      // Handle successful search
      if (data.leads && data.leads.length > 0) {
        toast.success(`Found ${data.leads.length} leads!`);
        onSearchComplete(data.leads);
        
        if (data.creditsUsed) {
          setCreditInfo({
            creditsUsed: data.creditsUsed,
            remainingCredits: data.remainingCredits
          });
        }
      } else {
        toast.info('No leads found matching your criteria');
      }
    } catch (err) {
      console.error('Error searching for leads:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error('Failed to search for leads');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyCredits = () => {
    window.location.href = '/plans';
  };

  const seniorityOptions = [
    { value: 'owner', label: 'Owner' },
    { value: 'founder', label: 'Founder' },
    { value: 'c_suite', label: 'C-Suite' },
    { value: 'partner', label: 'Partner' },
    { value: 'vp', label: 'VP' },
    { value: 'head', label: 'Head' },
    { value: 'director', label: 'Director' },
    { value: 'manager', label: 'Manager' },
    { value: 'senior', label: 'Senior' },
    { value: 'entry', label: 'Entry' },
    { value: 'intern', label: 'Intern' }
  ];

  const emailStatusOptions = [
    { value: 'verified', label: 'Verified' },
    { value: 'unverified', label: 'Unverified' },
    { value: 'likely to engage', label: 'Likely to Engage' },
    { value: 'unavailable', label: 'Unavailable' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Find Leads</CardTitle>
        <CardDescription>
          Search for leads using various criteria
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Credit Cost</AlertTitle>
            <AlertDescription>
              Each new lead search costs 2 credits. Previously found leads are free to access.
            </AlertDescription>
          </Alert>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Search</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Search</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords</Label>
              <Input
                id="keywords"
                placeholder="Enter keywords (e.g., marketing, sales, tech)"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                Search for leads using keywords that match their profile
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-6 mt-4">
            {/* Job Titles */}
            <div className="space-y-2">
              <Label>Job Titles</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add job title (e.g., Marketing Manager)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddItem('person_titles', newTitle, setNewTitle);
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleAddItem('person_titles', newTitle, setNewTitle)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {searchParams.person_titles?.map((title, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {title}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleRemoveItem('person_titles', index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Seniority Levels */}
            <div className="space-y-2">
              <Label>Seniority Levels</Label>
              <div className="flex flex-wrap gap-2">
                {seniorityOptions.map((option) => (
                  <Badge 
                    key={option.value} 
                    variant={searchParams.person_seniorities?.includes(option.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleSeniorityChange(option.value)}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Person Locations */}
            <div className="space-y-2">
              <Label>Person Locations</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add location (e.g., New York, California)"
                  value={newPersonLocation}
                  onChange={(e) => setNewPersonLocation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddItem('person_locations', newPersonLocation, setNewPersonLocation);
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleAddItem('person_locations', newPersonLocation, setNewPersonLocation)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {searchParams.person_locations?.map((location, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {location}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleRemoveItem('person_locations', index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Organization Locations */}
            <div className="space-y-2">
              <Label>Company Locations</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add company location (e.g., San Francisco)"
                  value={newOrgLocation}
                  onChange={(e) => setNewOrgLocation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddItem('organization_locations', newOrgLocation, setNewOrgLocation);
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleAddItem('organization_locations', newOrgLocation, setNewOrgLocation)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {searchParams.organization_locations?.map((location, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {location}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleRemoveItem('organization_locations', index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Company Domains */}
            <div className="space-y-2">
              <Label>Company Domains</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add domain (e.g., apollo.io, microsoft.com)"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddItem('q_organization_domains_list', newDomain, setNewDomain);
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleAddItem('q_organization_domains_list', newDomain, setNewDomain)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {searchParams.q_organization_domains_list?.map((domain, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {domain}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleRemoveItem('q_organization_domains_list', index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Company Size */}
            <div className="space-y-2">
              <Label>Company Size (Employee Range)</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add range (e.g., 1,10 or 100,500)"
                  value={newEmployeeRange}
                  onChange={(e) => setNewEmployeeRange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddItem('organization_num_employees_ranges', newEmployeeRange, setNewEmployeeRange);
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleAddItem('organization_num_employees_ranges', newEmployeeRange, setNewEmployeeRange)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">Format: min,max (e.g., 1,10 or 100,500)</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {searchParams.organization_num_employees_ranges?.map((range, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {range}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleRemoveItem('organization_num_employees_ranges', index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Email Status */}
            <div className="space-y-2">
              <Label>Email Status</Label>
              <div className="flex flex-wrap gap-2">
                {emailStatusOptions.map((option) => (
                  <Badge 
                    key={option.value} 
                    variant={searchParams.contact_email_status?.includes(option.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleEmailStatusChange(option.value)}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6">
          <Button 
            onClick={handleSearch} 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search for Leads
              </>
            )}
          </Button>
        </div>
        
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
      </CardContent>
    </Card>
  );
} 