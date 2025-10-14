/**
 * Helper functions for Instagram webhooks
 */
import crypto from 'crypto';

/**
 * Subscribe an Instagram user to webhook notifications
 * 
 * @param instagramAccountId - The Instagram account ID to subscribe
 * @param accessToken - The Instagram user access token
 * @param fields - The webhook fields to subscribe to (e.g., 'comments,mentions,messages')
 * @returns A promise that resolves to the subscription result
 */
export async function subscribeToInstagramWebhooks(
  instagramAccountId: string,
  accessToken: string,
  fields: string[] = ['comments', 'mentions', 'messages']
): Promise<{ success: boolean; error?: string }> {
  try {
    
    
    const response = await fetch(
      `https://graph.instagram.com/v22.0/${instagramAccountId}/subscribed_apps`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscribed_fields: fields.join(','),
          access_token: accessToken,
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to subscribe to webhooks: ${errorText}`);
      return { success: false, error: errorText };
    }
    
    const data = await response.json();
    console.log(`Successfully subscribed to webhooks:`);
    
    return { success: true };
  } catch (error) {
    console.error('Error subscribing to webhooks:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get the current webhook subscriptions for an Instagram user
 * 
 * @param instagramAccountId - The Instagram account ID to check
 * @param accessToken - The Instagram user access token
 * @returns A promise that resolves to the list of subscribed fields
 */
export async function getInstagramWebhookSubscriptions(
  instagramAccountId: string,
  accessToken: string
): Promise<{ success: boolean; fields?: string[]; error?: string }> {
  try {
    console.log(`Getting webhook subscriptions for Instagram account`);
    
    const response = await fetch(
      `https://graph.instagram.com/v22.0/${instagramAccountId}/subscribed_apps?access_token=${accessToken}`
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to get webhook subscriptions: ${errorText}`);
      return { success: false, error: errorText };
    }
    
    const data = await response.json();
    console.log(`Current webhook subscriptions:`);
    
    // Extract the subscribed fields from the response
    const fields = data.data?.[0]?.subscribed_fields || [];
    
    return { success: true, fields };
  } catch (error) {
    console.error('Error getting webhook subscriptions:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Verify the signature of an Instagram webhook request
 * 
 * @param rawBody - The raw request body as a string
 * @param signature - The signature from the x-hub-signature-256 header
 * @param appSecret - The Instagram app secret
 * @returns Whether the signature is valid
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null | undefined,
  appSecret: string
): boolean {
  if (!signature || !appSecret) {
    console.warn('Missing signature or app secret for webhook verification');
    return false;
  }

  try {
    // The signature header is in the format "sha256=SIGNATURE"
    const signatureParts = signature.split('=');
    if (signatureParts.length !== 2 || signatureParts[0] !== 'sha256') {
      console.warn('Invalid signature format');
      return false;
    }

    const receivedSignature = signatureParts[1];
    
    // Calculate the expected signature
    const expectedSignature = crypto
      .createHmac('sha256', appSecret)
      .update(rawBody)
      .digest('hex');
    
    // Compare the signatures
    const isValid = crypto.timingSafeEqual(
      Buffer.from(receivedSignature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
    
    if (!isValid) {
      console.warn('Webhook signature verification failed');
    }
    
    return isValid;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
} 