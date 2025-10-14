"use client";

import { JobHistory } from "./job-history";
import { ProfileLink } from "./profile-links";
import { useEffect, useState } from "react";

interface SearchResult {
  platform: string;
  url: string;
}

interface SherlockResultsProps {
  results: SearchResult[] | null;
  shouldReload?: boolean;
  setShouldReload?: (value: boolean) => void;
  parentIsAuthenticated?: boolean | null;
}

interface Job {
  id: string;
  username: string;
  status: string;
  results: SearchResult[];
  createdAt: string;
}

export const SherlockResults = ({ results, shouldReload, setShouldReload, parentIsAuthenticated }: SherlockResultsProps) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  // Listen for reload trigger from parent
  useEffect(() => {
    if (shouldReload && setShouldReload) {
      console.log('Reload triggered from parent, fetching jobs...');
      fetchJobs();
      setShouldReload(false);
    }
  }, [shouldReload, setShouldReload]);

  // Update authentication status when parent auth status changes
  useEffect(() => {
    if (parentIsAuthenticated !== null && parentIsAuthenticated !== undefined) {
      setIsAuthenticated(parentIsAuthenticated);
      if (parentIsAuthenticated && !isAuthenticated) {
        // User just authenticated, fetch jobs
        fetchJobs();
      }
    }
  }, [parentIsAuthenticated, isAuthenticated]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/user/auth');
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
      if (data.authenticated) {
        fetchJobs();
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to check auth:', error);
      setIsLoading(false);
    }
  };

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/sherlock/jobs');
      const data = await response.json();
      setJobs(data.jobs);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatResults = (results: SearchResult[] | null) => {
    if (!results) return [];
    return results.filter(result => result.url && result.platform);
  };

  return (
    <div className="space-y-8">
      {results && results.length > 0 && (
        <div className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Found Profiles</h3>
            <span className="text-sm text-muted-foreground">
              Found {formatResults(results).length} profiles
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formatResults(results).map(({ platform, url }) => (
              <ProfileLink key={platform} platform={platform} url={url} />
            ))}
          </div>
        </div>
      )}

      <JobHistory
        jobs={jobs}
        onRefresh={fetchJobs}
        isLoading={isLoading}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
};