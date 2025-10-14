// import { NextRequest, NextResponse } from 'next/server';
// import { verifyWebhookSignature } from '@/lib/instagram/webhook-helpers';
// import prismadb from '@/lib/prismadb';
// import { decrypt } from '@/lib/encryption';

// // Get environment variables
// const INSTAGRAM_VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN || '';
// const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET || '';
// const IG_API_VERSION = 'v22.0';  // Instagram Graph API version

// /**
//  * Handle GET requests for webhook verification
//  */
// export async function GET(request: NextRequest) {
//   try {
//     // Get query parameters
//     const searchParams = request.nextUrl.searchParams;
//     const mode = searchParams.get('hub.mode');
//     const token = searchParams.get('hub.verify_token');
//     const challenge = searchParams.get('hub.challenge');

//     console.log('Instagram webhook verification request received:', { mode, token });

//     // Verify the mode and token
//     if (mode === 'subscribe' && token === INSTAGRAM_VERIFY_TOKEN) {
//       console.log('Instagram webhook verified successfully');
//       return new NextResponse(challenge, { status: 200 });
//     } else {
//       console.error('Instagram webhook verification failed: Invalid mode or token');
//       return new NextResponse('Verification failed', { status: 403 });
//     }
//   } catch (error) {
//     console.error('Error handling Instagram webhook verification:', error);
//     return new NextResponse('Internal Server Error', { status: 500 });
//   }
// }

// /**
//  * Handle POST requests for webhook notifications
//  */
// export async function POST(request: NextRequest) {
//   try {
//     // Get the raw request body for signature verification
//     const rawBody = await request.text();
//     const signature = request.headers.get('x-hub-signature-256');

//     // Verify the signature
//     const isSignatureValid = verifyWebhookSignature(rawBody, signature, INSTAGRAM_APP_SECRET);

//     if (!isSignatureValid) {
//       console.error('Invalid webhook signature');
//       return new NextResponse('Invalid signature', { status: 403 });
//     }

//     // Parse the webhook data
//     const webhookData = JSON.parse(rawBody);
//     console.log('Instagram webhook received:', JSON.stringify(webhookData, null, 2));

//     // Process the webhook based on the type of notification
//     const entry = webhookData.entry?.[0];
//     if (!entry) {
//       console.warn('No entry in webhook data');
//       return new NextResponse('OK', { status: 200 });
//     }

//     const changes = entry.changes?.[0];
//     if (!changes) {
//       console.warn('No changes in webhook entry');
//       return new NextResponse('OK', { status: 200 });
//     }

//     const field = changes.field;
//     const value = changes.value;
//     const instagramId = entry.id;

//     console.log(`Processing webhook for Instagram ID ${instagramId}, field: ${field}`);

//     // Handle different types of webhooks
//     switch (field) {
//       case 'comments':
//         await handleCommentWebhook(instagramId, value);
//         break;
//       case 'mentions':
//         await handleMentionWebhook(instagramId, value);
//         break;
//       case 'messages':
//         await handleMessageWebhook(instagramId, value);
//         break;
//       case 'live_comments':
//         await handleLiveCommentWebhook(instagramId, value);
//         break;
//       default:
//         console.log(`Unhandled webhook field: ${field}`);
//     }

//     return new NextResponse('OK', { status: 200 });
//   } catch (error) {
//     console.error('Error handling Instagram webhook:', error);
//     return new NextResponse('Internal Server Error', { status: 500 });
//   }
// }

// /**
//  * Handle a comment webhook
//  */
// async function handleCommentWebhook(instagramId: string, value: any) {
//   console.log(`Received comment webhook for Instagram ID ${instagramId}`);

//   // Extract comment details
//   const commentId = value.comment_id;
//   const postId = value.media_id;
//   const commentText = value.text;
//   const username = value.username;

//   console.log(`New comment from ${username}: "${commentText}" on post ${postId}`);

//   // In a real implementation, you would:
//   // 1. Look up the user associated with this Instagram account
//   // 2. Check if they have automation rules configured
//   // 3. Process the comment according to those rules
//   // 4. Send a private reply if needed

//   console.log(`Comment ${commentId} processed`);
// }

// /**
//  * Handle a mention webhook
//  */
// async function handleMentionWebhook(instagramId: string, value: any) {
//   console.log(`Received mention webhook for Instagram ID ${instagramId}`);

//   // Extract mention details
//   const mentionId = value.mention_id;
//   const mediaId = value.media_id;
//   const mentionText = value.text;
//   const mentioningUsername = value.username;

//   console.log(`New mention from ${mentioningUsername}: "${mentionText}" on media ${mediaId}`);

//   // In a real implementation, you would process the mention
//   // according to the user's automation rules

//   console.log(`Mention ${mentionId} processed`);
// }

// /**
//  * Handle a message webhook
//  */
// async function handleMessageWebhook(instagramId: string, value: any) {
//   console.log(`Received message webhook for Instagram ID ${instagramId}`);

//   // Extract message details
//   const messageId = value.message_id;
//   const senderId = value.sender_id;
//   const messageText = value.text;

//   console.log(`New message from ${senderId}: "${messageText}"`);

//   // In a real implementation, you would process the message
//   // according to the user's automation rules

//   console.log(`Message ${messageId} processed`);
// }

// /**
//  * Handle a live comment webhook
//  */
// async function handleLiveCommentWebhook(instagramId: string, value: any) {
//   console.log(`Received live comment webhook for Instagram ID ${instagramId}`);

//   try {
//     // Extract live comment details based on the provided format
//     // {
//     //   "field": "live_comments",
//     //   "value": {
//     //     "from": {
//     //       "id": "232323232",
//     //       "username": "test"
//     //     },
//     //     "media": {
//     //       "id": "123123123",
//     //       "media_product_type": "LIVE"
//     //     },
//     //     "id": "17865799348089039",
//     //     "text": "This is an example."
//     //   }
//     // }

//     const commentId = value.id;
//     const mediaId = value.media?.id;
//     const commentText = value.text;
//     const username = value.from?.username;
//     const userId = value.from?.id;

//     if (!commentId || !mediaId || !commentText || !username) {
//       console.error('Missing required fields in live comment webhook');
//       console.error('Received value:', JSON.stringify(value, null, 2));
//       return;
//     }

//     console.log(`New live comment from ${username}: "${commentText}" on live stream ${mediaId}`);

//     // Find the Instagram account owner
//     // Note: We're getting all valid Instagram tokens since we don't store the Instagram ID
//     // In a production environment, you would want to store the Instagram ID with the token
//     const instagramAccounts = await prismadb.oAuthToken.findMany({
//       where: {
//         platform: 'INSTAGRAM',
//         isValid: true,
//         expiresAt: {
//           gt: new Date()
//         }
//       }
//     });

//     if (instagramAccounts.length === 0) {
//       console.error(`No valid Instagram accounts found`);
//       return;
//     }

//     // Process for each account (in production, you'd want to match the specific account)
//     for (const instagramAccount of instagramAccounts) {
//       try {
//         // Get the user's access token
//         let accessToken;
//         try {
//           accessToken = decrypt(instagramAccount.accessToken);
//         } catch (error) {
//           console.error(`Failed to decrypt access token for user ${instagramAccount.userId}:`, error);
//           continue;
//         }

//         // Get Instagram business ID
//         const igBusinessId = await getInstagramBusinessId(accessToken);
//         if (!igBusinessId) {
//           console.error(`Failed to get Instagram business ID for user ${instagramAccount.userId}`);
//           continue;
//         }

//         // Verify this is the correct account by checking if the business ID matches the webhook's Instagram ID
//         if (igBusinessId !== instagramId) {
//           console.log(`Instagram ID ${igBusinessId} doesn't match webhook ID ${instagramId}, skipping`);
//           continue;
//         }

//         console.log(`Found matching Instagram account for user ${instagramAccount.userId}`);

//         // Get DM automation rules for this media/post
//         const dmConfig = await prismadb.instagramDMAutomation.findFirst({
//           where: {
//             userId: instagramAccount.userId,
//             postId: mediaId,
//             isEnabled: true
//           }
//         });

//         if (!dmConfig) {
//           console.log(`No specific DM automation configured for live stream ${mediaId}, checking for default configuration`);

//           // Check for a default configuration (where postId is 'default' or similar)
//           const defaultConfig = await prismadb.instagramDMAutomation.findFirst({
//             where: {
//               userId: instagramAccount.userId,
//               postId: 'default',
//               isEnabled: true
//             }
//           });

//           if (!defaultConfig) {
//             console.log(`No default DM automation configured for user ${instagramAccount.userId}`);
//             continue;
//           }

//           console.log(`Found default DM automation configuration for user ${instagramAccount.userId}`);

//           // Use the default configuration
//           await processLiveComment(
//             instagramAccount.userId,
//             defaultConfig,
//             mediaId,
//             commentId,
//             commentText,
//             username,
//             igBusinessId,
//             accessToken
//           );

//           continue;
//         }

//         // Process the comment with the specific configuration
//         await processLiveComment(
//           instagramAccount.userId,
//           dmConfig,
//           mediaId,
//           commentId,
//           commentText,
//           username,
//           igBusinessId,
//           accessToken
//         );

//         console.log(`Live comment ${commentId} processed for user ${instagramAccount.userId}`);

//         // We found and processed the matching account, so we can break the loop
//         break;
//       } catch (accountError) {
//         console.error(`Error processing account for user ${instagramAccount.userId}:`, accountError);
//         // Continue with next account
//       }
//     }
//   } catch (error) {
//     console.error(`Error processing live comment:`, error);
//   }
// }

// /**
//  * Get Instagram Business ID from user access token
//  */
// async function getInstagramBusinessId(accessToken: string): Promise<string | null> {
//   try {
//     // Use Instagram Graph API directly to get user info
//     const userResponse = await fetch(
//       `https://graph.instagram.com/${IG_API_VERSION}/me?fields=id,username,account_type&access_token=${accessToken}`
//     );

//     if (!userResponse.ok) {
//       const errorText = await userResponse.text();
//       console.error(`Failed to fetch Instagram user info: ${errorText}`);
//       return null;
//     }

//     const userData = await userResponse.json();

//     if (!userData.id) {
//       console.error('No Instagram user ID found');
//       return null;
//     }

//     // Use the user's ID directly as the business ID
//     return userData.id;
//   } catch (error) {
//     console.error('Error getting Instagram user info:', error);
//     return null;
//   }
// }

// /**
//  * Send a private reply to a comment
//  */
// async function sendPrivateReply(igBusinessId: string, commentId: string, message: string, accessToken: string) {
//   try {
//     // Using Instagram Graph API endpoint for private replies
//     const replyResponse = await fetch(
//       `https://graph.instagram.com/${IG_API_VERSION}/${igBusinessId}/messages`,
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           recipient: {
//             comment_id: commentId
//           },
//           message: {
//             text: message
//           },
//           access_token: accessToken
//         })
//       }
//     );

//     if (!replyResponse.ok) {
//       const errorText = await replyResponse.text();
//       console.error(`Failed to send private reply: ${errorText}`);
//       return { success: false, error: errorText };
//     }

//     const replyData = await replyResponse.json();
//     return { success: true, data: replyData, error: null };
//   } catch (error) {
//     console.error(`Error sending private reply:`, error);
//     return { success: false, error: String(error) };
//   }
// }

// /**
//  * Send a direct message to a user by username
//  */
// async function sendDirectMessageByUsername(igBusinessId: string, username: string, message: string, accessToken: string) {
//   try {
//     console.log(`Attempting to send DM to ${username}`);

//     // Using Instagram Graph API endpoint for direct messages
//     const dmResponse = await fetch(
//       `https://graph.instagram.com/${IG_API_VERSION}/${igBusinessId}/messages`,
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           recipient_username: username,
//           message: {
//             text: message
//           },
//           access_token: accessToken
//         })
//       }
//     );

//     if (!dmResponse.ok) {
//       const errorText = await dmResponse.text();
//       console.error(`Failed to send direct message to ${username}: ${errorText}`);
//       return { success: false, error: errorText };
//     }

//     const dmData = await dmResponse.json();
//     console.log(`Successfully sent DM to ${username}`);
//     return { success: true, data: dmData, error: null };
//   } catch (error) {
//     console.error(`Error sending direct message to ${username}:`, error);
//     return { success: false, error: String(error) };
//   }
// }

// /**
//  * Process a live comment with the given DM automation configuration
//  */
// async function processLiveComment(
//   userId: string,
//   dmConfig: any,
//   mediaId: string,
//   commentId: string,
//   commentText: string,
//   username: string,
//   igBusinessId: string,
//   accessToken: string
// ) {
//   try {
//     // Check if this comment has already been processed
//     const existingComment = await prismadb.instagramCommentHistory.findFirst({
//       where: {
//         dmAutomationId: dmConfig.id,
//         commentId: commentId
//       }
//     });

//     if (existingComment) {
//       console.log(`Comment ${commentId} has already been processed`);
//       return;
//     }

//     // Parse DM rules
//     let keywordRules = [];
//     try {
//       keywordRules = dmConfig.dmRules ? JSON.parse(dmConfig.dmRules.toString()) : [];
//     } catch (parseError) {
//       console.error(`Error parsing DM rules for config ${dmConfig.id}:`, parseError);
//       keywordRules = [];
//     }

//     // Find matching rules
//     const commentTextLower = commentText.toLowerCase();
//     const matchingRules = keywordRules.filter((rule: any) => {
//       if (!rule || !rule.keyword) return false;
//       const keyword = rule.keyword.toLowerCase();
//       return commentTextLower.includes(keyword);
//     });

//     if (matchingRules.length > 0) {
//       console.log(`Live comment ${commentId} matches ${matchingRules.length} rules`);

//       // Send private reply for each matching rule
//       for (const rule of matchingRules) {
//         try {
//           if (!rule.message) {
//             console.log(`Skipping rule with no message for comment ${commentId}`);
//             continue;
//           }

//           // For live comments, we need to send a direct message to the username
//           const dmResult = await sendDirectMessageByUsername(
//             igBusinessId,
//             username,
//             rule.message,
//             accessToken
//           );

//           if (!dmResult.success) {
//             console.error(`Failed to send DM to ${username}: ${dmResult.error}`);

//             // Create history record with error
//             await prismadb.instagramCommentHistory.create({
//               data: {
//                 dmAutomationId: dmConfig.id,
//                 userId: userId,
//                 postId: mediaId,
//                 commentId: commentId,
//                 commentText: commentText,
//                 commenterName: username,
//                 responseType: 'direct_message',
//                 responseStatus: 'failed',
//                 errorMessage: String(dmResult.error).substring(0, 255),
//                 processed: true,
//                 matchedRules: true
//               }
//             });

//             continue;
//           }

//           console.log(`Successfully sent DM to ${username} for rule "${rule.keyword}"`);

//           // Create successful history record
//           await prismadb.instagramCommentHistory.create({
//             data: {
//               dmAutomationId: dmConfig.id,
//               userId: userId,
//               postId: mediaId,
//               commentId: commentId,
//               commentText: commentText,
//               commenterName: username,
//               responseType: 'direct_message',
//               responseText: rule.message,
//               responseStatus: 'sent',
//               processed: true,
//               matchedRules: true,
//               respondedAt: new Date()
//             }
//           });
//         } catch (ruleError) {
//           console.error(`Error processing rule "${rule?.keyword}" for comment ${commentId}:`, ruleError);
//         }
//       }
//     } else {
//       // No matching rules, just mark as processed
//       await prismadb.instagramCommentHistory.create({
//         data: {
//           dmAutomationId: dmConfig.id,
//           userId: userId,
//           postId: mediaId,
//           commentId: commentId,
//           commentText: commentText,
//           commenterName: username,
//           processed: true,
//           matchedRules: false
//         }
//       });
//     }
//   } catch (error) {
//     console.error(`Error processing live comment with config ${dmConfig.id}:`, error);
//   }
// }

// import { NextRequest, NextResponse } from "next/server";
// import { verifyWebhookSignature } from "@/lib/instagram/webhook-helpers";
// import prismadb from "@/lib/prismadb";
// import { decrypt } from "@/lib/encryption";

// // Get environment variables
// const INSTAGRAM_VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN || "";
// const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET || "";
// const IG_API_VERSION = "v22.0"; // Instagram Graph API version

// /**
//  * Handle GET requests for webhook verification
//  */
// export async function GET(request: NextRequest) {
//   try {
//     // Get query parameters
//     const searchParams = request.nextUrl.searchParams;
//     const mode = searchParams.get("hub.mode");
//     const token = searchParams.get("hub.verify_token");
//     const challenge = searchParams.get("hub.challenge");

//     console.log("Instagram webhook verification request received:", {
//       mode,
//       token,
//     });

//     // Verify the mode and token
//     if (mode === "subscribe" && token === INSTAGRAM_VERIFY_TOKEN) {
//       console.log("Instagram webhook verified successfully");
//       return new NextResponse(challenge, { status: 200 });
//     } else {
//       console.error(
//         "Instagram webhook verification failed: Invalid mode or token",
//       );
//       return new NextResponse("Verification failed", { status: 403 });
//     }
//   } catch (error) {
//     console.error("Error handling Instagram webhook verification:", error);
//     return new NextResponse("Internal Server Error", { status: 500 });
//   }
// }

// /**
//  * Handle POST requests for webhook notifications
//  */
// export async function POST(request: NextRequest) {
//   try {
//     // Check if this is a test request
//     const isTestRequest = request.headers.get("x-test-webhook") === "true";

//     // Get the raw request body
//     const rawBody = await request.text();
//     const signature = request.headers.get("x-hub-signature-256");

//     // For real requests, verify the signature
//     // Skip verification for test requests
//     if (!isTestRequest) {
//       const isSignatureValid = verifyWebhookSignature(
//         rawBody,
//         signature,
//         INSTAGRAM_APP_SECRET,
//       );

//       if (!isSignatureValid) {
//         console.error("Invalid webhook signature");
//         return new NextResponse("Invalid signature", { status: 403 });
//       }
//     } else {
//       console.log(
//         "Processing test webhook request (signature verification bypassed)",
//       );
//     }

//     // Parse the webhook data
//     const webhookData = JSON.parse(rawBody);
//     console.log(
//       `Instagram webhook received (${isTestRequest ? "TEST" : "PRODUCTION"}):`,
//       JSON.stringify(webhookData, null, 2),
//     );

//     // Process the webhook based on the type of notification
//     const entry = webhookData.entry?.[0];
//     if (!entry) {
//       console.warn("No entry in webhook data");
//       return new NextResponse("OK", { status: 200 });
//     }

//     const changes = entry.changes?.[0];
//     if (!changes) {
//       console.warn("No changes in webhook entry");
//       return new NextResponse("OK", { status: 200 });
//     }

//     const field = changes.field;
//     const value = changes.value;
//     let instagramId = entry.id;

//     // Special handling for test requests - we need to find the actual Instagram ID
//     if (
//       isTestRequest &&
//       (instagramId === "PLACEHOLDER_INSTAGRAM_ID" || !instagramId)
//     ) {
//       console.log("Test request detected, determining Instagram ID");
//       instagramId = await getTestInstagramId();

//       if (!instagramId) {
//         console.error("Could not determine Instagram ID for test request");
//         return new NextResponse("Could not determine Instagram ID", {
//           status: 400,
//         });
//       }

//       console.log(`Using Instagram ID ${instagramId} for test request`);
//     }

//     console.log(
//       `Processing webhook for Instagram ID ${instagramId}, field: ${field}`,
//     );

//     // Handle different types of webhooks
//     switch (field) {
//       case "comments":
//         await handleCommentWebhook(instagramId, value, isTestRequest);
//         break;
//       case "mentions":
//         await handleMentionWebhook(instagramId, value, isTestRequest);
//         break;
//       case "messages":
//         await handleMessageWebhook(instagramId, value, isTestRequest);
//         break;
//       case "live_comments":
//         await handleLiveCommentWebhook(instagramId, value, isTestRequest);
//         break;
//       default:
//         console.log(`Unhandled webhook field: ${field}`);
//     }

//     return new NextResponse("OK", { status: 200 });
//   } catch (error) {
//     console.error("Error handling Instagram webhook:", error);
//     return new NextResponse("Internal Server Error", { status: 500 });
//   }
// }

// /**
//  * Get a valid Instagram ID for test requests
//  */
// async function getTestInstagramId(): Promise<string | null> {
//   try {
//     // Find the first valid Instagram account for testing
//     const instagramAccount = await prismadb.oAuthToken.findFirst({
//       where: {
//         platform: "INSTAGRAM",
//         isValid: true,
//         expiresAt: {
//           gt: new Date(),
//         },
//       },
//     });

//     if (!instagramAccount) {
//       console.error("No valid Instagram accounts found for test");
//       return null;
//     }

//     // Decrypt the access token
//     let accessToken;
//     try {
//       accessToken = decrypt(instagramAccount.accessToken);
//     } catch (error) {
//       console.error(`Failed to decrypt access token for test:`, error);
//       return null;
//     }

//     // Get the Instagram business ID
//     const igBusinessId = await getInstagramBusinessId(accessToken);
//     return igBusinessId;
//   } catch (error) {
//     console.error("Error getting test Instagram ID:", error);
//     return null;
//   }
// }

// /**
//  * Handle a comment webhook
//  */
// async function handleCommentWebhook(
//   instagramId: string,
//   value: any,
//   isTest: boolean = false,
// ) {
//   console.log(
//     `Received comment webhook for Instagram ID ${instagramId}${isTest ? " (TEST)" : ""}`,
//   );

//   // Extract comment details
//   const commentId = value.comment_id;
//   const postId = value.media_id;
//   const commentText = value.text;
//   const username = value.username;

//   console.log(
//     `New comment from ${username}: "${commentText}" on post ${postId}`,
//   );

//   // In a real implementation, you would:
//   // 1. Look up the user associated with this Instagram account
//   // 2. Check if they have automation rules configured
//   // 3. Process the comment according to those rules
//   // 4. Send a private reply if needed

//   console.log(`Comment ${commentId} processed`);
// }

// /**
//  * Handle a mention webhook
//  */
// async function handleMentionWebhook(
//   instagramId: string,
//   value: any,
//   isTest: boolean = false,
// ) {
//   console.log(
//     `Received mention webhook for Instagram ID ${instagramId}${isTest ? " (TEST)" : ""}`,
//   );

//   // Extract mention details
//   const mentionId = value.mention_id;
//   const mediaId = value.media_id;
//   const mentionText = value.text;
//   const mentioningUsername = value.username;

//   console.log(
//     `New mention from ${mentioningUsername}: "${mentionText}" on media ${mediaId}`,
//   );

//   // In a real implementation, you would process the mention
//   // according to the user's automation rules

//   console.log(`Mention ${mentionId} processed`);
// }

// /**
//  * Handle a message webhook
//  */
// async function handleMessageWebhook(
//   instagramId: string,
//   value: any,
//   isTest: boolean = false,
// ) {
//   console.log(
//     `Received message webhook for Instagram ID ${instagramId}${isTest ? " (TEST)" : ""}`,
//   );

//   // Extract message details
//   const messageId = value.message_id;
//   const senderId = value.sender_id;
//   const messageText = value.text;

//   console.log(`New message from ${senderId}: "${messageText}"`);

//   // In a real implementation, you would process the message
//   // according to the user's automation rules

//   console.log(`Message ${messageId} processed`);
// }

// /**
//  * Handle a live comment webhook
//  */
// async function handleLiveCommentWebhook(
//   instagramId: string,
//   value: any,
//   isTest: boolean = false,
// ) {
//   console.log(
//     `Received live comment webhook for Instagram ID ${instagramId}${isTest ? " (TEST)" : ""}`,
//   );

//   try {
//     // Extract live comment details
//     const commentId = value.id;
//     const mediaId = value.media?.id;
//     const commentText = value.text;
//     const username = value.from?.username;
//     const userId = value.from?.id;

//     if (!commentId || !mediaId || !commentText || !username) {
//       console.error("Missing required fields in live comment webhook");
//       console.error("Received value:", JSON.stringify(value, null, 2));
//       return;
//     }

//     console.log(
//       `New live comment from ${username}: "${commentText}" on live stream ${mediaId}`,
//     );

//     // If this is a test request, we can skip the account matching step
//     // and directly use the first available account
//     if (isTest) {
//       const instagramAccount = await prismadb.oAuthToken.findFirst({
//         where: {
//           platform: "INSTAGRAM",
//           isValid: true,
//           expiresAt: {
//             gt: new Date(),
//           },
//         },
//       });

//       if (!instagramAccount) {
//         console.error(`No valid Instagram accounts found for test`);
//         return;
//       }

//       // Get the user's access token
//       let accessToken;
//       try {
//         accessToken = decrypt(instagramAccount.accessToken);
//       } catch (error) {
//         console.error(`Failed to decrypt access token for test:`, error);
//         return;
//       }

//       console.log(`Using account for user ${instagramAccount.userId} for test`);

//       // Get DM automation rules for this media/post
//       const dmConfig = await prismadb.instagramDMAutomation.findFirst({
//         where: {
//           userId: instagramAccount.userId,
//           postId: mediaId,
//           isEnabled: true,
//         },
//       });

//       if (!dmConfig) {
//         console.log(
//           `No specific DM automation configured for post ${mediaId}, checking for default`,
//         );

//         // Check for a default configuration
//         const defaultConfig = await prismadb.instagramDMAutomation.findFirst({
//           where: {
//             userId: instagramAccount.userId,
//             postId: "default",
//             isEnabled: true,
//           },
//         });

//         if (!defaultConfig) {
//           console.log(
//             `No default DM automation configured for user ${instagramAccount.userId}`,
//           );
//           return;
//         }

//         console.log(
//           `Found default DM automation configuration for user ${instagramAccount.userId}`,
//         );

//         // Use the default configuration
//         await processLiveComment(
//           instagramAccount.userId,
//           defaultConfig,
//           mediaId,
//           commentId,
//           commentText,
//           username,
//           instagramId,
//           accessToken,
//         );

//         return;
//       }

//       // Process the comment with the specific configuration
//       await processLiveComment(
//         instagramAccount.userId,
//         dmConfig,
//         mediaId,
//         commentId,
//         commentText,
//         username,
//         instagramId,
//         accessToken,
//       );

//       console.log(
//         `Test live comment ${commentId} processed for user ${instagramAccount.userId}`,
//       );
//       return;
//     }

//     // Regular (non-test) flow - find the matching Instagram account
//     const instagramAccounts = await prismadb.oAuthToken.findMany({
//       where: {
//         platform: "INSTAGRAM",
//         isValid: true,
//         expiresAt: {
//           gt: new Date(),
//         },
//       },
//     });

//     if (instagramAccounts.length === 0) {
//       console.error(`No valid Instagram accounts found`);
//       return;
//     }

//     // Process for each account (in production, you'd want to match the specific account)
//     for (const instagramAccount of instagramAccounts) {
//       try {
//         // Get the user's access token
//         let accessToken;
//         try {
//           accessToken = decrypt(instagramAccount.accessToken);
//         } catch (error) {
//           console.error(
//             `Failed to decrypt access token for user ${instagramAccount.userId}:`,
//             error,
//           );
//           continue;
//         }

//         // Get Instagram business ID
//         const igBusinessId = await getInstagramBusinessId(accessToken);
//         if (!igBusinessId) {
//           console.error(
//             `Failed to get Instagram business ID for user ${instagramAccount.userId}`,
//           );
//           continue;
//         }

//         // Verify this is the correct account by checking if the business ID matches the webhook's Instagram ID
//         if (igBusinessId !== instagramId) {
//           console.log(
//             `Instagram ID ${igBusinessId} doesn't match webhook ID ${instagramId}, skipping`,
//           );
//           continue;
//         }

//         console.log(
//           `Found matching Instagram account for user ${instagramAccount.userId}`,
//         );

//         // Get DM automation rules for this media/post
//         const dmConfig = await prismadb.instagramDMAutomation.findFirst({
//           where: {
//             userId: instagramAccount.userId,
//             postId: mediaId,
//             isEnabled: true,
//           },
//         });

//         if (!dmConfig) {
//           console.log(
//             `No specific DM automation configured for live stream ${mediaId}, checking for default configuration`,
//           );

//           // Check for a default configuration (where postId is 'default' or similar)
//           const defaultConfig = await prismadb.instagramDMAutomation.findFirst({
//             where: {
//               userId: instagramAccount.userId,
//               postId: "default",
//               isEnabled: true,
//             },
//           });

//           if (!defaultConfig) {
//             console.log(
//               `No default DM automation configured for user ${instagramAccount.userId}`,
//             );
//             continue;
//           }

//           console.log(
//             `Found default DM automation configuration for user ${instagramAccount.userId}`,
//           );

//           // Use the default configuration
//           await processLiveComment(
//             instagramAccount.userId,
//             defaultConfig,
//             mediaId,
//             commentId,
//             commentText,
//             username,
//             igBusinessId,
//             accessToken,
//           );

//           continue;
//         }

//         // Process the comment with the specific configuration
//         await processLiveComment(
//           instagramAccount.userId,
//           dmConfig,
//           mediaId,
//           commentId,
//           commentText,
//           username,
//           igBusinessId,
//           accessToken,
//         );

//         console.log(
//           `Live comment ${commentId} processed for user ${instagramAccount.userId}`,
//         );

//         // We found and processed the matching account, so we can break the loop
//         break;
//       } catch (accountError) {
//         console.error(
//           `Error processing account for user ${instagramAccount.userId}:`,
//           accountError,
//         );
//         // Continue with next account
//       }
//     }
//   } catch (error) {
//     console.error(`Error processing live comment:`, error);
//   }
// }

// /**
//  * Get Instagram Business ID from user access token
//  */
// async function getInstagramBusinessId(
//   accessToken: string,
// ): Promise<string | null> {
//   try {
//     // Use Instagram Graph API directly to get user info
//     const userResponse = await fetch(
//       `https://graph.instagram.com/${IG_API_VERSION}/me?fields=id,username,account_type&access_token=${accessToken}`,
//     );

//     if (!userResponse.ok) {
//       const errorText = await userResponse.text();
//       console.error(`Failed to fetch Instagram user info: ${errorText}`);
//       return null;
//     }

//     const userData = await userResponse.json();

//     if (!userData.id) {
//       console.error("No Instagram user ID found");
//       return null;
//     }

//     // Use the user's ID directly as the business ID
//     return userData.id;
//   } catch (error) {
//     console.error("Error getting Instagram user info:", error);
//     return null;
//   }
// }

// /**
//  * Send a private reply to a comment
//  */
// async function sendPrivateReply(
//   igBusinessId: string,
//   commentId: string,
//   message: string,
//   accessToken: string,
// ) {
//   try {
//     // Using Instagram Graph API endpoint for private replies
//     const replyResponse = await fetch(
//       `https://graph.instagram.com/${IG_API_VERSION}/${igBusinessId}/messages`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           recipient: {
//             comment_id: commentId,
//           },
//           message: {
//             text: message,
//           },
//           access_token: accessToken,
//         }),
//       },
//     );

//     if (!replyResponse.ok) {
//       const errorText = await replyResponse.text();
//       console.error(`Failed to send private reply: ${errorText}`);
//       return { success: false, error: errorText };
//     }

//     const replyData = await replyResponse.json();
//     return { success: true, data: replyData, error: null };
//   } catch (error) {
//     console.error(`Error sending private reply:`, error);
//     return { success: false, error: String(error) };
//   }
// }

// /**
//  * Send a direct message to a user by username
//  */
// async function sendDirectMessageByUsername(
//   igBusinessId: string,
//   username: string,
//   message: string,
//   accessToken: string,
// ) {
//   try {
//     console.log(`Attempting to send DM to ${username}`);

//     // Using Instagram Graph API endpoint for direct messages
//     const dmResponse = await fetch(
//       `https://graph.instagram.com/${IG_API_VERSION}/${igBusinessId}/messages`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           recipient_username: username,
//           message: {
//             text: message,
//           },
//           access_token: accessToken,
//         }),
//       },
//     );

//     if (!dmResponse.ok) {
//       const errorText = await dmResponse.text();
//       console.error(
//         `Failed to send direct message to ${username}: ${errorText}`,
//       );
//       return { success: false, error: errorText };
//     }

//     const dmData = await dmResponse.json();
//     console.log(`Successfully sent DM to ${username}`);
//     return { success: true, data: dmData, error: null };
//   } catch (error) {
//     console.error(`Error sending direct message to ${username}:`, error);
//     return { success: false, error: String(error) };
//   }
// }

// /**
//  * Process a live comment with the given DM automation configuration
//  */
// async function processLiveComment(
//   userId: string,
//   dmConfig: any,
//   mediaId: string,
//   commentId: string,
//   commentText: string,
//   username: string,
//   igBusinessId: string,
//   accessToken: string,
// ) {
//   try {
//     // Check if this comment has already been processed
//     const existingComment = await prismadb.instagramCommentHistory.findFirst({
//       where: {
//         dmAutomationId: dmConfig.id,
//         commentId: commentId,
//       },
//     });

//     if (existingComment) {
//       console.log(`Comment ${commentId} has already been processed`);
//       return;
//     }

//     // Parse DM rules
//     let keywordRules = [];
//     try {
//       keywordRules = dmConfig.dmRules
//         ? JSON.parse(dmConfig.dmRules.toString())
//         : [];
//     } catch (parseError) {
//       console.error(
//         `Error parsing DM rules for config ${dmConfig.id}:`,
//         parseError,
//       );
//       keywordRules = [];
//     }

//     // Find matching rules - support both "keyword" and "triggerKeyword" properties
//     // to maintain compatibility with both formats
//     const commentTextLower = commentText.toLowerCase();
//     const matchingRules = keywordRules.filter((rule: any) => {
//       if (!rule) return false;

//       // Support both "keyword" (old) and "triggerKeyword" (new) properties
//       const keyword = (rule.keyword || rule.triggerKeyword || "").toLowerCase();
//       if (!keyword) return false;

//       return commentTextLower.includes(keyword);
//     });

//     if (matchingRules.length > 0) {
//       console.log(
//         `Live comment ${commentId} matches ${matchingRules.length} rules`,
//       );

//       // Send private reply for each matching rule
//       for (const rule of matchingRules) {
//         try {
//           if (!rule.message) {
//             console.log(
//               `Skipping rule with no message for comment ${commentId}`,
//             );
//             continue;
//           }

//           // For live comments, we need to send a direct message to the username
//           const dmResult = await sendDirectMessageByUsername(
//             igBusinessId,
//             username,
//             rule.message,
//             accessToken,
//           );

//           if (!dmResult.success) {
//             console.error(
//               `Failed to send DM to ${username}: ${dmResult.error}`,
//             );

//             // Create history record with error
//             await prismadb.instagramCommentHistory.create({
//               data: {
//                 dmAutomationId: dmConfig.id,
//                 userId: userId,
//                 postId: mediaId,
//                 commentId: commentId,
//                 commentText: commentText,
//                 commenterName: username,
//                 responseType: "direct_message",
//                 responseStatus: "failed",
//                 errorMessage: String(dmResult.error).substring(0, 255),
//                 processed: true,
//                 matchedRules: true,
//               },
//             });

//             continue;
//           }

//           // Get the keyword used (for logging purposes)
//           const keywordUsed = rule.keyword || rule.triggerKeyword;
//           console.log(
//             `Successfully sent DM to ${username} for rule "${keywordUsed}"`,
//           );

//           // Create successful history record
//           await prismadb.instagramCommentHistory.create({
//             data: {
//               dmAutomationId: dmConfig.id,
//               userId: userId,
//               postId: mediaId,
//               commentId: commentId,
//               commentText: commentText,
//               commenterName: username,
//               responseType: "direct_message",
//               responseText: rule.message,
//               responseStatus: "sent",
//               processed: true,
//               matchedRules: true,
//               respondedAt: new Date(),
//             },
//           });
//         } catch (ruleError) {
//           const keyword = rule?.keyword || rule?.triggerKeyword;
//           console.error(
//             `Error processing rule "${keyword}" for comment ${commentId}:`,
//             ruleError,
//           );
//         }
//       }
//     } else {
//       // No matching rules, just mark as processed
//       await prismadb.instagramCommentHistory.create({
//         data: {
//           dmAutomationId: dmConfig.id,
//           userId: userId,
//           postId: mediaId,
//           commentId: commentId,
//           commentText: commentText,
//           commenterName: username,
//           processed: true,
//           matchedRules: false,
//         },
//       });
//     }
//   } catch (error) {
//     console.error(
//       `Error processing live comment with config ${dmConfig.id}:`,
//       error,
//     );
//   }
// }
