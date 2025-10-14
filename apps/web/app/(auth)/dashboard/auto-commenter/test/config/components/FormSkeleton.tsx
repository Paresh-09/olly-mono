import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@repo/ui/components/ui/card";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

export default function FormSkeleton() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header and title */}
        <div className="mb-8">
          <Skeleton className="h-9 w-2/5 mb-3" />
          <Skeleton className="h-5 w-3/5 mb-4" />
          <div className="mt-4 flex items-center gap-2">
            {[1, 2].map((index) => (
              <React.Fragment key={index}>
                <Skeleton className="h-8 w-32 rounded-md" />
                {index < 2 && <Skeleton className="h-4 w-4" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main card */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            {/* Tabs content container */}
            <div className="space-y-8">
              {/* General tab section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-100 rounded-lg p-4 bg-white shadow-sm">
                  <Skeleton className="h-6 w-40 mb-4" />
                  <div className="space-y-4">
                    <div>
                      <Skeleton className="h-5 w-24 mb-2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div>
                      <Skeleton className="h-5 w-36 mb-2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-100 rounded-lg p-4 bg-white shadow-sm">
                  <Skeleton className="h-6 w-40 mb-4" />
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-6 w-12 rounded-full" />
                    </div>
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-6 w-12 rounded-full" />
                    </div>
                    <Skeleton className="h-24 w-full" />
                  </div>
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between gap-4 mt-6">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
              
              {/* Bottom save button */}
              <Skeleton className="h-12 w-full mt-4" />
            </div>
          </CardContent>
          
          <CardFooter className="border-t border-gray-100 py-3 flex justify-between">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-48" />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}