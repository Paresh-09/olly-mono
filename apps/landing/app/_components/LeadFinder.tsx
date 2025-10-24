'use client';
import { useState } from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Label } from '@repo/ui/components/ui/label';
import { Loader2, Search, Copy, ExternalLink, CreditCard, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/ui/alert';

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

export default function LeadFinder() {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lead, setLead] = useState<Lead | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creditInfo, setCreditInfo] = useState<{
    creditsUsed?: number;
    remainingCredits?: number;
    insufficientCredits?: boolean;
    creditCost?: number;
    currentBalance?: number;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!linkedinUrl) {
      toast.error('Please enter a LinkedIn URL');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setLead(null);
    setCreditInfo({});
    
    try {
      const response = await fetch('/api/lead/linkedin', {
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
      
      // Check if we have people in the response
      if (data.people && data.people.length > 0) {
        // Convert Apollo API response to our Lead format
        const person = data.people[0];
        const leadData: Lead = {
          id: person.id || '',
          linkedinUrl: linkedinUrl,
          firstName: person.first_name || '',
          lastName: person.last_name || '',
          email: person.email || null,
          title: person.title || null,
          company: person.organization_name || null,
          phoneNumber: person.phone_numbers?.[0] || null,
          apolloId: person.id || null,
          createdAt: new Date().toISOString()
        };
        
        setLead(leadData);
        setFromCache(false);
        toast.success('Lead found!');
      } else {
        throw new Error('No person found for this LinkedIn URL');
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

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Apollo Lead Finder</CardTitle>
          <CardDescription>
            Find email addresses for LinkedIn profiles using the Apollo API
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
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <div className="flex space-x-2">
                <Input
                  id="linkedinUrl"
                  type="url"
                  placeholder="https://www.linkedin.com/in/username"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  required
                />
                <Button type="submit" disabled={isLoading}>
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
              </div>
            </div>
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
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center justify-between">
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
                {fromCache && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    From Cache
                  </span>
                )}
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
        <CardFooter className="flex justify-between">
          <p className="text-xs text-gray-500">
            This tool uses the Apollo API to find email addresses. API calls are cached to avoid duplicate requests.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 