"use client";

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Card } from '@repo/ui/components/ui/card';
import { Button } from '@repo/ui/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from '@repo/ui/hooks/use-toast';
import { ProfileLink } from '../../_components/sherlock/profile-links';

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
}

export default function JobDetails() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const id = params?.id || searchParams.get('id');

  const fetchJob = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/sherlock/jobs/${id}`);
      const data = await response.json();
      setJob(data.job);

      if (data.job?.status === 'PENDING' || data.job?.status === 'PROCESSING') {
        setTimeout(fetchJob, 10000);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast({ title: "Error", description: "Failed to fetch job details" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefetch = async () => {
    try {
      const response = await fetch(`/tools/sherlock/${id}`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to refetch');
      fetchJob();
      toast({ title: "Success", description: "Job refetch initiated" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to refetch job" });
    }
  };

  useEffect(() => {
    if (id) fetchJob();
  }, [id]);

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{job.username}</h2>
          <p className="text-sm text-muted-foreground">
            {new Date(job.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`
           text-sm px-2 py-1 rounded-full
           ${job.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
              job.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'}
         `}>
            {job.status.toLowerCase()}
          </span>
          {(job.status === 'PENDING' || job.status === 'PROCESSING') && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefetch}
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

      {job.results?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {job.results.map((result) => (
            <ProfileLink
              key={result.platform}
              platform={result.platform}
              url={result.url}
            />
          ))}
        </div>
      )}
    </Card>
  );
}