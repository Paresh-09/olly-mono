'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface PlatformCardProps {
  title: string;
  description: string;
  hasConfig: boolean;
  configPath: string;
  icon: React.ReactNode;
  color: string;
  badgeText: string;
}

export default function PlatformCard({
  title,
  description,
  hasConfig,
  configPath,
  icon,
  color,
  badgeText
}: PlatformCardProps) {
  return (
    <Link href={configPath}>
      <Card className="shadow-none border hover:border-primary/50 transition-colors cursor-pointer group">
        <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className={`rounded-full w-6 h-6 ${color} flex items-center justify-center text-white`}>
              {icon}
            </div>
            {title}
          </CardTitle>
          <Badge 
            variant={hasConfig ? "default" : "outline"} 
            className={`${hasConfig ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'} font-normal`}
          >
            {badgeText}
          </Badge>
        </CardHeader>
        <CardContent className="p-3 pt-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{description}</p>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
} 