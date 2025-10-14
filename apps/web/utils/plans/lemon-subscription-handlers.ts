// utils/subscriptions/subscription-handlers.ts

import {
  PlanVendor,
  Prisma,
  SubscriptionStatus,
  TransactionType,
} from "@repo/db";
import prismadb from "@/lib/prismadb";
import { getLemonPlanDetails } from "./plan-management";
import { sendDiscordNotification } from "@/service/discord-notify";

interface SubscriptionData {
  id: string;
  attributes: {
    user_email: string;
    order_id: string | number;
    customer_id: string | number;
    renews_at: string;
    ends_at?: string;
    product_id: number;
    status: string;
    trial_ends_at?: string; // Added to track trial period
  };
}

async function findUserAndLicenseKey(data: SubscriptionData) {
  const user = await prismadb.user.findUnique({
    where: { email: data.attributes.user_email },
  });

  if (!user)
    throw new Error(`User not found for email: ${data.attributes.user_email}`);

  const licenseKey = await prismadb.licenseKey.findFirst({
    where: {
      lemonProductId: data.attributes.product_id,
      users: {
        some: {
          userId: user.id,
        },
      },
    },
  });

  if (!licenseKey)
    throw new Error(
      `License key not found for product ID: ${data.attributes.product_id}`,
    );

  // Get plan details
  const planDetails = getLemonPlanDetails(data.attributes.product_id);
  if (!planDetails)
    throw new Error(`Invalid product ID: ${data.attributes.product_id}`);

  return { user, licenseKey, planDetails };
}

async function findOrCreatePlan(productId: number, planDetails: any) {
  return await prismadb.plan.upsert({
    where: {
      vendor_productId: {
        vendor: PlanVendor.LEMON,
        productId: productId.toString(),
      },
    },
    create: {
      vendor: PlanVendor.LEMON,
      productId: productId.toString(),
      tier: planDetails.tier,
      duration: planDetails.duration,
      name: planDetails.name,
      maxUsers: planDetails.maxUsers,
      isActive: true,
    },
    update: {},
  });
}

/**
 * Deducts credits when a user cancels during trial period
 * @param userId User ID to deduct credits from
 * @param data Subscription data from webhook
 */
async function deductTrialCancellationCredits(
  userId: string,
  data: SubscriptionData,
): Promise<void> {
  try {
    // Check if user is on trial
    const isOnTrial =
      data.attributes.trial_ends_at &&
      new Date(data.attributes.trial_ends_at) > new Date();

    if (!isOnTrial) {
      console.log("Not a trial cancellation, skipping credit deduction");
      return;
    }

    // Determine product type and credits to deduct
    const productId = data.attributes.product_id;

    // Define credit amounts based on plan type
    let creditAmount = 0;
    if (
      process.env.LEMON_ENTERPRISE_PRODUCT_IDS?.split(",")
        .map(Number)
        .includes(productId)
    ) {
      creditAmount = 2000;
    } else if (
      process.env.LEMON_AGENCY_PRODUCT_IDS?.split(",")
        .map(Number)
        .includes(productId)
    ) {
      creditAmount = 1000;
    } else if (
      process.env.LEMON_TEAM_PRODUCT_IDS?.split(",")
        .map(Number)
        .includes(productId)
    ) {
      creditAmount = 500;
    } else if (
      process.env.LEMON_INDIVIDUAL_PRODUCT_IDS?.split(",")
        .map(Number)
        .includes(productId)
    ) {
      creditAmount = 100;
    }

    if (creditAmount <= 0) {
      console.log("No credits to deduct for this plan type");
      return;
    }

   

    // Get user credit balance
    const userCredit = await prismadb.userCredit.findUnique({
      where: { userId },
    });

    if (!userCredit) {
      console.warn(`No user credit record found for user ID: ${userId}`);
      return;
    }

    // Make sure we don't deduct more than available
    const deductAmount = Math.min(creditAmount, userCredit.balance);

    if (deductAmount <= 0) {
      console.log("User has no credits to deduct");
      return;
    }

    // Update user's credit balance
    await prismadb.userCredit.update({
      where: { userId },
      data: { balance: { decrement: deductAmount } },
    });

    // Create a credit transaction record
    await prismadb.creditTransaction.create({
      data: {
        userCreditId: userCredit.id,
        amount: -deductAmount, // Negative amount for deduction
        type: TransactionType.PURCHASED, // Using existing type instead of adding new one
        description: `${deductAmount} LLM credits deducted due to trial plan cancellation`,
      },
    });

    // Get user email for notification
    const user = await prismadb.user.findUnique({
      where: { id: userId },
      select: { email: true, username: true },
    });

    // Send notification to Discord
    if (user) {
      await sendDiscordNotification(
        `🚨 Trial Cancellation: Deducted ${deductAmount} credits from ${user.username} (${user.email}) for cancelling during trial period.`,
        true,
      );
    }

   
  } catch (error) {
    console.error("Error deducting trial cancellation credits:", error);
  }
}

const subscriptionEventHandlers = {
  subscription_created: async (data: SubscriptionData) => {
    const { user, licenseKey, planDetails } = await findUserAndLicenseKey(data);
    const plan = await findOrCreatePlan(
      data.attributes.product_id,
      planDetails,
    );

    await prismadb.userSubscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        vendorSubId: data.id,
        orderId: data.attributes.order_id.toString(),
        customerId: data.attributes.customer_id.toString(),
        nextBillingDate: new Date(data.attributes.renews_at),
        status: "ACTIVE",
        licenseKeyId: licenseKey.id,
      },
    });
  },

  subscription_cancelled: async (data: SubscriptionData) => {
    const sub = await prismadb.userSubscription.findUnique({
      where: { vendorSubId: data.id },
    });

    if (!sub) throw new Error(`Subscription not found: ${data.id}`);

    // Deduct credits if cancelling during trial
    await deductTrialCancellationCredits(sub.userId, data);

    await prismadb.userSubscription.update({
      where: { id: sub.id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        endDate: data.attributes.ends_at
          ? new Date(data.attributes.ends_at)
          : undefined,
      },
    });
  },

  subscription_payment_success: async (data: SubscriptionData) => {
    const sub = await prismadb.userSubscription.findUnique({
      where: { vendorSubId: data.id },
    });

    if (!sub) throw new Error(`Subscription not found: ${data.id}`);

    await prismadb.userSubscription.update({
      where: { id: sub.id },
      data: {
        status: "ACTIVE",
        lastBillingDate: new Date(),
        nextBillingDate: new Date(data.attributes.renews_at),
        paymentFailedDate: null,
      },
    });
  },

  subscription_payment_failed: async (data: SubscriptionData) => {
    const sub = await prismadb.userSubscription.findUnique({
      where: { vendorSubId: data.id },
    });

    if (!sub) throw new Error(`Subscription not found: ${data.id}`);

    await prismadb.userSubscription.update({
      where: { id: sub.id },
      data: {
        status: "PAYMENT_FAILED",
        paymentFailedDate: new Date(),
      },
    });
  },

  subscription_payment_recovered: async (data: SubscriptionData) => {
    const sub = await prismadb.userSubscription.findUnique({
      where: { vendorSubId: data.id },
    });

    if (!sub) throw new Error(`Subscription not found: ${data.id}`);

    await prismadb.userSubscription.update({
      where: { id: sub.id },
      data: {
        status: "ACTIVE",
        lastBillingDate: new Date(),
        paymentFailedDate: null,
      },
    });
  },

  subscription_paused: async (data: SubscriptionData) => {
    const sub = await prismadb.userSubscription.findUnique({
      where: { vendorSubId: data.id },
    });

    if (!sub) throw new Error(`Subscription not found: ${data.id}`);

    await prismadb.userSubscription.update({
      where: { id: sub.id },
      data: {
        status: "PAUSED",
        pausedAt: new Date(),
      },
    });
  },

  subscription_resumed: async (data: SubscriptionData) => {
    const sub = await prismadb.userSubscription.findUnique({
      where: { vendorSubId: data.id },
    });

    if (!sub) throw new Error(`Subscription not found: ${data.id}`);

    await prismadb.userSubscription.update({
      where: { id: sub.id },
      data: {
        status: "ACTIVE",
        resumedAt: new Date(),
        pausedAt: null,
      },
    });
  },
} as const;

export async function handleSubscriptionEvent(
  eventName: string,
  data: SubscriptionData,
) {
  const handler =
    subscriptionEventHandlers[
      eventName as keyof typeof subscriptionEventHandlers
    ];
  if (handler) {
    try {
      await handler(data);
    } catch (error) {
      console.error(`Error handling ${eventName}:`, error);
      throw error;
    }
  }
}

