"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@repo/ui/components/ui/card';
import { Button } from '@repo/ui/components/ui/button';
import { ArrowLeft, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { toast } from '@repo/ui/hooks/use-toast';
import { ProfileLink } from '../../../_components/sherlock/profile-links';
import Link from 'next/link';

interface SearchResult {
  platform: string;
  url: string;
}

interface Job {
  id: string;
  username: string;
  status: string;
  results: SearchResult[];
  createdAt: string;
  errorMessage?: string;
}

export default function CustomGptResultsPage() {
  const params = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = params?.id as string;

  const fetchJob = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/customgpt/sherlock/jobs/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch job details');
      }

      const data = await response.json();
      setJob(data.job);

      if (data.job?.status === 'PENDING' || data.job?.status === 'PROCESSING') {
        // Poll for updates if job is still in progress
        setTimeout(fetchJob, 10000);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to load results. Please try again later.');
      toast({ title: "Error", description: "Failed to fetch job details" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchJob();
    toast({ title: "Refreshing", description: "Checking for new results..." });
  };

  useEffect(() => {
    if (id) {
      fetchJob();
    }
  }, [id]);

  if (isLoading && !job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
        <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
        <h2 className="text-xl font-semibold mb-2">Loading results...</h2>
        <p className="text-muted-foreground">Please wait while we retrieve your search results</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
        <div className="text-red-500 mb-4">⚠️</div>
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={handleRefresh}>Try Again</Button>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
        <div className="text-amber-500 mb-4">⚠️</div>
        <h2 className="text-xl font-semibold mb-2">Job Not Found</h2>
        <p className="text-muted-foreground mb-4">We couldn't find the specified job.</p>
        <Link href="/tools/username-lookup">
          <Button>Go to Username Lookup</Button>
        </Link>
      </div>
    );
  }

  const isJobInProgress = job.status === 'PENDING' || job.status === 'PROCESSING';
  const hasResults = job.results && Array.isArray(job.results) && job.results.length > 0;

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/tools/username-lookup" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Username Lookup
        </Link>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{job.username}</h1>
            <p className="text-sm text-muted-foreground">
              {new Date(job.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`
              text-sm px-3 py-1 rounded-full font-medium
              ${job.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                job.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'}
            `}>
              {job.status.toLowerCase()}
            </span>
            {isJobInProgress && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        {isJobInProgress && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
            <h3 className="text-lg font-medium mb-2">Search in progress</h3>
            <p className="text-muted-foreground text-center max-w-md">
              We're searching for {job.username} across multiple platforms.
              This may take a minute or two. The page will automatically update.
            </p>
          </div>
        )}

        {job.status === 'FAILED' && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-red-500 mb-4">⚠️</div>
            <h3 className="text-lg font-medium mb-2">Search failed</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {job.errorMessage || "We couldn't complete your search. Please try again later."}
            </p>
            <Button className="mt-4" onClick={handleRefresh}>Try Again</Button>
          </div>
        )}

        {job.status === 'COMPLETED' && !hasResults && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-amber-500 mb-4">⚠️</div>
            <h3 className="text-lg font-medium mb-2">No profiles found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              We couldn't find any social media profiles for "{job.username}".
            </p>
          </div>
        )}

        {job.status === 'COMPLETED' && hasResults && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Found Profiles</h3>
              <span className="text-sm text-muted-foreground">
                {job.results.length} profiles found
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {job.results.map((result, index) => (
                <ProfileLink
                  key={`${result.platform}-${index}`}
                  platform={result.platform}
                  url={result.url}
                />
              ))}
            </div>

            <div className="pt-6 mt-6 border-t">
              <h3 className="text-lg font-medium mb-4">Want to save these results?</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button className="w-full sm:w-auto">Create an account</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="w-full sm:w-auto">Sign in</Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Create a free account to save results and search history.
              </p>
            </div>
          </div>
        )}
      </Card>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Powered by <a href="https://olly.social" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center">
            Olly.social <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </p>
      </div>
    </div>
  );
} 