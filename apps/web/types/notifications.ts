// types/notifications.ts
export enum NotificationType {
    SYSTEM = 'SYSTEM',
    CREDIT_UPDATE = 'CREDIT_UPDATE',
    LICENSE_EXPIRY = 'LICENSE_EXPIRY',
    TEAM_INVITE = 'TEAM_INVITE',
    USAGE_LIMIT = 'USAGE_LIMIT',
    FEATURE_ANNOUNCEMENT = 'FEATURE_ANNOUNCEMENT',
    SECURITY = 'SECURITY'
  }
  
  export enum NotificationStatus {
    READ = 'READ',
    UNREAD = 'UNREAD',
    ARCHIVED = 'ARCHIVED'
  }
  
  export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    status: NotificationStatus;
    link?: string | null;
    metadata?: Record<string, any> | null;
    createdAt: string | Date;
    readAt?: string | Date | null;
    expiresAt?: string | Date | null;
  }
  
  export interface NotificationResponse {
    notification?: Notification;
    notifications?: Notification[];
    error?: string;
    success?: boolean;
  }