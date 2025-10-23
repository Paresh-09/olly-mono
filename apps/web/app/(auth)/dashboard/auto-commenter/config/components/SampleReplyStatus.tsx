import React from "react";
import { Check, Eye, Clock } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

interface SampleReplyStatusProps {
  hasReply: boolean;
  replyLength?: number;
  className?: string;
}

export default function SampleReplyStatus({
  hasReply,
  replyLength = 0,
  className
}: SampleReplyStatusProps) {
  // If there's no reply, show "Not Started"
  if (!hasReply) {
    return (
      <div className={cn("flex items-center gap-1 text-gray-500 text-xs", className)}>
        <Clock className="h-3 w-3" />
        <span>Not Started</span>
      </div>
    );
  }

  // If there's a reply but it's very short (less than 20 chars), show "Started"
  if (replyLength < 20) {
    return (
      <div className={cn("flex items-center gap-1 text-amber-600 text-xs", className)}>
        <Eye className="h-3 w-3" />
        <span>Started</span>
      </div>
    );
  }

  // Otherwise show "Completed"
  return (
    <div className={cn("flex items-center gap-1 text-green-600 text-xs", className)}>
      <Check className="h-3 w-3" />
      <span>Completed</span>
    </div>
  );
} 