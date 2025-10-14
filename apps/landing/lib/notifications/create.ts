// lib/notification-utils.ts
import { NotificationType, NotificationStatus } from '@/types/notifications';
import prismadb from '@/lib/prismadb';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  status?: NotificationStatus;
  link?: string;
  metadata?: Record<string, any>;
}

export async function createNotification({
  userId,
  title,
  message,
  type,
  status = NotificationStatus.UNREAD,
  link,
  metadata
}: CreateNotificationParams) {
  try {
    const notification = await prismadb.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        status,
        link,
        metadata
      }
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    // You might want to handle this error differently depending on your needs
    throw error;
  }
}

// Specific notification creators
export async function createCreditUpdateNotification({
  userId,
  amount,
  reason,
  customMessage
}: {
  userId: string;
  amount: number;
  reason: 'signup_bonus' | 'purchase' | 'refund' | 'admin' | 'system';
  customMessage?: string;
}) {
  const messages = {
    signup_bonus: `Welcome to Olly! We've added ${amount} credits to your account to help you get started.`,
    purchase: `${amount} credits have been added to your account from your recent purchase.`,
    refund: `${amount} credits have been refunded to your account.`,
    admin: `${amount} credits have been added to your account by an administrator.`,
    system: `${amount} credits have been added to your account.`
  };

  return createNotification({
    userId,
    title: amount > 0 ? `${amount} Credits Added! 🎉` : `Credits Updated`,
    message: customMessage || messages[reason],
    type: NotificationType.CREDIT_UPDATE,
    link: "/credits",
    metadata: {
      creditAmount: amount,
      reason
    }
  });
}

export async function createSherlockNotification({
    userId,
    username,
    totalFound,
    validFound,
    isSuccess,
    errorMessage,
    jobId,
    taskId  // Add taskId parameter
}: {
    userId: string;
    username: string;
    totalFound?: number;
    validFound?: number;
    isSuccess: boolean;
    errorMessage?: string;
    jobId: string;
    taskId: string;  // Add to type definition
}) {
    if (isSuccess) {
        return createNotification({
            userId,
            title: "🔍 Sherlock Search Complete",
            message: `Your search for "${username}" is complete! Found ${validFound} valid profiles across ${totalFound} platforms.`,
            type: NotificationType.SYSTEM,
            link: `/tools/sherlock/${jobId}`,  // Updated link with taskId
            metadata: {
                jobId,
                taskId,
                username,
                totalFound,
                validFound,
                type: 'sherlock_complete'
            }
        });
    } else {
        return createNotification({
            userId,
            title: "⚠️ Sherlock Search Failed",
            message: `Unfortunately, the search for "${username}" encountered an error. Please try again.`,
            type: NotificationType.SYSTEM,
            link: `/tools/sherlock/${taskId}`,  // Updated link even for failed jobs
            metadata: {
                jobId,
                taskId,
                username,
                error: errorMessage,
                type: 'sherlock_failed'
            }
        });
    }
}

interface CreditPurchaseDetails {
    userId: string;
    credits: number;
    orderId: string;
    price?: number;
    currency?: string;
  }
  
  export async function createCreditPurchaseNotification({
    userId,
    credits,
    orderId,
    price,
    currency = 'USD'
  }: CreditPurchaseDetails) {
    return createNotification({
      userId,
      title: "💳 Credit Purchase Successful",
      message: price 
        ? `Successfully purchased ${credits} credits for ${currency}${price}. Your credits have been added to your account.`
        : `Successfully purchased ${credits} credits. Your credits have been added to your account.`,
      type: NotificationType.CREDIT_UPDATE,
      link: "/credits",
      metadata: {
        creditAmount: credits,
        orderId,
        price,
        currency,
        type: 'credit_purchase'
      }
    });
  }