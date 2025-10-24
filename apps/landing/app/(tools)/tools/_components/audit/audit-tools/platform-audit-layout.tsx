"use client";

import { ReactNode } from 'react';
import { Card } from '@repo/ui/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@repo/ui/components/ui/button';
import Link from 'next/link';

interface PlatformLayoutProps {
  title: string;
  description: string;
  icon: ReactNode;
  color: string;
  children: ReactNode;
}

export const PlatformAuditLayout = ({
  title,
  description,
  icon,
  color,
  children
}: PlatformLayoutProps) => {
  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/tools">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 flex flex-col items-center gap-3">
          <div className={`p-2 rounded-lg ${color}`}>
            {icon}
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>

      <Card className="p-6 w-full max-w-4xl mx-auto">
        {children}
      </Card>
    </div>
  );
};