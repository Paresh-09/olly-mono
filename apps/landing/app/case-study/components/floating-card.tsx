"use client";

import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const BlogPostHeader = () => {
  const [headerCopy, setHeaderCopy] = useState("Unlock the power of AI for Social Media.");

  return (
    <div className="flex flex-col font-cal items-center text-center mt-8 shadow-lg shadow-teal-500 rounded-lg">
      <Card>
        <CardHeader className="text-l">{headerCopy}</CardHeader>

        <CardContent className="text-xs text-gray-500">
          AI Generated Comments, Virality scores, Posts and a lot more. With Lifetime access.
          <br />
          <Link href={"https://olly-ai.lemonsqueezy.com/buy/fa11a2cb-4f49-4959-a95a-215b29c51e89"}>
            <Button
              variant={"default"}
              className="mt-5"
            >
              Get Olly Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};