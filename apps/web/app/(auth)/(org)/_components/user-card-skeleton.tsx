import React from "react";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

export const UserCardSkeleton: React.FC = () => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
        </div>
      </CardContent>
    </Card>
  );
};
