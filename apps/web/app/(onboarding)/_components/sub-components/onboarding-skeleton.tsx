import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

export default function OnboardingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>

        {/* Progress Bar Skeleton */}
        <div className="mb-12">
          <Skeleton className="h-2 w-full" />
        </div>

        {/* Main Content Skeleton */}
        <div className="min-h-[600px] flex flex-col items-center">
          <div className="w-full max-w-4xl">
            <Card>
              <CardContent className="p-6">
                {/* Header Area */}
                <div className="space-y-4 mb-8">
                  <div className="flex justify-center">
                    <Skeleton className="h-16 w-16 rounded-full" />
                  </div>
                  <div className="text-center space-y-2">
                    <Skeleton className="h-8 w-64 mx-auto" />
                    <Skeleton className="h-4 w-96 mx-auto" />
                  </div>
                </div>

                {/* Content Area */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                  </div>

                  {/* Bottom Area */}
                  <div className="pt-6 flex justify-end space-x-4">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}