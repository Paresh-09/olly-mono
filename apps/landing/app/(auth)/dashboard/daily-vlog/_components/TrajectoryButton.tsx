'use client';

import { useState } from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { Sparkles } from 'lucide-react';
import { toast } from '@repo/ui/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@repo/ui/components/ui/alert-dialog';

interface TrajectoryButtonProps {
  userCredits: number;
}

export default function TrajectoryButton({ userCredits }: TrajectoryButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGenerateTrajectory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/trajectory-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate trajectory analysis');
      }

      const data = await response.json();
      
      toast({
        title: 'Analysis Generated',
        description: 'Your trajectory analysis has been created.',
      });
      
      // Navigate to the trajectory analysis page
      router.push('/dashboard/trajectory-analysis');
    } catch (error) {
      console.error('Error generating trajectory analysis:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate trajectory analysis',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasEnoughCredits = userCredits >= 1;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          Analyze
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Generate Trajectory Analysis</AlertDialogTitle>
          <AlertDialogDescription>
            {hasEnoughCredits ? (
              <>
                This will analyze your vlog entries from the past 30 days to identify patterns and trends in your life.
                <br /><br />
                This action will use 1 credit. You currently have {userCredits} credits.
              </>
            ) : (
              <>
                You need at least 1 credit to generate a trajectory analysis.
                <br /><br />
                You currently have {userCredits} credits. Please purchase more credits to use this feature.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {hasEnoughCredits && (
            <AlertDialogAction
              onClick={handleGenerateTrajectory}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Generating...
                </>
              ) : (
                'Generate Analysis'
              )}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 