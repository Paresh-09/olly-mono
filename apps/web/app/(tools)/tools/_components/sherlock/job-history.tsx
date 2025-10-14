"use client";
import { format } from "date-fns";
import { Button } from "@repo/ui/components/ui/button";
import { RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { Card } from "@repo/ui/components/ui/card";
import { useState, useCallback, useEffect, useRef } from "react";

interface JobHistoryProps {
  jobs: any[];
  onRefresh: () => void;
  isLoading?: boolean;
  isAuthenticated: boolean;
}

export const JobHistory = ({
  jobs,
  onRefresh,
  isLoading,
  isAuthenticated
}: JobHistoryProps) => {
  const router = useRouter();
  const [visibleJobs, setVisibleJobs] = useState(5);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    if (visibleJobs < jobs.length) {
      setVisibleJobs(prev => Math.min(prev + 5, jobs.length));
    }
  }, [visibleJobs, jobs.length]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    event.stopPropagation();
    const container = event.currentTarget;
    const { scrollTop, clientHeight, scrollHeight } = container;

    const scrolledToBottom = scrollHeight - scrollTop <= clientHeight + 50;
    if (scrolledToBottom && visibleJobs < jobs.length) {
      loadMore();
    }
  }, [loadMore, visibleJobs, jobs.length]);

  useEffect(() => {
    setVisibleJobs(5);
  }, [jobs]);

  if (!isAuthenticated) {
    return (
      <Card className="p-12 text-center space-y-4 bg-white border border-neutral-200 rounded-2xl">
        <h3 className="text-2xl font-bold text-neutral-900">Job History</h3>
        <p className="text-base text-neutral-500">Please login to view your search history.</p>
        <Button
          onClick={() => router.push("/login")}
          className="rounded-xl px-6 py-3 text-base font-medium bg-neutral-900 hover:bg-neutral-800 text-white"
        >
          Login
        </Button>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-neutral-200 rounded-2xl">
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <h3 className="text-2xl font-bold text-neutral-900">Recent Searches</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="rounded-full hover:bg-neutral-100 -mr-2"
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''} text-neutral-600`} />
        </Button>
      </div>
      <div
        ref={scrollContainerRef}
        className="space-y-3 max-h-[600px] overflow-y-auto pr-4 scroll-smooth px-6 pb-6"
        onScroll={handleScroll}
        style={{ overflowAnchor: 'none' }}
      >
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-5 rounded-xl bg-neutral-50 flex flex-col gap-3 animate-pulse">
              <div className="h-4 w-1/3 bg-neutral-200 rounded" />
              <div className="h-3 w-1/4 bg-neutral-200 rounded" />
              <div className="flex gap-2 mt-2">
                <div className="h-6 w-24 bg-neutral-200 rounded-full" />
                <div className="h-6 w-16 bg-neutral-200 rounded-full" />
              </div>
            </div>
          ))
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
            <Clock className="h-10 w-10 mb-3 text-neutral-300" />
            <span className="text-lg font-medium">No search history found</span>
          </div>
        ) : (
          <>
            {jobs.slice(0, visibleJobs).map((job) => {
              let statusIcon, statusColor, statusText;
              if (Array.isArray(job.results) && job.results.length > 0) {
                statusIcon = <CheckCircle className="h-4 w-4" />;
                statusColor = 'bg-green-50 text-green-700 border border-green-200';
                statusText = 'completed';
              } else if (job.status === 'FAILED') {
                statusIcon = <XCircle className="h-4 w-4" />;
                statusColor = 'bg-red-50 text-red-700 border border-red-200';
                statusText = 'failed';
              } else {
                statusIcon = <Clock className="h-4 w-4" />;
                statusColor = 'bg-amber-50 text-amber-700 border border-amber-200';
                statusText = job.status.toLowerCase();
              }
              return (
                <div
                  key={job.id}
                  className="p-5 rounded-xl bg-neutral-50 flex items-center justify-between cursor-pointer hover:bg-neutral-100 transition-all border border-neutral-200 hover:border-neutral-300"
                  onClick={() => router.push(`/tools/sherlock/${job.id}`)}
                >
                  <div>
                    <p className="font-semibold text-base text-neutral-900">{job.username}</p>
                    <p className="text-sm text-neutral-500 mt-0.5">{format(new Date(job.createdAt), 'MMM d, yyyy HH:mm')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full font-medium ${statusColor}`}>
                      {statusIcon}
                      {statusText}
                    </span>
                    {job.results && (
                      <span className="text-sm text-neutral-500 font-medium">
                        {Array.isArray(job.results) ? job.results.length : Object.keys(job.results).length} profiles
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {visibleJobs < jobs.length && (
              <div className="pt-4">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={loadMore}
                  className="w-full rounded-xl border border-neutral-200 hover:bg-neutral-100 font-medium text-neutral-700"
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};