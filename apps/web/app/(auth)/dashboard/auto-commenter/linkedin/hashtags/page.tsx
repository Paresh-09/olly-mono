"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui/components/ui/card";
import { Search } from "lucide-react";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { toast } from "@repo/ui/hooks/use-toast";
import { useSession } from "@/providers/SessionProvider";

interface HashtagResult {
  id: string;
  name: string;
  postCount?: number;
}

export default function LookByHashtagPage() {
  const [hashtag, setHashtag] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [results, setResults] = useState<HashtagResult[]>([]);
  const router = useRouter();
  const { session, user } = useSession();


  useEffect(() => {
    if (!session || !user || !user.isBetaTester) {
      router.push("/dashboard");
    }
  }, [session, user, router]);

  const searchHashtags = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/ac/linkedin/hashtags/search?q=${encodeURIComponent(query.replace("#", ""))}`,
      );

      if (!response.ok) {
        throw new Error("Failed to search hashtags");
      }

      const data = await response.json();
      setResults(data.elements || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search hashtags",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (hashtag.trim()) {
      searchHashtags(hashtag);
    }
  };

  const handleHashtagClick = (tag: string) => {
    router.push(
      `/dashboard/auto-commenter/linkedin/hashtags/${encodeURIComponent(tag.replace("#", ""))}`,
    );
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Search LinkedIn Hashtags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSearch} className="flex space-x-2">
            <Input
              value={hashtag}
              onChange={(e) => {
                setHashtag(e.target.value);
                // Optionally debounce this for better performance
                searchHashtags(e.target.value);
              }}
              placeholder="Enter a hashtag (e.g., programming)"
              className="flex-1"
            />
            <Button type="submit" disabled={isSearching || !hashtag.trim()}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>

          <div className="space-y-4">
            {isSearching ? (
              // Loading state
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))
            ) : results.length > 0 ? (
              // Results
              results.map((result) => (
                <Button
                  key={result.id}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={() => handleHashtagClick(result.name)}
                >
                  <div>
                    <p className="font-medium">#{result.name}</p>
                    {result.postCount && (
                      <p className="text-sm text-muted-foreground">
                        {result.postCount.toLocaleString()} posts
                      </p>
                    )}
                  </div>
                </Button>
              ))
            ) : hashtag.trim() ? (
              // No results state
              <p className="text-center text-muted-foreground py-4">
                No hashtags found for &quot;{hashtag}&quot;
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

