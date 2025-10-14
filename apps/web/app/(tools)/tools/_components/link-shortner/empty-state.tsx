'use client'
import React from 'react';
import { Card, CardContent } from '@repo/ui/components/ui/card';
import { LinkIcon, Trash, History, ArrowDownToLine } from 'lucide-react';

type EmptyStateProps = {
  type: 'links' | 'history' | 'search';
  message?: string;
};

const EmptyState: React.FC<EmptyStateProps> = ({ type, message }) => {
  const content = {
    links: {
      icon: <LinkIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />,
      title: 'No shortened links yet',
      description: message || 'Enter a URL above to create your first short link.'
    },
    history: {
      icon: <Trash className="h-12 w-12 mx-auto text-gray-400 mb-3" />,
      title: 'No deleted links',
      description: message || 'When you delete links, theyll appear here.'
    },
    search: {
      icon: <History className="h-12 w-12 mx-auto text-gray-400 mb-3" />,
      title: 'No matching links found',
      description: message || 'Try a different search term or create a new link.'
    }
  };

  const selectedContent = content[type];

  return (
    <Card className="bg-gray-50 border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        {selectedContent.icon}
        <h3 className="text-lg font-medium text-gray-700 mb-1">{selectedContent.title}</h3>
        <p className="text-gray-500 text-center max-w-md">{selectedContent.description}</p>
      </CardContent>
    </Card>
  );
};

export default EmptyState;