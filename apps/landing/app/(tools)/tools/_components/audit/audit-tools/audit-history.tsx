"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Button } from "@repo/ui/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

interface AuditHistoryProps {
  audits: any[];
  onRefresh: () => void;
  isLoading?: boolean;
  platform: string;
  isAudit: boolean;
}

export const AuditHistory = ({
  audits,
  onRefresh,
  isLoading,
  platform,
  isAudit
}: AuditHistoryProps) => {
  const router = useRouter();
  const [visibleAudits, setVisibleAudits] = useState(5);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    if (visibleAudits < audits.length) {
      setVisibleAudits(prev => Math.min(prev + 5, audits.length));
    }
  }, [visibleAudits, audits.length]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    event.stopPropagation();
    const container = event.currentTarget;
    const { scrollTop, clientHeight, scrollHeight } = container;

    const scrolledToBottom = scrollHeight - scrollTop <= clientHeight + 50;
    if (scrolledToBottom && visibleAudits < audits.length) {
      loadMore();
    }
  }, [loadMore, visibleAudits, audits.length]);

  useEffect(() => {
    // Reset visible audits when audits array changes
    setVisibleAudits(5);
  }, [audits]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Audits</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div
        ref={scrollContainerRef}
        className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scroll-smooth"
        onScroll={handleScroll}
        style={{ overflowAnchor: 'none' }}
      >
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 rounded-lg border">
              <div className="space-y-3">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[160px]" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-[100px]" />
                  <Skeleton className="h-6 w-[80px]" />
                </div>
              </div>
            </div>
          ))
        ) : audits.length === 0 ? (
          <div className="text-center p-6 text-muted-foreground">
            No audit history found
          </div>
        ) : (
          <>
            {audits.slice(0, visibleAudits).map((audit) => (
              <div
                key={audit.id}
                className="p-4 rounded-lg border flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => isAudit
                  ? router.push(`/tools/${platform}-audit/report/${audit.id}`)
                  : router.push(`/tools/fake-follower-check/${platform}/report/${audit.id}`)
                }
              >
                <div>
                  <p className="font-medium">{audit.profileName || audit.profileUsername || 'Unnamed Profile'}</p>
                  <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                    {audit.profileUrl}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(audit.createdAt), 'MMM d, yyyy HH:mm')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`
                    text-sm px-2 py-1 rounded-full
                    ${audit.auditStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      audit.auditStatus === 'ERROR' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'}
                  `}>
                    {audit.auditStatus.toLowerCase()}
                  </span>
                </div>
              </div>
            ))}
            {visibleAudits < audits.length && (
              <div className="py-2 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadMore}
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};