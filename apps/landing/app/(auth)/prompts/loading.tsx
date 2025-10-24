// app/prompts/loading.tsx
import { Skeleton } from "@repo/ui/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Skeleton className="w-48 h-8 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-40" />
        ))}
      </div>
    </div>
  );
};

export default Loading;