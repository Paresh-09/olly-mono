import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/instagram/webhook-helpers";
import prismadb from "@/lib/prismadb";
import { decrypt } from "@/lib/encryption";

// Get environment variables
const INSTAGRAM_VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN || "";
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET || "";
const IG_API_VERSION = "v22.0"; // Instagram Graph API version
/**
 * Handle GET requests for webhook verification
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    console.log("Instagram webhook verification request received:", {
      mode,
      token,
    });

    // Verify the mode and token
    if (mode === "subscribe" && token === INSTAGRAM_VERIFY_TOKEN) {
      console.log("Instagram webhook verified successfully");
      return new NextResponse(challenge, { status: 200 });
    } else {
      console.error(
        "Instagram webhook verification failed: Invalid mode or token",
      );
      return new NextResponse("Verification failed", { status: 403 });
    }
  } catch (error) {
    console.error("Error handling Instagram webhook verification:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

/**
 * Handle POST requests for webhook notifications
 */
export async function POST(request: NextRequest) {
  try {
    // Check if this is a test request
    const isTestRequest = request.headers.get("x-test-webhook") === "true";

    // Get the raw request body
    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");

    // For real requests, verify the signature
    // Skip verification for test requests
    if (!isTestRequest) {
      const isSignatureValid = verifyWebhookSignature(
        rawBody,
        signature,
        INSTAGRAM_APP_SECRET,
      );

      if (!isSignatureValid) {
        console.error("Invalid webhook signature");
        return new NextResponse("Invalid signature", { status: 403 });
      }
    } else {
      console.log(
        "Processing test webhook request (signature verification bypassed)",
      );
    }

    // Parse the webhook data
    const webhookData = JSON.parse(rawBody);


    // Process the webhook based on the type of notification
    const entry = webhookData.entry?.[0];
    if (!entry) {
      console.warn("No entry in webhook data");
      return isTestRequest
        ? NextResponse.json(
            { error: "No entry in webhook data" },
            { status: 400 },
          )
        : new NextResponse("OK", { status: 200 });
    }

    const changes = entry.changes?.[0];
    if (!changes) {
      console.warn("No changes in webhook entry");
      return isTestRequest
        ? NextResponse.json(
            { error: "No changes in webhook entry" },
            { status: 400 },
          )
        : new NextResponse("OK", { status: 200 });
    }

    const field = changes.field;
    const value = changes.value;
    let instagramId = entry.id;

    // Special handling for test requests - we need to find the actual Instagram ID
    if (
      isTestRequest &&
      (instagramId === "PLACEHOLDER_INSTAGRAM_ID" || !instagramId)
    ) {
      console.log("Test request detected, determining Instagram ID");
      instagramId = await getTestInstagramId();

      if (!instagramId) {
        console.error("Could not determine Instagram ID for test request");
        return NextResponse.json(
          {
            error:
              "Could not determine Instagram ID. Make sure you have a valid Instagram account connected.",
          },
          { status: 400 },
        );
      }

     
    }

 

    // Handle different types of webhooks
    let processingResult = { success: true, error: null };

    switch (field) {
      case "comments":
        processingResult = await handleCommentWebhook(
          instagramId,
          value,
          isTestRequest,
        );
        break;
      case "mentions":
        processingResult = await handleMentionWebhook(
          instagramId,
          value,
          isTestRequest,
        );
        break;
      case "messages":
        processingResult = await handleMessageWebhook(
          instagramId,
          value,
          isTestRequest,
        );
        break;
      case "live_comments":
        processingResult = await handleLiveCommentWebhook(
          instagramId,
          value,
          isTestRequest,
        );
        break;
      default:
        console.log(`Unhandled webhook field: ${field}`);
    }

    // For test requests, check if we captured any specific errors to return to the client
    if (isTestRequest && !processingResult.success && processingResult.error) {
      return NextResponse.json(
        {
          status: "processed_with_errors",
          // @ts-ignore
          error: processingResult.error?.message || "Unknown error",
          instagramError: processingResult.error,
        },
        { status: 200 },
      );
    }

    // Normal success response
    return isTestRequest
      ? NextResponse.json({ status: "processed" }, { status: 200 })
      : new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Error handling Instagram webhook:", error);
    NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 },
    );
  }
}

/**
 * Get a valid Instagram ID for test requests
 */
async function getTestInstagramId(): Promise<string | null> {
  try {
    // Find the first valid Instagram account for testing
    const instagramAccount = await prismadb.oAuthToken.findFirst({
      where: {
        platform: "INSTAGRAM",
        isValid: true,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!instagramAccount) {
      console.error("No valid Instagram accounts found for test");
      return null;
    }

    // Decrypt the access token
    let accessToken;
    try {
      accessToken = decrypt(instagramAccount.accessToken);
    } catch (error) {
      console.error(`Failed to decrypt access token for test:`, error);
      return null;
    }

    // Get the Instagram business ID
    const igBusinessId = await getInstagramBusinessId(accessToken);
    return igBusinessId;
  } catch (error) {
    console.error("Error getting test Instagram ID:", error);
    return null;
  }
}

/**
 * Handle a comment webhook
 */
async function handleCommentWebhook(
  instagramId: string,
  value: any,
  isTest: boolean = false,
): Promise<{ success: boolean; error: any }> {


  try {
    // Extract comment details
    const commentId = value.comment_id;
    const postId = value.media_id;
    const commentText = value.text;
    const username = value.username;

    console.log(
      `New comment from ${username}: "${commentText}" on post ${postId}`,
    );

    // In a real implementation, you would:
    // 1. Look up the user associated with this Instagram account
    // 2. Check if they have automation rules configured
    // 3. Process the comment according to those rules
    // 4. Send a private reply if needed

    console.log(`Comment ${commentId} processed`);
    return { success: true, error: null };
  } catch (error) {
    console.error("Error processing comment webhook:", error);
    return { success: false, error: { message: String(error) } };
  }
}

/**
 * Handle a mention webhook
 */
async function handleMentionWebhook(
  instagramId: string,
  value: any,
  isTest: boolean = false,
): Promise<{ success: boolean; error: any }> {
  console.log(
    `Received mention webhook for Instagram ID ${instagramId}${isTest ? " (TEST)" : ""}`,
  );

  try {
    // Extract mention details
    const mentionId = value.mention_id;
    const mediaId = value.media_id;
    const mentionText = value.text;
    const mentioningUsername = value.username;

    console.log(
      `New mention from ${mentioningUsername}: "${mentionText}" on media ${mediaId}`,
    );

    // In a real implementation, you would process the mention
    // according to the user's automation rules

    console.log(`Mention ${mentionId} processed`);
    return { success: true, error: null };
  } catch (error) {
    console.error("Error processing mention webhook:", error);
    return { success: false, error: { message: String(error) } };
  }
}

/**
 * Handle a message webhook
 */
async function handleMessageWebhook(
  instagramId: string,
  value: any,
  isTest: boolean = false,
): Promise<{ success: boolean; error: any }> {
  console.log(
    `Received message webhook for Instagram ID ${instagramId}${isTest ? " (TEST)" : ""}`,
  );

  try {
    // Extract message details
    const messageId = value.message_id;
    const senderId = value.sender_id;
    const messageText = value.text;

    console.log(`New message from ${senderId}: "${messageText}"`);

    // In a real implementation, you would process the message
    // according to the user's automation rules

    console.log(`Message ${messageId} processed`);
    return { success: true, error: null };
  } catch (error) {
    console.error("Error processing message webhook:", error);
    return { success: false, error: { message: String(error) } };
  }
}

/**
 * Handle a live comment webhook
 */
async function handleLiveCommentWebhook(
  instagramId: string,
  value: any,
  isTest: boolean = false,
): Promise<{ success: boolean; error: any }> {
  console.log(
    `Received live comment webhook for Instagram ID ${instagramId}${isTest ? " (TEST)" : ""}`,
  );

  try {
    // Extract live comment details
    const commentId = value.id;
    const mediaId = value.media?.id;
    const commentText = value.text;
    const username = value.from?.username;
    const userId = value.from?.id;

    if (!commentId || !mediaId || !commentText || !username) {
      console.error("Missing required fields in live comment webhook");
      console.error("Received value:", JSON.stringify(value, null, 2));
      return {
        success: false,
        error: { message: "Missing required fields in live comment webhook" },
      };
    }

    console.log(
      `New live comment from ${username}: "${commentText}" on live stream ${mediaId}`,
    );

    // If this is a test request, we can skip the account matching step
    // and directly use the first available account
    if (isTest) {
      const instagramAccount = await prismadb.oAuthToken.findFirst({
        where: {
          platform: "INSTAGRAM",
          isValid: true,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!instagramAccount) {
        console.error(`No valid Instagram accounts found for test`);
        return {
          success: false,
          error: { message: "No valid Instagram accounts found for test" },
        };
      }

      // Get the user's access token
      let accessToken;
      try {
        accessToken = decrypt(instagramAccount.accessToken);
      } catch (error) {
        console.error(`Failed to decrypt access token for test:`, error);
        return {
          success: false,
          error: { message: "Failed to decrypt access token for test" },
        };
      }

      console.log(`Using account for user ${instagramAccount.userId} for test`);

      // Get DM automation rules for this media/post
      const dmConfig = await prismadb.instagramDMAutomation.findFirst({
        where: {
          userId: instagramAccount.userId,
          postId: mediaId,
          isEnabled: true,
        },
      });

      if (!dmConfig) {
        console.log(
          `No specific DM automation configured for post ${mediaId}, checking for default`,
        );

        // Check for a default configuration
        const defaultConfig = await prismadb.instagramDMAutomation.findFirst({
          where: {
            userId: instagramAccount.userId,
            postId: "default",
            isEnabled: true,
          },
        });

        if (!defaultConfig) {
          console.log(
            `No default DM automation configured for user ${instagramAccount.userId}`,
          );
          return { success: true, error: null }; // Not an error condition, just no automation
        }

        console.log(
          `Found default DM automation configuration for user ${instagramAccount.userId}`,
        );

        // Use the default configuration
        const result = await processLiveComment(
          instagramAccount.userId,
          defaultConfig,
          mediaId,
          commentId,
          commentText,
          username,
          instagramId,
          accessToken,
          isTest,
        );

        return result;
      }

      // Process the comment with the specific configuration
      const result = await processLiveComment(
        instagramAccount.userId,
        dmConfig,
        mediaId,
        commentId,
        commentText,
        username,
        instagramId,
        accessToken,
        isTest,
      );

      console.log(
        `Test live comment ${commentId} processed for user ${instagramAccount.userId}`,
      );
      return result;
    }

    // Regular (non-test) flow - find the matching Instagram account
    const instagramAccounts = await prismadb.oAuthToken.findMany({
      where: {
        platform: "INSTAGRAM",
        isValid: true,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (instagramAccounts.length === 0) {
      console.error(`No valid Instagram accounts found`);
      return {
        success: false,
        error: { message: "No valid Instagram accounts found" },
      };
    }

    // Track the result to return at the end
    let finalResult = { success: true, error: null };

    // Process for each account (in production, you'd want to match the specific account)
    for (const instagramAccount of instagramAccounts) {
      try {
        // Get the user's access token
        let accessToken;
        try {
          accessToken = decrypt(instagramAccount.accessToken);
        } catch (error) {
          console.error(
            `Failed to decrypt access token for user ${instagramAccount.userId}:`,
            error,
          );
          continue;
        }

        // Get Instagram business ID
        const igBusinessId = await getInstagramBusinessId(accessToken);
        if (!igBusinessId) {
          console.error(
            `Failed to get Instagram business ID for user ${instagramAccount.userId}`,
          );
          continue;
        }

        // Verify this is the correct account by checking if the business ID matches the webhook's Instagram ID
        if (igBusinessId !== instagramId) {
          console.log(
            `Instagram ID ${igBusinessId} doesn't match webhook ID ${instagramId}, skipping`,
          );
          continue;
        }

        console.log(
          `Found matching Instagram account for user ${instagramAccount.userId}`,
        );

        // Get DM automation rules for this media/post
        const dmConfig = await prismadb.instagramDMAutomation.findFirst({
          where: {
            userId: instagramAccount.userId,
            postId: mediaId,
            isEnabled: true,
          },
        });

        if (!dmConfig) {
          console.log(
            `No specific DM automation configured for live stream ${mediaId}, checking for default configuration`,
          );

          // Check for a default configuration (where postId is 'default' or similar)
          const defaultConfig = await prismadb.instagramDMAutomation.findFirst({
            where: {
              userId: instagramAccount.userId,
              postId: "default",
              isEnabled: true,
            },
          });

          if (!defaultConfig) {
            console.log(
              `No default DM automation configured for user ${instagramAccount.userId}`,
            );
            continue;
          }

          console.log(
            `Found default DM automation configuration for user ${instagramAccount.userId}`,
          );

          // Use the default configuration
          const result = await processLiveComment(
            instagramAccount.userId,
            defaultConfig,
            mediaId,
            commentId,
            commentText,
            username,
            igBusinessId,
            accessToken,
            isTest,
          );

          // Update the final result if this one failed
          if (!result.success) {
            finalResult = result;
          }

          continue;
        }

        // Process the comment with the specific configuration
        const result = await processLiveComment(
          instagramAccount.userId,
          dmConfig,
          mediaId,
          commentId,
          commentText,
          username,
          igBusinessId,
          accessToken,
          isTest,
        );

        // Update the final result if this one failed
        if (!result.success) {
          finalResult = result;
        }

        console.log(
          `Live comment ${commentId} processed for user ${instagramAccount.userId}`,
        );

        // We found and processed the matching account, so we can break the loop
        break;
      } catch (accountError) {
        console.error(
          `Error processing account for user ${instagramAccount.userId}:`,
          accountError,
        );
        // Continue with next account
      }
    }

    return finalResult;
  } catch (error) {
    console.error(`Error processing live comment:`, error);
    return {
      success: false,
      error: { message: String(error) },
    };
  }
}

/**
 * Get Instagram Business ID from user access token
 */
async function getInstagramBusinessId(
  accessToken: string,
): Promise<string | null> {
  try {
    // Use Instagram Graph API directly to get user info
    const userResponse = await fetch(
      `https://graph.instagram.com/${IG_API_VERSION}/me?fields=id,username,account_type&access_token=${accessToken}`,
    );

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error(`Failed to fetch Instagram user info: ${errorText}`);
      return null;
    }

    const userData = await userResponse.json();

    if (!userData.id) {
      console.error("No Instagram user ID found");
      return null;
    }

    // Use the user's ID directly as the business ID
    return userData.id;
  } catch (error) {
    console.error("Error getting Instagram user info:", error);
    return null;
  }
}

/**
 * Send a private reply to a comment
 */
async function sendPrivateReply(
  igBusinessId: string,
  commentId: string,
  message: string,
  accessToken: string,
) {
  try {
    // Using Instagram Graph API endpoint for private replies
    const replyResponse = await fetch(
      `https://graph.instagram.com/${IG_API_VERSION}/${igBusinessId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: {
            comment_id: commentId,
          },
          message: {
            text: message,
          },
          access_token: accessToken,
        }),
      },
    );

    if (!replyResponse.ok) {
      const errorText = await replyResponse.text();
      console.error(`Failed to send private reply: ${errorText}`);
      return { success: false, error: errorText };
    }

    const replyData = await replyResponse.json();
    return { success: true, data: replyData, error: null };
  } catch (error) {
    console.error(`Error sending private reply:`, error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send a direct message to a user by username
 */
async function sendDirectMessageByUsername(
  igBusinessId: string,
  username: string,
  message: string,
  accessToken: string,
) {
  try {
    console.log(`Attempting to send DM to ${username}`);

    username = "Yash Thakker";

    // Using Instagram Graph API endpoint for direct messages
    const dmResponse = await fetch(
      `https://graph.instagram.com/${IG_API_VERSION}/${igBusinessId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient_username: username,
          message: {
            text: message,
          },
          access_token: accessToken,
        }),
      },
    );

    if (!dmResponse.ok) {
      const errorText = await dmResponse.text();
      let instagramError = null;

      // Try to parse the Instagram error for better handling
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          instagramError = errorJson.error;
          console.error(
            `Instagram API error sending DM to ${username}:`,
            JSON.stringify(instagramError),
          );
        }
      } catch (e) {
        // Not JSON or other parsing error, use the raw text
      }

      console.error(
        `Failed to send direct message to ${username}: ${errorText}`,
      );
      return {
        success: false,
        error: errorText,
        instagramError,
      };
    }

    const dmData = await dmResponse.json();
    console.log(`Successfully sent DM to ${username}`);
    return { success: true, data: dmData, error: null };
  } catch (error) {
    console.error(`Error sending direct message to ${username}:`, error);
    return { success: false, error: String(error) };
  }
}

/**
 * Process a live comment with the given DM automation configuration
 */
async function processLiveComment(
  userId: string,
  dmConfig: any,
  mediaId: string,
  commentId: string,
  commentText: string,
  username: string,
  igBusinessId: string,
  accessToken: string,
  isTest: boolean = false,
): Promise<{ success: boolean; error: any }> {
  try {
    // Check if this comment has already been processed
    const existingComment = await prismadb.instagramCommentHistory.findFirst({
      where: {
        dmAutomationId: dmConfig.id,
        commentId: commentId,
      },
    });

    if (existingComment) {
      console.log(`Comment ${commentId} has already been processed`);
      return { success: true, error: null };
    }

    // Process DM rules from Prisma JSON field
    let keywordRules = [];
    try {
      if (dmConfig.dmRules) {
        // For Prisma JSON field, it should already be deserialized
        if (Array.isArray(dmConfig.dmRules)) {
          keywordRules = dmConfig.dmRules;
        } else if (typeof dmConfig.dmRules === "object") {
          // If it's a single object, wrap it in an array
          keywordRules = [dmConfig.dmRules];
        } else {
          // For backwards compatibility, handle string cases
          console.warn(
            `dmRules is in unexpected format: ${typeof dmConfig.dmRules}`,
          );
          try {
            const parsed = JSON.parse(dmConfig.dmRules.toString());
            keywordRules = Array.isArray(parsed) ? parsed : [parsed];
          } catch (e) {
            console.error(
              `Failed to parse dmRules string: ${dmConfig.dmRules}`,
            );
            keywordRules = [];
          }
        }
      }

      // Log the rules for debugging
      console.log(
        `Processed ${keywordRules.length} rules for config ${dmConfig.id}`,
      );
    } catch (parseError) {
      console.error(
        `Error processing DM rules for config ${dmConfig.id}:`,
        parseError,
      );
      console.error(`dmRules content type: ${typeof dmConfig.dmRules}`);
      console.error(
        `dmRules first 100 chars: ${JSON.stringify(dmConfig.dmRules).substring(0, 100)}`,
      );
      keywordRules = [];
    }

    // Find matching rules - support both "keyword" and "triggerKeyword" properties
    // to maintain compatibility with both formats
    const commentTextLower = commentText.toLowerCase();
    const matchingRules = keywordRules.filter((rule: any) => {
      if (!rule) return false;

      // Check if the rule is active (or default to true if not specified)
      const isActive = rule.isActive !== false;
      if (!isActive) {
        return false;
      }

      // Support both "keyword" (old) and "triggerKeyword" (new) properties
      const keyword = (rule.keyword || rule.triggerKeyword || "").toLowerCase();
      if (!keyword) return false;

      return commentTextLower.includes(keyword);
    });

    // Track if there was an error during processing
    let processingError = null;

    if (matchingRules.length > 0) {
      console.log(
        `Live comment ${commentId} matches ${matchingRules.length} rules`,
      );

      // Send private reply for each matching rule
      for (const rule of matchingRules) {
        try {
          if (!rule.message) {
            console.log(
              `Skipping rule with no message for comment ${commentId}`,
            );
            continue;
          }

          // For live comments, we need to send a direct message to the username
          const dmResult = await sendDirectMessageByUsername(
            igBusinessId,
            username,
            rule.message,
            accessToken,
          );

          if (!dmResult.success) {
            // Check if this is a "user not found" error, which is common in testing
            const isUserNotFoundError =
              dmResult.instagramError?.code === 100 &&
              dmResult.instagramError?.error_subcode === 2534014;

            const errorMessage = isUserNotFoundError
              ? `Instagram couldn't find the username "${username}". For testing, please use an existing Instagram username.`
              : String(dmResult.error);

            console.error(`Failed to send DM to ${username}: ${errorMessage}`);

            // Create history record with error
            await prismadb.instagramCommentHistory.create({
              data: {
                dmAutomationId: dmConfig.id,
                userId: userId,
                postId: mediaId,
                commentId: commentId,
                commentText: commentText,
                commenterName: username,
                responseType: "direct_message",
                responseStatus: "failed",
                errorMessage: errorMessage.substring(0, 255),
                processed: true,
                matchedRules: true,
              },
            });

            // Store the error for returning to the caller
            if (
              (isTest || commentId.startsWith("test-")) &&
              isUserNotFoundError
            ) {
              processingError = {
                type: "user_not_found",
                username,
                message: errorMessage,
              };
            }

            continue;
          }

          // Get the keyword used (for logging purposes)
          const keywordUsed = rule.keyword || rule.triggerKeyword;
          console.log(
            `Successfully sent DM to ${username} for rule "${keywordUsed}"`,
          );

          // Create successful history record
          await prismadb.instagramCommentHistory.create({
            data: {
              dmAutomationId: dmConfig.id,
              userId: userId,
              postId: mediaId,
              commentId: commentId,
              commentText: commentText,
              commenterName: username,
              responseType: "direct_message",
              responseText: rule.message,
              responseStatus: "sent",
              processed: true,
              matchedRules: true,
              respondedAt: new Date(),
            },
          });
        } catch (ruleError) {
          const keyword = rule?.keyword || rule?.triggerKeyword;
          console.error(
            `Error processing rule "${keyword}" for comment ${commentId}:`,
            ruleError,
          );
        }
      }
    } else {
      // No matching rules, just mark as processed
      await prismadb.instagramCommentHistory.create({
        data: {
          dmAutomationId: dmConfig.id,
          userId: userId,
          postId: mediaId,
          commentId: commentId,
          commentText: commentText,
          commenterName: username,
          processed: true,
          matchedRules: false,
        },
      });
    }

    // Return the final result
    return processingError
      ? { success: false, error: processingError }
      : { success: true, error: null };
  } catch (error) {
    console.error(
      `Error processing live comment with config ${dmConfig.id}:`,
      error,
    );
    return {
      success: false,
      error: { message: String(error) },
    };
  }
}

