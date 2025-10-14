"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Input } from '@repo/ui/components/ui/input';
import { Button } from '@repo/ui/components/ui/button';
import { Loader2, Search, Coins, ArrowRight } from 'lucide-react';
import { toast } from '@repo/ui/hooks/use-toast';
import { SherlockResults } from './sherlock-results';
import AuthPopup from '../authentication';
import ErrorBoundary from './error-boundary';

interface SearchResult {
  platform: string;
  url: string;
}

interface AuthResponse {
  authenticated: boolean;
  user: {
    id: string;
    email: string;
    username: string;
    credits?: number;
  } | null;
}

export default function SherlockLookup({ title, description }: { title: string, description: string }) {
  const searchParams = useSearchParams();
  const prefilledUsername = searchParams.get('username') || '';

  const [username, setUsername] = useState(prefilledUsername);
  const [isLoading, setIsLoading] = useState(false);
  const [, setTaskId] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [shouldReloadJobs, setShouldReloadJobs] = useState(false);
  const [shouldAutoSearch, setShouldAutoSearch] = useState(false);
  const [userCredits, setUserCredits] = useState<number | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Global error handler for unexpected errors
  useEffect(() => {
    const handleUnhandledError = (event: ErrorEvent) => {
      console.error('Unhandled error:', event.error);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred. Please try refreshing the page.",
        variant: "destructive"
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    };

    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    if (prefilledUsername) {
      setUsername(prefilledUsername);
      setShouldAutoSearch(true);
    }
  }, [prefilledUsername]);

  useEffect(() => {
    if (shouldAutoSearch && username && isAuthenticated !== null) {
      setShouldAutoSearch(false);
      setTimeout(() => {
        initiateSearch();
      }, 500);
    }
  }, [shouldAutoSearch, username, isAuthenticated]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/user/auth');
      if (!response.ok) {
        throw new Error(`Auth check failed: ${response.status}`);
      }
      const data: AuthResponse = await response.json();
      setIsAuthenticated(data.authenticated);

      if (data.authenticated) {
        console.log("User is authenticated, fetching credits...");
        refreshCredits();
        console.log("Credits fetched:", userCredits);
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
      setIsAuthenticated(false);
    }
  };

  const refreshCredits = async () => {
    try {
      const response = await fetch('/api/user/credits');
      console.log("Credits response:", response);
      
      if (response.status === 401) {
        console.log("User not authenticated, setting auth status to false");
        setIsAuthenticated(false);
        setUserCredits(null);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Credits API failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Credits data:", data);
      if (data.success) {
        setUserCredits(data.balance);
        console.log("Updated credits to:", data.balance);
      } else {
        console.error('Credits fetch failed:', data);
        setUserCredits(null);
      }
    } catch (error) {
      console.error('Failed to refresh credits:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast({
          title: "Connection Error",
          description: "Unable to connect to server. Please check your internet connection.",
          variant: "destructive"
        });
      }
      setUserCredits(null);
    }
  };

  const processResults = (accountsFound: string[]) => {
    try {
      if (!Array.isArray(accountsFound)) {
        console.warn('processResults: accountsFound is not an array:', accountsFound);
        return [];
      }
      
      return accountsFound
        .filter(url => typeof url === 'string' && !url.includes("Total Websites"))
        .map(url => {
          try {
            const platform = url.split('/')[2]?.replace('www.', '');
            return { platform, url };
          } catch (error) {
            console.error('Error processing URL:', url, error);
            return null;
          }
        })
        .filter((result): result is { platform: string; url: string } => 
          result !== null && Boolean(result.platform) && Boolean(result.url)
        );
    } catch (error) {
      console.error('Error in processResults:', error);
      toast({
        title: "Error Processing Results",
        description: "There was an error processing the search results.",
        variant: "destructive"
      });
      return [];
    }
  };

  const resetSearchState = () => {
    try {
      setIsLoading(false);
      setTaskId(null);
      setUsername('');
      setResults(null);
    } catch (error) {
      console.error('Error in resetSearchState:', error);
      toast({
        title: "Error Resetting State",
        description: "There was an error resetting the search state.",
        variant: "destructive"
      });
    }
  };

  const initiateSearch = async () => {
    if (!username) {
      toast({ title: "Error", description: "Please enter a username", variant: "destructive" });
      return;
    }

    // Check if user is authenticated before proceeding
    if (isAuthenticated === false) {
      setShowAuthPopup(true);
      return;
    }

    setResults(null);
    setIsLoading(true);
    setTaskId(null);

    try {
      const response = await fetch('/api/sherlock/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (response.status === 429 && !isAuthenticated) {
        setShowAuthPopup(true);
        setIsLoading(false);
        return;
      }

      if (response.status === 401) {
        setIsAuthenticated(false);
        setShowAuthPopup(true);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 402) {
          toast({ 
            title: "Insufficient Credits", 
            description: "You don't have enough credits for this search. Please purchase more credits.",
            variant: "destructive" 
          });
        } else {
          throw new Error(data.error_message || data.error || 'Failed to initiate search');
        }
        resetSearchState();
        return;
      }

      setUsername('');
      setIsLoading(false);

      setShouldReloadJobs(true);

      setTimeout(() => {
        refreshCredits();
      }, 500);

      setTaskId(data.task_id);
      await pollStatus(data.task_id);
    } catch (error: any) {
      console.error('Search initiation error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast({ 
          title: "Connection Error", 
          description: "Unable to connect to server. Please check your internet connection.", 
          variant: "destructive" 
        });
      } else {
        toast({ title: "Error", description: error.message || "An unexpected error occurred", variant: "destructive" });
      }
      resetSearchState();
    }
  };

  const pollStatus = async (tid: string) => {
    const maxAttempts = 24;
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/sherlock/status/${tid}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Search task not found. It may have expired.');
          }
          if (response.status >= 500) {
            throw new Error('Server error occurred while checking status. Please try again.');
          }
          throw new Error(`Status check failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.status.toLowerCase() === 'completed') {
          const resultsArray = data.result ? processResults(data.result) : [];
          setResults(resultsArray);
          toast({
            title: "Search Complete",
            description: `Username lookup completed`,
            variant: "default"
          });
          refreshCredits();
          resetSearchState();
          return true;
        }

        if (['failed', 'error'].includes(data.status.toLowerCase())) {
          throw new Error(data.error_message || data.error || 'Search failed');
        }

        return false;
      } catch (error: any) {
        console.error('Status polling error:', error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
          toast({ 
            title: "Connection Error", 
            description: "Unable to check search status. Please check your internet connection.", 
            variant: "destructive" 
          });
        } else {
          toast({ title: "Error", description: error.message || "Failed to check search status", variant: "destructive" });
        }
        resetSearchState();
        return true;
      }
    };

    while (attempts < maxAttempts) {
      const done = await poll();
      if (done) break;
      attempts++;
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 15000));
      }
    }

    if (attempts >= maxAttempts) {
      toast({ title: "Error", description: "Search timed out", variant: "destructive" });
      resetSearchState();
    }
  };

  const handleSearchClick = () => {
    if (isAuthenticated === false) {
      setShowAuthPopup(true);
      return;
    }
    initiateSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSearchClick();
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-900 text-white text-sm rounded-full mb-6">
            <Search className="w-3.5 h-3.5" />
            <span className="font-medium">Username Intelligence</span>
          </div>
          <h1 className="text-5xl font-bold text-neutral-900 mb-4 tracking-tight">{title}</h1>
          <p className="text-xl text-neutral-600 max-w-2xl">{description}</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Left Panel - Search Controls */}
          <div className="lg:col-span-2 space-y-8">

            {/* Search Card */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  Username to search
                </label>
                <Input
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="h-12 text-base border-neutral-300 focus:border-neutral-900 focus:ring-neutral-900"
                />
              </div>

              <Button
                onClick={handleSearchClick}
                disabled={isLoading || !username}
                className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 text-white text-base font-medium rounded-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Searching...
                  </>
                ) : isAuthenticated === false ? (
                  <>
                    Sign in to Search
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                ) : (
                  <>
                    Search Platforms
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>

              {isLoading && (
                <p className="text-sm text-neutral-500 text-center leading-relaxed">
                  This may take a few minutes. You'll receive an email with results, or check back here.
                </p>
              )}
            </div>
            {/* Credits Card */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center">
                    <Coins className="w-4 h-4 text-neutral-700" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500">Credits</div>
                    {isAuthenticated && userCredits !== null ? (
                      <div className="text-xl font-bold text-neutral-900">{userCredits}</div>
                    ) : isAuthenticated ? (
                      <div className="text-lg text-neutral-400">Loading...</div>
                    ) : (
                      <div className="text-sm text-neutral-400">
                        <a href="/login" className="text-neutral-900 underline underline-offset-4 hover:text-neutral-600">
                          Sign in
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-neutral-500">3 per search</div>
                  <a href="/credits" className="text-xs text-neutral-900 underline underline-offset-4 hover:text-neutral-600">
                    Get more
                  </a>
                </div>
              </div>
            </div>



          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-3">
            <SherlockResults
              results={results}
              shouldReload={shouldReloadJobs}
              setShouldReload={setShouldReloadJobs}
              parentIsAuthenticated={isAuthenticated}
            />
          </div>
        </div>
      </div>

      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        onSuccess={() => {
          setShowAuthPopup(false);
          setIsAuthenticated(true);
          refreshCredits();
          setShouldReloadJobs(true); // Trigger reload of job history
          initiateSearch();
        }}
      />
      </div>
    </ErrorBoundary>
  );
}