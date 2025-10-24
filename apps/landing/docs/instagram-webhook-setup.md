# Instagram Webhook Setup Guide

This guide provides instructions for setting up and using Instagram webhooks in your application.

### Prerequisites

- An Instagram Business or Creator account
- A Meta Developer account with an app that has the Instagram Graph API enabled
- The necessary permissions: `instagram_basic`, `instagram_manage_comments`, and `instagram_manage_messages`

### Environment Variables

Set the following environment variables in your `.env` file:

```
INSTAGRAM_VERIFY_TOKEN=your_verification_token
INSTAGRAM_APP_SECRET=your_app_secret
```

- `INSTAGRAM_VERIFY_TOKEN`: A random string you create to verify webhook requests
- `INSTAGRAM_APP_SECRET`: The secret key for your Meta app

### Webhook URL

Your webhook URL will be:

```
https://your-domain.com/api/instagram/webhook
```

### Setting Up in Meta Developer Dashboard

1. Go to your app in the [Meta Developer Dashboard](https://developers.facebook.com/apps/)
2. Navigate to **Products** > **Webhooks** > **Add Product** > **Webhooks**
3. Click **Add Subscriptions** and select **Instagram**
4. Enter your webhook URL and verification token
5. Select the fields you want to subscribe to (e.g., `comments`, `mentions`, `messages`)
6. Click **Verify and Save**

### Testing Your Webhook

1. In the Meta Developer Dashboard, go to **Webhooks** > **Test** for your Instagram subscription
2. Select a field (e.g., `comments`) and click **Test**
3. Check your server logs to confirm the test webhook was received

### Helper Functions

We've created several helper functions to make working with Instagram webhooks easier:

#### Webhook Signature Verification

```typescript
import { verifyWebhookSignature } from '@/lib/instagram/webhook-helpers';

// In your webhook handler
const rawBody = await request.text();
const signature = request.headers.get('x-hub-signature-256');
const isValid = verifyWebhookSignature(rawBody, signature, INSTAGRAM_APP_SECRET);

if (!isValid) {
  return new NextResponse('Invalid signature', { status: 403 });
}
```

#### Subscribing Users to Webhooks

```typescript
import { subscribeToInstagramWebhooks } from '@/lib/instagram/webhook-helpers';

// Subscribe a user to webhook notifications
const result = await subscribeToInstagramWebhooks(
  instagramAccountId,
  accessToken,
  ['comments', 'mentions', 'messages']
);

if (result.success) {
  console.log('Successfully subscribed to webhooks!');
} else {
  console.error('Failed to subscribe to webhooks:', result.error);
}
```

#### Checking Current Subscriptions

```typescript
import { getInstagramWebhookSubscriptions } from '@/lib/instagram/webhook-helpers';

// Get current webhook subscriptions
const subscriptions = await getInstagramWebhookSubscriptions(
  instagramAccountId,
  accessToken
);

console.log('Current subscriptions:', subscriptions.fields);
```

### Subscription Script

We've included a script to help you subscribe users to webhooks:

```bash
# Run the subscription script
npx ts-node scripts/subscribe-instagram-webhook.ts <instagram_account_id> <access_token> [fields]
```

Where:
- `instagram_account_id` is the Instagram account ID
- `access_token` is a valid user access token
- `fields` (optional) is a comma-separated list of fields to subscribe to (default: comments,mentions,messages)

### Webhook Payload Examples

#### Comment Notification

```json
{
  "object": "instagram",
  "entry": [
    {
      "id": "17841405822304914",
      "time": 1517556522,
      "changes": [
        {
          "field": "comments",
          "value": {
            "media_id": "17853653581142490",
            "comment_id": "17877607772156102",
            "text": "This is a test comment",
            "username": "test_user"
          }
        }
      ]
    }
  ]
}
```

#### Message Notification

```json
{
  "object": "instagram",
  "entry": [
    {
      "id": "17841405822304914",
      "time": 1517556522,
      "changes": [
        {
          "field": "messages",
          "value": {
            "message_id": "17892372361145921",
            "sender_id": "17841562489237771",
            "text": "Hello, this is a test message"
          }
        }
      ]
    }
  ]
}
```

### Security Considerations

1. **Always verify webhook signatures** to ensure requests are coming from Instagram
2. Use HTTPS for your webhook endpoint
3. Keep your verification token and app secret secure
4. Implement rate limiting to prevent abuse

### Troubleshooting

- **Webhook verification fails**: Check that your verification token matches exactly
- **Not receiving webhooks**: Verify that you've subscribed to the correct fields
- **Signature validation fails**: Ensure you're using the correct app secret and raw request body

### Additional Resources

- [Instagram Graph API Documentation](https://developers.facebook.com/docs/instagram-api)
- [Webhooks Documentation](https://developers.facebook.com/docs/graph-api/webhooks)
- [Instagram API Error Codes](https://developers.facebook.com/docs/instagram-api/reference/error-codes) 