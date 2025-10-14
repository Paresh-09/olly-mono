// hooks/useNotifications.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Notification } from '@/types/notifications';
import { useSession } from '@/app/web/providers/SessionProvider';

interface NotificationResponse {
  notifications: Notification[];
  error?: string;
}

interface MarkReadResponse {
  success: boolean;
  error?: string;
}

interface UseNotificationsOptions {
  enabled?: boolean;
  pollInterval?: number;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { 
    enabled = true, 
    pollInterval = 300000, // 300 seconds default (5 minutes)
  } = options;
  
  const queryClient = useQueryClient();
  const sessionData = useSession();
  const isAuthenticated = !!sessionData?.user;

  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      // If not authenticated, return empty array
      if (!isAuthenticated) {
        return [];
      }
      
      const response = await fetch('/api/notifications');
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const data: NotificationResponse = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      return data.notifications || [];
    },
    refetchInterval: pollInterval,
    enabled: enabled && isAuthenticated, // Only enable if authenticated
    staleTime: 10000, // Consider data stale after 10 seconds
    gcTime: 300000, // Replace cacheTime with gcTime in v5
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationIds: string[]): Promise<MarkReadResponse> => {
      // Only proceed if the user is logged in
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }
      
      const response = await fetch('/api/notifications/mark-read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      });
      if (!response.ok) {
        throw new Error('Failed to mark notifications as read');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const archiveNotification = useMutation({
    mutationFn: async (notificationId: string): Promise<MarkReadResponse> => {
      // Only proceed if the user is logged in
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }
      
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to archive notification');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    notifications,
    isLoading,
    error,
    isError: !!error,
    isAuthenticated,
    markAsRead: (ids: string[]) => markAsReadMutation.mutate(ids),
    archiveNotification: (id: string) => archiveNotification.mutate(id),
    isMarkingAsRead: markAsReadMutation.isPending,
    isArchiving: archiveNotification.isPending,
    markAsReadError: markAsReadMutation.error,
    archiveError: archiveNotification.error,
  };
}