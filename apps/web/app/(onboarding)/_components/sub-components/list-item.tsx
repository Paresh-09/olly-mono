// sub-components/list-item.tsx
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ListItemProps {
  text: string;
  number?: number;
  className?: string;
}

export function ListItem({ text, number, className }: ListItemProps) {
  return (
    <li className={cn("flex items-center gap-3", className)}>
      {number ? (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
          {number}
        </span>
      ) : (
        <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
          <Check className="h-3 w-3 text-green-600" />
        </div>
      )}
      <span className="text-sm text-muted-foreground">{text}</span>
    </li>
  );
}
  