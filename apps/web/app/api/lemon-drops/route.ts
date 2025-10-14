import { NextRequest, NextResponse } from "next/server";
import { sendDiscordNotification } from "@/service/discord-notify";
import crypto from "crypto";
import {
  sendLemonLicenseKeyUpdateEmail,
  sendLemonSqueezyWelcomeEmail,
  sendWelcomeEmail,
} from "@/lib/emails/welcome";
import { updateBrevoContact } from "@/lib/brevo-contact-update";
import prismadb from "@/lib/prismadb";
import { sendPersonalGoodbyeEmail } from "@/lib/emails/goodbye";
import { PlanVendor, TransactionType } from "@repo/db";
import { createCreditPurchaseNotification } from "@/lib/notifications/create";
import {
  deactivateUserSubscription,
  getLemonPlanDetails,
  handlePlanUpdate,
} from "@/utils/plans/plan-management";
import { handleSubscriptionEvent } from "@/utils/plans/lemon-subscription-handlers";

type LemonSqueezyStatus = "active" | "expired" | "disabled" | "inactive";
type DbStatus = "ACTIVE" | "INACTIVE";

interface User {
  userName: string;
  userEmail: string;
  licenseKey: string;
  lemonSqueezyStatus: LemonSqueezyStatus;
  status: DbStatus;
  activationLimit: number;
  instancesCount: number;
  createdAt: string;
  productId: number;
}

const ENTERPRISE_PRODUCT_IDS = process.env.LEMON_ENTERPRISE_PRODUCT_IDS?.split(
  ",",
).map(Number) || [363041, 363064];
const AGENCY_PRODUCT_IDS = process.env.LEMON_AGENCY_PRODUCT_IDS?.split(",").map(
  Number,
) || [363063, 321751];
const TEAM_PRODUCT_IDS = process.env.LEMON_TEAM_PRODUCT_IDS?.split(",").map(
  Number,
) || [363062, 363040];
const INDIVIDUAL_PRODUCT_IDS = process.env.LEMON_INDIVIDUAL_PRODUCT_IDS?.split(
  ",",
).map(Number) || [328561, 285937];

// Helper function to determine the plan type
function getPlanType(productId: number, isCreditPurchase?: boolean): string {
  if (isCreditPurchase) {
    return "credits";
  }

  if (ENTERPRISE_PRODUCT_IDS.includes(productId)) {
    return "Enterprise plan";
  } else if (AGENCY_PRODUCT_IDS.includes(productId)) {
    return "Agency plan";
  } else if (TEAM_PRODUCT_IDS.includes(productId)) {
    return "Team plan";
  } else if (INDIVIDUAL_PRODUCT_IDS.includes(productId)) {
    return "Individual plan";
  }
  
  return "Unknown plan";
}

// Helper function to send team Discord notification
async function sendTeamDiscordNotification(userName: string, planType: string, amount?: string, currency?: string) {
  try {
    const teamWebhookUrl = process.env.TEAM_DISCORD_WEBHOOK;
    if (!teamWebhookUrl) {
      console.warn("TEAM_DISCORD_WEBHOOK environment variable not set");
      return;
    }

    let message = `@everyone ${userName} purchased ${planType}`;
    if (amount && currency) {
      message += ` for $${amount} ${currency}`;
    }
    
    const response = await fetch(teamWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: message
      }),
    });

    if (!response.ok) {
      throw new Error(`Team Discord webhook failed: ${response.status}`);
    }
  } catch (error) {
    console.error("Error sending team Discord notification:", error);
    // Don't throw error to avoid breaking the main flow
  }
}

// function verifySignature(req: NextRequest, secret: string): boolean {
//     const signature  = req.headers.get('x-signature');
//     const body = req.body;

//     const payload = JSON.stringify(body);

//     const hmac = crypto.createHmac('sha256', secret);

//     const digest = `sha256=${hmac.update(payload).digest('hex')}`;

//     if (!signature || !digest) return false;

//     return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
// }

async function addLLMCredits(userEmail: string, productId: number) {
  try {
    const user = await prismadb.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      throw new Error(`User with email ${userEmail} not found`);
    }

    let creditAmount = 0;

    // Determine credit amount based on product type
    if (ENTERPRISE_PRODUCT_IDS.includes(productId)) {
      creditAmount = 2000; // 20 users * 100 credits
    } else if (AGENCY_PRODUCT_IDS.includes(productId)) {
      creditAmount = 1000; // 10 users * 100 credits
    } else if (TEAM_PRODUCT_IDS.includes(productId)) {
      creditAmount = 500; // 5 users * 100 credits
    } else if (INDIVIDUAL_PRODUCT_IDS.includes(productId)) {
      creditAmount = 100; // 1 user * 100 credits
    }

    if (creditAmount > 0) {
      // Update user's credit balance
      const userCredit = await prismadb.userCredit.upsert({
        where: { userId: user.id },
        update: { balance: { increment: creditAmount } },
        create: { userId: user.id, balance: creditAmount },
      });

      // Create a credit transaction record
      await prismadb.creditTransaction.create({
        data: {
          userCreditId: userCredit.id,
          amount: creditAmount,
          type: TransactionType.PURCHASED,
          description: `Plan included credits: ${creditAmount} LLM credits`,
        },
      });

   
      return creditAmount;
    }

    return 0;
  } catch (error) {
    console.error("Error adding LLM credits:", error);
    throw error;
  }
}

async function updateSubLicenses(mainLicenseKey: string, status: string) {
  try {
    await prismadb.subLicense.updateMany({
      where: { mainLicenseKeyId: mainLicenseKey },
      data: { status: status },
    });
    console.log(
      `Updated sub-licenses for main license key`,
    );
  } catch (error) {
    console.error(`Error updating sub-licenses for ${mainLicenseKey}:`, error);
    throw error;
  }
}

async function createSubLicenses(
  mainLicenseKey: string,
  productId: number,
  status: string,
) {
  try {
    let subLicenseCount = 0;

    if (ENTERPRISE_PRODUCT_IDS.includes(productId)) {
      subLicenseCount = 19; // Changed from 20 to 19 (1 main + 19 sub = 20 total)
    } else if (AGENCY_PRODUCT_IDS.includes(productId)) {
      subLicenseCount = 9; // Changed from 10 to 9 (1 main + 9 sub = 10 total)
    } else if (TEAM_PRODUCT_IDS.includes(productId)) {
      subLicenseCount = 4; // Changed from 5 to 4 (1 main + 4 sub = 5 total)
    } else if (INDIVIDUAL_PRODUCT_IDS.includes(productId)) {
      subLicenseCount = 0; // Stays 0 (1 main + 0 sub = 1 total)
    }

    for (let i = 0; i < subLicenseCount; i++) {
      await prismadb.subLicense.create({
        data: {
          key: `SUB-${i + 1}-${mainLicenseKey}`,
          status: status,
          mainLicenseKey: {
            connect: { key: mainLicenseKey },
          },
        },
      });
    }

    console.log(
      `Created sub-licenses for main license key`,
    );
  } catch (error) {
    console.error(`Error creating sub-licenses for ${mainLicenseKey}:`, error);
  }
}

async function updateDatabase(
  userName: string,
  userEmail: string,
  licenseKey: string,
  status: string,
  productId: number,
) {
  try {
    const now = new Date();
    const isActive = status === "ACTIVE";

    // Create or update the main LicenseKey
    const licenseKeyRecord = await prismadb.licenseKey.upsert({
      where: { key: licenseKey },
      update: {
        isActive: isActive,
        activatedAt: isActive ? now : undefined,
        isMainKey: true,
        lemonProductId: productId,
      },
      create: {
        key: licenseKey,
        isActive: isActive,
        activatedAt: isActive ? now : undefined,
        isMainKey: true,
        lemonProductId: productId,
      },
    });

    // Create or update the User
    const user = await prismadb.user.upsert({
      where: { email: userEmail },
      update: {},
      create: {
        email: userEmail,
        username: userName,
      },
    });

    // Create or update the UserLicenseKey relationship
    await prismadb.userLicenseKey.upsert({
      where: {
        userId_licenseKeyId: {
          userId: user.id,
          licenseKeyId: licenseKeyRecord.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        licenseKeyId: licenseKeyRecord.id,
      },
    });

    // Create an Installation record
    await prismadb.installation.create({
      data: {
        status: isActive ? "INSTALLED" : "UNINSTALLED",
        licenseKeyId: licenseKeyRecord.id,
      },
    });

    // Update or create Leaderboard entry
    await prismadb.leaderboard.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
      },
    });

    console.log("Successfully updated database");

    // Create sub-licenses only for non-individual plans
    if (!INDIVIDUAL_PRODUCT_IDS.includes(productId)) {
      if (status === "ACTIVE") {
        await createSubLicenses(licenseKey, productId, status);
      } else {
        await updateSubLicenses(licenseKey, status);
      }
    } else {
      console.log(
        `No sub-licenses created for individual plan. Product ID: ${productId}`,
      );
    }
  } catch (error) {
    console.error("Error updating database:", error);
    // Not throwing the error, just logging it
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const eventName = body.meta.event_name;
  const webhookId = body.meta.webhook_id;
  const dataId = body.data.id;
  let errors = [];

  // Handling order_created event
  if (eventName === "order_created") {
    const orderData = body.data.attributes;
    const user = {
      userName: orderData.user_name,
      userEmail: orderData.user_email,
      paidAmount: (orderData.total / 100).toFixed(2),
      currency: orderData.currency,
      createdAt: orderData.created_at,
    };

    // Get custom data from meta
    const customData = body.meta.custom_data;
    const isCreditPurchase =
      customData && customData.is_credit_purchase === "true";
    const creditAmount = isCreditPurchase ? parseInt(customData.credits) : 0;

    let creditPurchaseMessage = "";

    if (isCreditPurchase) {
      try {
        const userEmail = orderData.user_email;

        const user = await prismadb.user.findUnique({
          where: { email: userEmail },
        });

        if (!user) {
          throw new Error(`User with email ${userEmail} not found`);
        }

        // Update user's credit balance
        const userCredit = await prismadb.userCredit.upsert({
          where: { userId: user.id }, // Use the user's ID, not email
          update: { balance: { increment: creditAmount } },
          create: { userId: user.id, balance: creditAmount }, // Use the user's ID here as well
        });

        // Create a credit transaction record
        await prismadb.creditTransaction.create({
          data: {
            userCreditId: userCredit.id,
            amount: creditAmount,
            type: "PURCHASED",
            description: `Purchased ${creditAmount} credits`,
          },
        });

        await createCreditPurchaseNotification({
          userId: user.id,
          credits: creditAmount,
          orderId: orderData.id,
          price: orderData.total / 100,
          currency: "USD",
        });

        creditPurchaseMessage = ` They purchased ${creditAmount} credits. Along with the data id : ${dataId} and webhook id : ${webhookId}`;
        await sendDiscordNotification(creditPurchaseMessage, true);
      } catch (error) {
        console.error(`Error updating credit balance:`, error);
        errors.push("Failed to update credit balance");
      }
    }

    try {
      const message = `@everyone We made a Sale 🎉 to ${user.userName} (${user.userEmail}) for $${user.paidAmount} ${user.currency} at ${user.createdAt}.${creditPurchaseMessage}`;
      await sendDiscordNotification(message, true);
    } catch (error) {
      console.error(`Error sending Discord notification:`, error);
      errors.push("Failed to send Discord notification");
    }

    // Send team Discord notification (simple message with no PII)
    try {
      const planType = getPlanType(parseInt(orderData.product_id, 10), isCreditPurchase);
      await sendTeamDiscordNotification(user.userName, planType, user.paidAmount, user.currency);
    } catch (error) {
      console.error(`Error sending team Discord notification:`, error);
      // Don't add to errors array as this is optional
    }

    // Commented out welcome email code as per your original code
    // try {
    //     const firstName = user.userName.split(' ')[0];
    //     await sendLemonSqueezyWelcomeEmail(firstName, user.userEmail);
    // } catch (error) {
    //     console.error(`Error sending welcome email:`, error);
    //     errors.push("Failed to send welcome email");
    // }
  }

  function mapLemonSqueezyStatusToDbStatus(
    lemonSqueezyStatus: LemonSqueezyStatus,
  ): DbStatus {
    switch (lemonSqueezyStatus.toLowerCase()) {
      case "active":
        return "ACTIVE";
      case "expired":
      case "disabled":
      case "inactive":
        return "INACTIVE";
      default:
        console.warn(
          `Unknown LemonSqueezy status: ${lemonSqueezyStatus}. Defaulting to INACTIVE.`,
        );
        return "INACTIVE";
    }
  }

  if (
    eventName === "license_key_created" ||
    eventName === "license_key_updated"
  ) {
    const licenseKeyData = body.data.attributes;
    const user: User = {
      userName: licenseKeyData.user_name,
      userEmail: licenseKeyData.user_email,
      licenseKey: licenseKeyData.key,
      lemonSqueezyStatus: licenseKeyData.status as LemonSqueezyStatus,
      status: "ACTIVE", // Default value, will be updated for 'updated' event
      activationLimit: licenseKeyData.activation_limit,
      instancesCount: licenseKeyData.instances_count,
      createdAt: licenseKeyData.created_at,
      productId: parseInt(licenseKeyData.product_id, 10),
    };

    // Set status based on the event type
    if (eventName === "license_key_created") {
      user.status = "ACTIVE";
    } else {
      // license_key_updated
      user.status = mapLemonSqueezyStatusToDbStatus(user.lemonSqueezyStatus);
    }

    const action = eventName === "license_key_created" ? "created" : "updated";
    const errors: string[] = [];

    if (eventName.startsWith("subscription_")) {
      try {
        await handleSubscriptionEvent(eventName, body.data);
      } catch (error) {
        console.error("Subscription handling error:", error);
        errors.push("Failed to handle subscription event");
      }
    }

    // Handle LLM credits for new licenses
    if (eventName === "license_key_created") {
      try {
        let creditAmount = 0;

        // Determine credit amount based on product type
        if (ENTERPRISE_PRODUCT_IDS.includes(user.productId)) {
          creditAmount = 2000; // 20 users * 100 credits
        } else if (AGENCY_PRODUCT_IDS.includes(user.productId)) {
          creditAmount = 1000; // 10 users * 100 credits
        } else if (TEAM_PRODUCT_IDS.includes(user.productId)) {
          creditAmount = 500; // 5 users * 100 credits
        } else if (INDIVIDUAL_PRODUCT_IDS.includes(user.productId)) {
          creditAmount = 100; // 1 user * 100 credits
        }

        if (creditAmount > 0) {
          const dbUser = await prismadb.user.findUnique({
            where: { email: user.userEmail },
          });

          if (!dbUser) {
            throw new Error(`User with email ${user.userEmail} not found`);
          }

          // Update user's credit balance
          const userCredit = await prismadb.userCredit.upsert({
            where: { userId: dbUser.id },
            update: { balance: { increment: creditAmount } },
            create: { userId: dbUser.id, balance: creditAmount },
          });

          // Create a credit transaction record
          await prismadb.creditTransaction.create({
            data: {
              userCreditId: userCredit.id,
              amount: creditAmount,
              type: TransactionType.PURCHASED,
              description: `Plan included credits: ${creditAmount} LLM credits`,
            },
          });

      

          const message =
            `🔑 License key ${action} for ${user.userName} (${user.userEmail}), ` +
            `Key: ${user.licenseKey}, LemonSqueezy Status: ${user.lemonSqueezyStatus}, DB Status: ${user.status}, ` +
            `Activation Limit: ${user.activationLimit}, Instances: ${user.instancesCount || "N/A"}, ` +
            `Created At: ${user.createdAt}, Product ID: ${user.productId}${creditAmount}`;
          await sendDiscordNotification(message, true);

          // Send team Discord notification for license key creation
          try {
            const planType = getPlanType(user.productId, false);
            await sendTeamDiscordNotification(user.userName, planType);
          } catch (error) {
            console.error(`Error sending team Discord notification:`, error);
            // Don't add to errors array as this is optional
          }
        }
      } catch (error) {
        console.error("Error adding LLM credits:", error);
        errors.push("Failed to add LLM credits");
      }
    }

    
    if (user.userEmail) {
      try {
        const dbUser = await prismadb.user.findUnique({
          where: { email: user.userEmail },
        });

        if (dbUser) {
          // Get plan information
          const planDetails = getLemonPlanDetails(user.productId);
          if (planDetails) {
            await prismadb.userSubscription.updateMany({
              where: {
                userId: dbUser.id,
                status: "ACTIVE",
              },
              data: {
                status: "CANCELLED",
                endDate: new Date(),
              },
            });

            await handlePlanUpdate({
              userId: dbUser.id,
              vendor: PlanVendor.LEMON,
              productId: user.productId.toString(),
            });
          }
        } else {
          console.warn(`User not found for email: ${user.userEmail}`);
          errors.push("User not found for plan update");
        }
      } catch (error) {
        console.error("Failed to update plan:", error);
        errors.push("Plan update failed but continuing with other operations");
      }
    }

    // Send welcome/update email
    try {
      const firstName = user.userName.split(" ")[0];
      if (eventName === "license_key_created") {
        await sendLemonSqueezyWelcomeEmail(
          firstName,
          user.userEmail,
          user.licenseKey,
        );
      } else {
        await sendLemonLicenseKeyUpdateEmail(
          firstName,
          user.userEmail,
          user.licenseKey,
          user.lemonSqueezyStatus,
        );
      }
    } catch (error) {
      console.error(`Error sending email: ${error}`);
      errors.push(
        `Failed to send ${action === "created" ? "welcome" : "update"} email`,
      );
    }

    // Update Brevo contact
    try {
      const firstName = user.userName.split(" ")[0];
      const lastName = user.userName.split(" ").slice(1).join(" ");
      const brevoResponse = await updateBrevoContact({
        email: user.userEmail,
        attributes: {
          FIRSTNAME: firstName,
          LASTNAME: lastName,
          SOURCE: "LemonSqueezy_LicenseKey",
          LICENSE_STATUS: user.status,
          PAID: true,
        },
        listIds: [12],
        updateEnabled: true,
      });

      if (brevoResponse.status !== 200) {
        throw new Error(await brevoResponse.text());
      }
    } catch (error) {
      console.error(`Error updating Brevo contact:`, error);
      errors.push("Failed to update Brevo contact");
    }

    // Update database and handle sub-licenses
    try {
      await updateDatabase(
        user.userName,
        user.userEmail,
        user.licenseKey,
        user.status,
        user.productId,
      );

      if (eventName === "license_key_updated" && user.status === "INACTIVE") {
        await updateSubLicenses(user.licenseKey, "INACTIVE");
      }
    } catch (error) {
      console.error(`Error updating database:`, error);
      errors.push("Failed to update database");
    }

    // Send Discord notification with credit information
    try {
    } catch (error) {
      console.error(`Error sending Discord notification:`, error);
      errors.push("Failed to send Discord notification");
    }

    if (errors.length > 0) {
      console.error(
        `Errors occurred while processing license key ${action}:`,
        errors,
      );
    }
  }

  if (eventName === "license_key_revoked") {
    const licenseKeyData = body.data.attributes;
    const user = {
      userName: licenseKeyData.user_name,
      userEmail: licenseKeyData.user_email,
      licenseKey: licenseKeyData.key,
      productId: parseInt(licenseKeyData.product_id, 10), // Convert to integer
    };

    if (user.userEmail) {
      try {
        const dbUser = await prismadb.user.findUnique({
          where: { email: user.userEmail },
        });

        if (dbUser) {
          await deactivateUserSubscription(dbUser.id);
          console.log(
            `Successfully deactivated subscription for user ${user.userEmail}`,
          );
        } else {
          console.warn(`User not found for email: ${user.userEmail}`);
          errors.push("User not found for subscription deactivation");
        }
      } catch (error) {
        console.error("Failed to deactivate subscription:", error);
        errors.push(
          "Subscription deactivation failed but continuing with other operations",
        );
      }
    }

    try {
      const message = `🔑 License key revoked for ${user.userName} (${user.userEmail}), Key: ${user.licenseKey}`;
      await sendDiscordNotification(message, true);
    } catch (error) {
      console.error(`Error sending Discord notification:`, error);
      errors.push("Failed to send Discord notification");
    }

    try {
      const vendorName = "LemonSqueezy";
      const status = "INACTIVE";
    } catch (error) {
      console.error(`Error updating Google Sheets:`, error);
      errors.push("Failed to update Google Sheets");
    }

    try {
      await updateDatabase(
        user.userName,
        user.userEmail,
        user.licenseKey,
        "INACTIVE",
        user.productId,
      );
    } catch (error) {
      console.error(`Error updating database:`, error);
      errors.push("Failed to update database");
    }

    try {
      // Update all associated sub-licenses to INACTIVE
      await prismadb.subLicense.updateMany({
        where: { mainLicenseKeyId: user.licenseKey },
        data: { status: "INACTIVE" },
      });
    } catch (error) {
      console.error(`Error updating sub-licenses:`, error);
      errors.push("Failed to update sub-licenses");
    }

    // Send personal goodbye email
    try {
      const firstName = user.userName.split(" ")[0];
      await sendPersonalGoodbyeEmail(firstName, user.userEmail);
    } catch (error) {
      console.error(`Error sending personal goodbye email:`, error);
      errors.push("Failed to send personal goodbye email");
    }
  }

  if (eventName === "order_refunded") {
    const userData = body.data;
    const user = {
      userName: userData.attributes.user_name,
      userEmail: userData.attributes.user_email,
      paidAmount: (userData.attributes.total / 100).toFixed(2),
      currency: userData.attributes.currency,
      createdAt: userData.attributes.created_at,
      refunded: userData.attributes.refunded,
    };

    try {
      const message = `@everyone ${user.userName} (${user.userEmail}) refunded $${user.paidAmount} ${user.currency} at ${user.createdAt}`;
      await sendDiscordNotification(message, true);
    } catch (error) {
      console.error(`Error sending Discord notification:`, error);
      errors.push("Failed to send Discord notification");
    }

    // Send personal goodbye email for refund
    try {
      const firstName = user.userName.split(" ")[0];
      await sendPersonalGoodbyeEmail(firstName, user.userEmail);
    } catch (error) {
      console.error(`Error sending personal goodbye email:`, error);
      errors.push("Failed to send personal goodbye email");
    }
  }

  return NextResponse.json(
    {
      success: true,
      message: "Webhook processed",
      errors: errors.length > 0 ? errors : undefined,
    },
    { status: 200 },
  );
}
