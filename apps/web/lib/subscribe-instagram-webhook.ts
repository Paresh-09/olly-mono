/**
 * Script to subscribe an Instagram user to webhook notifications
 * 
 * Usage:
 * ts-node scripts/subscribe-instagram-webhook.ts <instagram_account_id> <access_token>
 */
import { subscribeToInstagramWebhooks, getInstagramWebhookSubscriptions } from '../lib/instagram/webhook-helpers';

async function main() {
  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: ts-node scripts/subscribe-instagram-webhook.ts <instagram_account_id> <access_token>');
    process.exit(1);
  }
  
  const instagramAccountId = args[0];
  const accessToken = args[1];
  const fields = args[2] ? args[2].split(',') : ['comments', 'mentions', 'messages'];
  
  
  try {
    // First, check current subscriptions
    const currentSubscriptions = await getInstagramWebhookSubscriptions(
      instagramAccountId,
      accessToken
    );
    
   
    
    // Subscribe to webhooks
    const result = await subscribeToInstagramWebhooks(
      instagramAccountId,
      accessToken,
      fields
    );
    
    if (result.success) {
      console.log('Successfully subscribed to webhooks!');
      
      // Verify the subscriptions were applied
      const updatedSubscriptions = await getInstagramWebhookSubscriptions(
        instagramAccountId,
        accessToken
      );
      
     
    } else {
      console.error('Failed to subscribe to webhooks:', result.error);
    }
  } catch (error) {
    console.error('Error in subscription process:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error); 