import prismadb from '@/lib/prismadb';
import { decrypt } from '@/lib/encryption';

// API versions
const IG_API_VERSION = 'v22.0';  // Instagram Graph API version

/**
 * Process a comment webhook and send private replies if needed
 */
export async function processCommentWebhook(
  instagramId: string, 
  commentData: any
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`Processing comment webhook`);
    
    // Extract comment details
    const commentId = commentData.comment_id;
    const postId = commentData.media_id;
    const commentText = commentData.text;
    const username = commentData.username;
    
    if (!commentId || !postId) {
      console.error('Missing required comment data');
      return { success: false, error: 'Missing required comment data' };
    }
    
   
    
    // 1. Look up the user associated with this Instagram account
    const oauthToken = await prismadb.oAuthToken.findFirst({
      where: {
        platform: 'INSTAGRAM',
        isValid: true,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    });
    
    if (!oauthToken) {
      console.warn(`No valid OAuth token found for Instagram ID ${instagramId}`);
      return { success: false, error: 'No valid OAuth token found' };
    }
    
    // 2. Check if they have automation rules configured for this post
    const automationConfig = await prismadb.instagramDMAutomation.findFirst({
      where: {
        userId: oauthToken.userId,
        postId: postId,
        isEnabled: true
      }
    });
    
    if (!automationConfig) {
      console.log(`No active automation config found for post`);
      
      // Still record the comment in history
      await prismadb.instagramCommentHistory.create({
        data: {
          userId: oauthToken.userId,
          postId: postId,
          commentId: commentId,
          commentText: commentText,
          commenterName: username,
          processed: true,
          matchedRules: false
        }
      });
      
      return { success: true };
    }
    
    // Check if this comment has already been processed
    const existingHistory = await prismadb.instagramCommentHistory.findFirst({
      where: {
        userId: oauthToken.userId,
        postId: postId,
        commentId: commentId
      }
    });
    
    if (existingHistory) {
      console.log(`Comment ${commentId} has already been processed`);
      return { success: true };
    }
    
    // 3. Process the comment according to automation rules
    let dmRules = [];
    try {
      dmRules = automationConfig.dmRules ? JSON.parse(automationConfig.dmRules.toString()) : [];
    } catch (parseError) {
      console.error(`Error parsing DM rules:`, parseError);
      dmRules = [];
    }
    
    // Find matching rules
    const matchingRules = dmRules.filter((rule: any) => {
      if (!rule || !rule.triggerKeyword) return false;
      const keyword = rule.triggerKeyword.toLowerCase();
      return commentText.toLowerCase().includes(keyword);
    });
    
    if (matchingRules.length === 0) {
      // No matching rules, just record the comment
      await prismadb.instagramCommentHistory.create({
        data: {
          userId: oauthToken.userId,
          postId: postId,
          commentId: commentId,
          commentText: commentText,
          commenterName: username,
          dmAutomationId: automationConfig.id,
          processed: true,
          matchedRules: false
        }
      });
      
      console.log(`No matching rules for comment ${commentId}`);
      return { success: true };
    }
    
    console.log(`Found ${matchingRules.length} matching rules for comment ${commentId}`);
    
    // Get the access token
    let accessToken: string;
    try {
      accessToken = decrypt(oauthToken.accessToken);
    } catch (error) {
      console.error(`Failed to decrypt access token:`, error);
      return { success: false, error: 'Failed to decrypt access token' };
    }
    
    // Process each matching rule
    for (const rule of matchingRules) {
      if (!rule.message) {
        console.log(`Rule has no message, skipping`);
        continue;
      }
      
      // Format the message (replace placeholders)
      let message = rule.message;
      message = message.replace('{name}', username || 'there');
      
      // Send the private reply
      const replyResult = await sendPrivateReply(
        instagramId,
        commentId,
        message,
        accessToken
      );
      
      if (!replyResult.success) {
        // Record the failure
        await prismadb.instagramCommentHistory.create({
          data: {
            userId: oauthToken.userId,
            postId: postId,
            commentId: commentId,
            commentText: commentText,
            commenterName: username,
            dmAutomationId: automationConfig.id,
            responseType: 'private_reply',
            responseStatus: 'failed',
            errorMessage: String(replyResult.error).substring(0, 255),
            processed: true,
            matchedRules: true
          }
        });
        
        console.error(`Failed to send private reply: ${replyResult.error}`);
        return { success: false, error: replyResult.error };
      }
      
      // Record the successful reply
      await prismadb.instagramCommentHistory.create({
        data: {
          userId: oauthToken.userId,
          postId: postId,
          commentId: commentId,
          commentText: commentText,
          commenterName: username,
          dmAutomationId: automationConfig.id,
          responseType: 'private_reply',
          responseText: message,
          responseStatus: 'sent',
          processed: true,
          matchedRules: true,
          respondedAt: new Date()
        }
      });
      
      console.log(`Successfully sent private reply to ${username}`);
      return { success: true };
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error processing comment webhook:`, error);
    return { success: false, error: String(error) };
  }
}

/**
 * Process a live comment webhook
 */
export async function processLiveCommentWebhook(
  instagramId: string, 
  commentData: any
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`Processing live comment webhook for Instagram ID ${instagramId}`);
    
    // Live comments need immediate processing as they can only be replied to during the broadcast
    // The implementation is similar to regular comments but with higher priority
    
    return await processCommentWebhook(instagramId, commentData);
  } catch (error) {
    console.error(`Error processing live comment webhook:`, error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send a private reply to a comment
 */
export async function sendPrivateReply(
  igBusinessId: string, 
  commentId: string, 
  message: string, 
  accessToken: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Check if the comment is within the 7-day window for private replies
    const isWithinReplyWindow = await checkCommentReplyEligibility(commentId, accessToken);
    if (!isWithinReplyWindow) {
      console.warn(`Comment ${commentId} is outside the 7-day window for private replies`);
      return { success: false, error: 'Comment is outside the 7-day window for private replies' };
    }
    
    // Using Instagram Graph API endpoint for private replies
    const replyResponse = await fetch(
      `https://graph.instagram.com/${IG_API_VERSION}/${igBusinessId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient: { 
            comment_id: commentId 
          },
          message: { 
            text: message 
          },
          access_token: accessToken
        })
      }
    );
    
    if (!replyResponse.ok) {
      const errorText = await replyResponse.text();
      console.error(`Failed to send private reply: ${errorText}`);
      return { success: false, error: errorText };
    }
    
    const replyData = await replyResponse.json();
    console.log(`Successfully sent private reply to comment ${commentId}`, replyData);
    return { success: true, data: replyData };
  } catch (error) {
    console.error(`Error sending private reply:`, error);
    return { success: false, error: String(error) };
  }
}

/**
 * Check if a comment is eligible for a private reply (within 7-day window)
 * For live comments, this is only valid during the live broadcast
 */
export async function checkCommentReplyEligibility(
  commentId: string, 
  accessToken: string
): Promise<boolean> {
  try {
    // Fetch the comment to get its timestamp
    const response = await fetch(
      `https://graph.instagram.com/${IG_API_VERSION}/${commentId}?fields=timestamp&access_token=${accessToken}`
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch comment details: ${errorText}`);
      return false;
    }
    
    const commentData = await response.json();
    
    // If there's no timestamp, we can't determine eligibility
    if (!commentData.timestamp) {
      console.warn(`No timestamp found for comment ${commentId}`);
      return false;
    }
    
    // Calculate if the comment is within the 7-day window
    const commentDate = new Date(commentData.timestamp);
    const now = new Date();
    const daysDifference = (now.getTime() - commentDate.getTime()) / (1000 * 60 * 60 * 24);
    
    return daysDifference <= 7;
  } catch (error) {
    console.error(`Error checking comment eligibility:`, error);
    return false;
  }
} 