import { Skeleton } from "@repo/ui/components/ui/skeleton";

export default function LeadsLoading() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      <div className="space-y-4">
        <div className="flex space-x-2 mb-6">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        
        <div className="border rounded-md p-6 space-y-4">
          <Skeleton className="h-10 w-full max-w-md" />
          
          <div className="mt-6 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
} 