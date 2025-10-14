import { useState } from 'react';
import { Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Platform } from '@prisma/client';
import { useToast } from '@repo/ui/hooks/use-toast';

interface ShareSpacePostProps {
  post: {
    id: string;
    url: string;
    platform: Platform;
    creditsPerShare: number;
    deadline: string;
    user: {
      id: string;
      name: string;
    };
  };
}

export default function ShareSpacePost({ post }: ShareSpacePostProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const hostname = new URL(post.url).hostname;

  const handlePostClick = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/share-space/${post.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform: post.platform }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to record interaction');
      }

      const data = await response.json();
      if (data.credited) {
        toast({
          title: "Success",
          description: `You earned ${data.creditsPaid} credits!`,
        });
      }

      window.open(post.url, '_blank');
    } catch (error) {
      console.error('Error recording post interaction:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record interaction",
        variant: "destructive",
      });
      
      window.open(post.url, '_blank');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 py-1.5 text-sm">
      <button
        onClick={handlePostClick}
        disabled={isLoading}
        className="text-blue-600 hover:underline truncate"
      >
        {hostname}
      </button>
      <span className="text-gray-500 capitalize">{post.platform.toLowerCase()}</span>
      <span className="text-gray-500">{post.creditsPerShare} credits</span>
      <span className="text-gray-500 flex items-center">
        <Clock size={12} className="mr-1" />
        {formatDistanceToNow(new Date(post.deadline), { addSuffix: true })}
      </span>
    </div>
  );
} 