"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { Badge } from "@repo/ui/components/ui/badge";
import { ArrowUpDown } from "lucide-react";
import { FaFacebook, FaLinkedin, FaInstagram, FaTiktok } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Button } from "@repo/ui/components/ui/button";
import { type CommentHistory } from "@/types/auto-comment";
import Link from "next/link";
import { format } from "date-fns";

interface CommentHistoryTableProps {
  comments: CommentHistory[];
}

// Function to extract TikTok author from URL
function getTikTokAuthorFromUrl(url: string): string | null {
  try {
    // TikTok URLs like: https://tiktok.com/@username/video/123456789
    // or https://www.tiktok.com/@username/video/123456789
    const tiktokMatch = url.match(/tiktok\.com\/@([^\/\?]+)/);
    if (tiktokMatch) {
      return `@${tiktokMatch[1]}`;
    }
  } catch (error) {
    console.error('Error extracting TikTok author from URL:', error);
  }
  return null;
}

export function CommentHistoryTable({
  comments: initialComments,
}: CommentHistoryTableProps) {
  const [comments, setComments] = useState(initialComments);
  const [statusSort, setStatusSort] = useState<"asc" | "desc">("asc");
  const [timeSort, setTimeSort] = useState<"asc" | "desc">("asc");

  const sortByStatus = () => {
    const sorted = [...comments].sort((a, b) => {
      if (statusSort === "asc") {
        return a.status.localeCompare(b.status);
      }
      return b.status.localeCompare(a.status);
    });
    setComments(sorted);
    setStatusSort(statusSort === "asc" ? "desc" : "asc");
  };

  const sortByTime = () => {
    const sorted = [...comments].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return timeSort === "asc" ? dateA - dateB : dateB - dateA;
    });
    setComments(sorted);
    setTimeSort(timeSort === "asc" ? "desc" : "asc");
  };

  const getStatusColor = (status: CommentHistory["status"]) => {
    switch (status) {
      case "POSTED":
        return "bg-green-100 text-green-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Platform</TableHead>
            <TableHead>Author</TableHead>
            <TableHead className="max-w-[300px]">Action</TableHead>
            <TableHead>Post URL</TableHead>
            <TableHead>
              <Button variant="ghost" onClick={sortByStatus}>
                Status
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button variant="ghost" onClick={sortByTime}>
                Date and Time
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comments.map((comment) => (
            <TableRow key={comment.id}>
              <TableCell>
                {(() => {
                  // Detect platform from action content or platform field
                  if (comment.commentContent?.includes("facebook") || comment.platform === "FACEBOOK") {
                    return <FaFacebook className="h-5 w-5 text-[#1877F2]" />;
                  } else if (comment.platform === "LINKEDIN") {
                    return <FaLinkedin className="h-5 w-5 text-[#0A66C2]" />;
                  } else if (comment.platform === "INSTAGRAM") {
                    return <FaInstagram className="h-5 w-5 text-[#E4405F]" />;
                  } else if (comment.platform === "TWITTER" || comment.commentContent?.includes("twitter") || comment.commentContent?.includes("x_")) {
                    return <FaXTwitter className="h-5 w-5 text-black" />;
                  } else if (comment.platform === "TIKTOK" || comment.commentContent?.includes("tiktok")) {
                    return <FaTiktok className="h-5 w-5 text-black" />;
                  } else {
                    return <span className="text-sm text-gray-500">Other</span>;
                  }
                })()}
              </TableCell>
              <TableCell>
                {(() => {
                  // If we have an authorName, use it
                  if (comment.authorName) {
                    return comment.authorName;
                  }
                  
                  // For TikTok posts, try to extract author from URL
                  if ((comment.platform === "TIKTOK" || comment.commentContent?.includes("tiktok")) && comment.postUrl) {
                    const tiktokAuthor = getTikTokAuthorFromUrl(comment.postUrl);
                    if (tiktokAuthor) {
                      return tiktokAuthor;
                    }
                  }
                  
                  return "Unknown";
                })()}
              </TableCell>
              <TableCell className="max-w-[300px] truncate">
                <span
                  className={comment.status === "FAILED" ? "text-red-500" : ""}
                >
                  {comment.action === "LIKE" 
                    ? (comment.status === "FAILED" ? "Like Failed" : "Liked Post")
                    : (comment.commentContent || "Comment Failed")
                  }
                </span>
              </TableCell>
              <TableCell>
                <Link
                  href={comment.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Post
                </Link>
              </TableCell>
              <TableCell>
                <Badge
                  className={getStatusColor(comment.status)}
                  variant="secondary"
                >
                  {comment.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {format(new Date(comment.createdAt), "MMM dd, yyyy | HH:mm")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

