import { NextResponse } from 'next/server'
import prismadb from '@/lib/prismadb'
import { decrypt, encrypt } from '@/lib/encryption'

/**
 * Instagram API Integration
 * 
 * This implementation handles comment moderation and private reply automation using:
 * 
 * graph.instagram.com - For Instagram Graph API operations (v22.0)
 *   - Token validation
 *   - User profile information
 *   - Comment operations
 *   - Private reply features
 */

// API versions
const IG_API_VERSION = 'v22.0'  // Instagram Graph API version

// Function to mark a token as invalid
async function markTokenAsInvalid(tokenId: string) {
  try {
    await prismadb.oAuthToken.update({
      where: { id: tokenId },
      data: { isValid: false }
    })
  } catch (error) {
    console.error(`Failed to mark token ${tokenId} as invalid:`, error)
  }
}

// Function to refresh a long-lived token before expiration
async function refreshToken(accessToken: string, tokenId: string, userId: string): Promise<string | null> {
  try {
  
    
    // Instagram tokens can be refreshed within 60 days
    const refreshUrl = `https://graph.instagram.com/${IG_API_VERSION}/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`;
    
    const refreshResponse = await fetch(refreshUrl);
    
    if (!refreshResponse.ok) {
      const errorText = await refreshResponse.text();
      console.error(`Token refresh failed for ${tokenId}:`, errorText);
      return null;
    }
    
    const refreshData = await refreshResponse.json();
    
    if (!refreshData.access_token || !refreshData.expires_in) {
      console.error(`Invalid refresh response for token ${tokenId}:`, refreshData);
      return null;
    }
    
    const newAccessToken = refreshData.access_token;
    const expiresIn = refreshData.expires_in; // Typically 5184000 seconds (60 days)
    
    // Update token in database
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
    
    await prismadb.oAuthToken.update({
      where: { id: tokenId },
      data: {
        accessToken: encrypt(newAccessToken),
        expiresAt,
        isValid: true
      }
    });
    
    console.log(`Token refreshed successfully}`);
    return newAccessToken;
  } catch (error) {
    console.error(`Error refreshing token ${tokenId}:`, error);
    return null;
  }
}

// Function to validate an Instagram token
async function validateToken(accessToken: string, tokenId: string): Promise<boolean> {
  try {
    if (!accessToken || typeof accessToken !== 'string' || accessToken.trim() === '') {
      console.error(`Token ${tokenId} is empty or malformed`)
      await markTokenAsInvalid(tokenId)
      return false
    }

    console.log(`Validating token`)
    
    // Test the token with a basic API call
    const response = await fetch(
      `https://graph.instagram.com/${IG_API_VERSION}/me?fields=id,username&access_token=${accessToken}`
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Token validation failed : ${errorText}`)
      
      if (
        errorText.includes('Invalid OAuth access token') || 
        errorText.includes('Cannot parse access token') ||
        errorText.includes('Session has expired')
      ) {
        await markTokenAsInvalid(tokenId)
      }
      
      return false
    }
    
    console.log(`Token validated successfully`)
    return true
  } catch (error) {
    console.error(`Error validating token ${tokenId}:`, error)
    await markTokenAsInvalid(tokenId)
    return false
  }
}

// Get Instagram Business ID from user access token
async function getInstagramBusinessInfo(accessToken: string): Promise<{
  igBusinessId: string | null;
  pageAccessToken: string | null;
}> {
  try {
    // Use Instagram Graph API directly to get user info
    const userResponse = await fetch(
      `https://graph.instagram.com/${IG_API_VERSION}/me?fields=id,username,account_type&access_token=${accessToken}`
    )
    
    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error(`Failed to fetch Instagram user info: ${errorText}`)
      return { igBusinessId: null, pageAccessToken: null }
    }
    
    const userData = await userResponse.json()
    
    if (!userData.id) {
      console.error('No Instagram user ID found')
      return { igBusinessId: null, pageAccessToken: null }
    }
    
    // Use the user's ID directly as the business ID
    const igBusinessId = userData.id
    
    // Use the same access token for operations
    const pageAccessToken = accessToken
    
    
    return { igBusinessId, pageAccessToken }
  } catch (error) {
    console.error('Error getting Instagram user info:', error)
    return { igBusinessId: null, pageAccessToken: null }
  }
}

// Get comments for a specific post
async function getCommentsForPost(postId: string, accessToken: string) {
  try {
    console.log(`Fetching comments for post ${postId}...`)
    
    // Using Instagram Graph API for comment moderation with expanded fields
    const commentsResponse = await fetch(
      `https://graph.instagram.com/${IG_API_VERSION}/${postId}/comments?fields=id,text,timestamp&access_token=${accessToken}`
    )
    
    if (!commentsResponse.ok) {
      const errorText = await commentsResponse.text()
      console.error(`Failed to fetch comments for post ${postId}: ${errorText}`)
      return { success: false, data: null, error: errorText }
    }
    
    const commentsData = await commentsResponse.json()
    
    // Log the comments after parsing the JSON
    console.log(`Comments response for post ${postId}:`, JSON.stringify(commentsData))
    
    return { success: true, data: commentsData.data || [], error: null }
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}:`, error)
    return { success: false, data: null, error: String(error) }
  }
}

// Send a private reply to a comment
async function sendPrivateReply(igBusinessId: string, commentId: string, message: string, accessToken: string) {
  try {
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
    )
    
    if (!replyResponse.ok) {
      const errorText = await replyResponse.text()
      console.error(`Failed to send private reply: ${errorText}`)
      return { success: false, error: errorText }
    }
    
    const replyData = await replyResponse.json()
    return { success: true, data: replyData, error: null }
  } catch (error) {
    console.error(`Error sending private reply:`, error)
    return { success: false, error: String(error) }
  }
}

// Verify that a post exists and is accessible
async function verifyPostExists(postId: string, accessToken: string) {
  try {
    console.log(`Verifying post ${postId} exists...`)
    
    // Try to fetch the post details
    const postResponse = await fetch(
      `https://graph.instagram.com/${IG_API_VERSION}/${postId}?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${accessToken}`
    )
    
    if (!postResponse.ok) {
      const errorText = await postResponse.text()
      console.error(`Failed to verify post ${postId}: ${errorText}`)
      return { exists: false, error: errorText }
    }
    
    const postData = await postResponse.json()
    console.log(`Post ${postId} details:`, JSON.stringify(postData))
    
    return { exists: true, data: postData }
  } catch (error) {
    console.error(`Error verifying post ${postId}:`, error)
    return { exists: false, error: String(error) }
  }
}

// Alternative method to get comments for a post
async function getCommentsAlternative(postId: string, accessToken: string) {
  try {
    console.log(`Trying alternative method to fetch comments for post ${postId}...`)
    
    // First get the media object
    const mediaResponse = await fetch(
      `https://graph.instagram.com/${IG_API_VERSION}/${postId}?fields=comments{id,text,username,timestamp}&access_token=${accessToken}`
    )
    
    if (!mediaResponse.ok) {
      const errorText = await mediaResponse.text()
      console.error(`Failed to fetch media with comments for post ${postId}: ${errorText}`)
      return { success: false, data: null, error: errorText }
    }
    
    const mediaData = await mediaResponse.json()
    console.log(`Media response with comments for post ${postId}:`, JSON.stringify(mediaData))
    
    // Extract comments from the media object
    const comments = mediaData.comments?.data || []
    
    return { success: true, data: comments, error: null }
  } catch (error) {
    console.error(`Error fetching comments (alternative) for post ${postId}:`, error)
    return { success: false, data: null, error: String(error) }
  }
}

// Process user's DM automation
async function processUserDMAutomation(userId: string, accessToken: string, tokenId: string) {
  console.log(`Processing DM automation for user ${userId}`)
  
  try {
    // Validate token
    const isTokenValid = await validateToken(accessToken, tokenId)
    if (!isTokenValid) {
      console.log(`Token for user ${userId} is invalid, skipping`)
      return
    }
    
    // Get Instagram user info
    const { igBusinessId } = await getInstagramBusinessInfo(accessToken)
    
    if (!igBusinessId) {
      console.error(`No Instagram user ID found for user ${userId}`)
      return
    }
    
    // Get active DM configurations
    const dmConfigs = await prismadb.instagramDMAutomation.findMany({
      where: {
        userId,
        isEnabled: true
      }
    })
    
    console.log(`Found ${dmConfigs.length} active DM configurations for user ${userId}`)
    
    if (dmConfigs.length === 0) {
      console.log(`No active DM configurations for user ${userId}, skipping`)
      return
    }
    
    // Process each configuration
    for (const config of dmConfigs) {
      try {
        console.log(`Processing configuration for post ${config.postId}`)
        
        // Verify post exists
        const postExists = await verifyPostExists(config.postId, accessToken)
        if (!postExists.exists) {
          console.error(`Post ${config.postId} does not exist or is inaccessible: ${postExists.error}`)
          continue
        }
        
        // Get comments for the post using primary method
        let commentsResult = await getCommentsForPost(config.postId, accessToken)
        
        // If primary method fails or returns no comments, try alternative method
        if (!commentsResult.success || !commentsResult.data || commentsResult.data.length === 0) {
          console.log(`Primary method returned no comments, trying alternative method...`)
          commentsResult = await getCommentsAlternative(config.postId, accessToken)
        }
        
        if (!commentsResult.success || !commentsResult.data) {
          console.error(`Failed to fetch comments for post ${config.postId} using both methods`)
          continue
        }
        
        const comments = commentsResult.data
        
        if (comments.length === 0) {
          console.log(`No comments found for post ${config.postId} using either method`)
          continue
        }
        
        console.log(`Found ${comments.length} comments for post ${config.postId}`)
        
        // Get processed comments for this configuration
        const processedComments = await prismadb.instagramCommentHistory.findMany({
          where: {
            dmAutomationId: config.id
          },
          select: {
            commentId: true
          }
        })
        
        const processedCommentIds = new Set(processedComments.map(pc => pc.commentId))
        console.log(`Already processed ${processedCommentIds.size} comments for this configuration`)
        
        // Filter comments that haven't been processed yet
        const newComments = comments.filter(
          (comment: any) => !processedCommentIds.has(comment.id)
        )
        
        console.log(`Found ${newComments.length} new comments to process`)
        
        // Process each new comment
        for (const comment of newComments) {
          try {
            if (!comment.text || !comment.username) {
              console.log(`Skipping comment ${comment.id} - missing text or username`)
              continue
            }
            
            const commentText = comment.text.toLowerCase()
            const username = comment.username
            
            // Parse DM rules
            let keywordRules = [];
            try {
              keywordRules = config.dmRules ? JSON.parse(config.dmRules.toString()) : [];
            } catch (parseError) {
              console.error(`Error parsing DM rules for config ${config.id}:`, parseError)
              keywordRules = [];
            }
            
            // Find matching rules
            const matchingRules = keywordRules.filter((rule: any) => {
              if (!rule || !rule.keyword) return false;
              const keyword = rule.keyword.toLowerCase()
              return commentText.includes(keyword)
            })
            
            if (matchingRules.length > 0) {
              console.log(`Comment ${comment.id} matches ${matchingRules.length} rules`)
              
              // Send private reply for each matching rule
              for (const rule of matchingRules) {
                try {
                  if (!rule.message) {
                    console.log(`Skipping rule with no message for comment ${comment.id}`)
                    continue
                  }
                  
                  // Send the private reply directly to the comment
                  const replyResult = await sendPrivateReply(
                    igBusinessId, 
                    comment.id, 
                    rule.message, 
                    accessToken
                  )
                  
                  if (!replyResult.success) {
                    console.error(`Failed to send private reply to ${username}: ${replyResult.error}`)
                    
                    // Create history record with error
                    await prismadb.instagramCommentHistory.create({
                      data: {
                        dmAutomationId: config.id,
                        userId: config.userId,
                        postId: config.postId,
                        commentId: comment.id,
                        commentText: comment.text,
                        commenterName: username,
                        responseType: 'private_reply',
                        responseStatus: 'failed',
                        errorMessage: String(replyResult.error).substring(0, 255),
                        processed: true,
                        matchedRules: true
                      }
                    })
                    
                    continue
                  }
                  
                  console.log(`Successfully sent private reply to ${username} for rule "${rule.keyword}"`)
                  
                  // Create successful history record
                  await prismadb.instagramCommentHistory.create({
                    data: {
                      dmAutomationId: config.id,
                      userId: config.userId,
                      postId: config.postId,
                      commentId: comment.id,
                      commentText: comment.text,
                      commenterName: username,
                      responseType: 'private_reply',
                      responseText: rule.message,
                      responseStatus: 'sent',
                      processed: true,
                      matchedRules: true,
                      respondedAt: new Date()
                    }
                  })
                } catch (ruleError) {
                  console.error(`Error processing rule "${rule?.keyword}" for comment ${comment.id}:`, ruleError)
                }
              }
            } else {
              // No matching rules, just mark as processed
              await prismadb.instagramCommentHistory.create({
                data: {
                  dmAutomationId: config.id,
                  userId: config.userId,
                  postId: config.postId,
                  commentId: comment.id,
                  commentText: comment.text,
                  commenterName: username,
                  processed: true,
                  matchedRules: false
                }
              })
            }
            
            console.log(`Marked comment ${comment.id} as processed`)
          } catch (commentError) {
            console.error(`Error processing comment ${comment?.id}:`, commentError)
            
            // Still try to mark as processed to avoid reprocessing
            try {
              const errorMessage = commentError instanceof Error 
                ? commentError.message.substring(0, 255) 
                : 'Unknown error';
                
              await prismadb.instagramCommentHistory.create({
                data: {
                  dmAutomationId: config.id,
                  userId: config.userId,
                  postId: config.postId,
                  commentId: comment?.id || 'unknown',
                  processed: true,
                  matchedRules: false,
                  errorMessage: errorMessage
                }
              })
            } catch (markError) {
              console.error(`Failed to mark comment as processed:`, markError)
            }
          }
        }
      } catch (configError) {
        console.error(`Error processing configuration ${config.id}:`, configError)
      }
    }
    
    console.log(`Completed DM automation processing for user ${userId}`)
  } catch (error) {
    console.error(`Error in processUserDMAutomation for user ${userId}:`, error)
  }
}

export async function GET() {
  console.log('Running Instagram DM automation cron job')
  
  try {
    // Get all users with valid Instagram tokens
    const tokens = await prismadb.oAuthToken.findMany({
      where: {
        platform: 'INSTAGRAM',
        isValid: true,
        expiresAt: {
          gt: new Date()
        }
      },
      select: {
        id: true,
        userId: true,
        accessToken: true,
        expiresAt: true
      }
    })
    
    console.log(`Found ${tokens.length} users with valid Instagram tokens`)
    
    // Process each user's DM automation
    for (const token of tokens) {
      try {
        // Safely decrypt the token
        let accessToken: string;
        try {
          accessToken = decrypt(token.accessToken);
          
          if (!accessToken || accessToken.trim() === '') {
            console.error(`Decrypted token for user ${token.userId} is empty or invalid`);
            await markTokenAsInvalid(token.id);
            continue;
          }
        } catch (decryptError) {
          console.error(`Failed to decrypt token for user ${token.userId}:`, decryptError);
          await markTokenAsInvalid(token.id);
          continue;
        }
        
        // Check if token is about to expire (within 7 days) and refresh it if needed
        const now = new Date();
        const sevenDaysFromNow = new Date(now);
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        
        if (token.expiresAt < sevenDaysFromNow) {
          console.log(`Token ${token.id} for user ${token.userId} is about to expire, refreshing...`);
          const newToken = await refreshToken(accessToken, token.id, token.userId);
          if (newToken) {
            accessToken = newToken;
          }
        }
        
        await processUserDMAutomation(token.userId, accessToken, token.id)
      } catch (userError) {
        console.error(`Error processing user ${token.userId}:`, userError);
        // Continue with next user even if one fails
      }
    }
    
    return NextResponse.json({ success: true, message: 'Instagram DM automation completed' })
  } catch (error) {
    console.error('Error running Instagram DM automation cron job:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to run Instagram DM automation' },
      { status: 500 }
    )
  }
}