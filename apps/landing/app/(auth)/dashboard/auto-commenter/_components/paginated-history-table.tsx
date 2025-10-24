"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@repo/ui/components/ui/tabs";
import { Button } from "@repo/ui/components/ui/button";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { CommentHistoryTable } from "./auto-commenter-history";
import { type CommentHistory } from "@/types/auto-comment";

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ApiResponse {
  data: CommentHistory[];
  pagination: PaginationInfo;
}

interface PaginatedHistoryTableProps {
  userId: string;
}

export function PaginatedHistoryTable({ userId }: PaginatedHistoryTableProps) {
  const [commentsData, setCommentsData] = useState<ApiResponse | null>(null);
  const [likesData, setLikesData] = useState<ApiResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"comments" | "likes">("comments");
  const [commentsPage, setCommentsPage] = useState(1);
  const [likesPage, setLikesPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const ITEMS_PER_PAGE = 20;

  const fetchData = async (type: "comments" | "likes", page: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/auto-commenter/history?type=${type}&page=${page}&limit=${ITEMS_PER_PAGE}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      
      const data: ApiResponse = await response.json();
      
      if (type === "comments") {
        setCommentsData(data);
      } else {
        setLikesData(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    Promise.all([
      fetchData("comments", 1),
      fetchData("likes", 1)
    ]);
  }, [userId]);

  // Fetch data when page changes
  useEffect(() => {
    if (!initialLoading) {
      fetchData("comments", commentsPage);
    }
  }, [commentsPage]);

  useEffect(() => {
    if (!initialLoading) {
      fetchData("likes", likesPage);
    }
  }, [likesPage]);

  const handlePageChange = (type: "comments" | "likes", newPage: number) => {
    if (type === "comments") {
      setCommentsPage(newPage);
    } else {
      setLikesPage(newPage);
    }
  };

  const PaginationControls = ({ 
    pagination, 
    onPageChange 
  }: { 
    pagination: PaginationInfo;
    onPageChange: (page: number) => void;
  }) => (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-gray-500">
        Showing {Math.min(pagination.limit * (pagination.page - 1) + 1, pagination.totalCount)} to{" "}
        {Math.min(pagination.limit * pagination.page, pagination.totalCount)} of{" "}
        {pagination.totalCount} entries
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={!pagination.hasPrev || loading}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={!pagination.hasPrev || loading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            const startPage = Math.max(1, pagination.page - 2);
            const pageNum = startPage + i;
            
            if (pageNum > pagination.totalPages) return null;
            
            return (
              <Button
                key={pageNum}
                variant={pageNum === pagination.page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                disabled={loading}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={!pagination.hasNext || loading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.totalPages)}
          disabled={!pagination.hasNext || loading}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-2">
      {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-3 border rounded">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-14" />
          <Skeleton className="h-4 w-28" />
        </div>
      ))}
    </div>
  );

  if (initialLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "comments" | "likes")} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="comments">
          Comments ({commentsData?.pagination.totalCount || 0})
        </TabsTrigger>
        <TabsTrigger value="likes">
          Likes ({likesData?.pagination.totalCount || 0})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="comments" className="mt-6">
        {loading && activeTab === "comments" ? (
          <LoadingSkeleton />
        ) : commentsData ? (
          <>
            <CommentHistoryTable comments={commentsData.data} />
            <PaginationControls
              pagination={commentsData.pagination}
              onPageChange={(page) => handlePageChange("comments", page)}
            />
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">No comments found</div>
        )}
      </TabsContent>
      
      <TabsContent value="likes" className="mt-6">
        {loading && activeTab === "likes" ? (
          <LoadingSkeleton />
        ) : likesData ? (
          <>
            <CommentHistoryTable comments={likesData.data} />
            <PaginationControls
              pagination={likesData.pagination}
              onPageChange={(page) => handlePageChange("likes", page)}
            />
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">No likes found</div>
        )}
      </TabsContent>
    </Tabs>
  );
}