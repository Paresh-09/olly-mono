import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const INDEX_BUDDY_ENDPOINT = 'https://index-buddy-production.up.railway.app/indexWebsite';

// List of websites to index
const websites = [
  'explainx.ai',
  'snapy.ai',
  'olly.social',
  'bgremover.video',
  'bgblur.com',
  'removebackground.pics',
  'goyashy.com',
  'egspect.com',
];

async function submitWebsiteForIndexing(url: string): Promise<void> {
  try {
    await fetch(INDEX_BUDDY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
  } catch (error) {
    console.error(`Error submitting ${url} for indexing:`, error);
  }
}

async function sendDiscordNotification(content: string, statusUpdate?: boolean) {
  const webhookURL = statusUpdate ? process.env.INDEX_WEBSITE_DISCORD_WEBHOOK_URL : process.env.INDEX_WEBSITE_DISCORD_WEBHOOK_URL;

  if (!webhookURL) {
    console.error('Webhook URL is not defined.');
    throw new Error('Webhook URL is not defined.');
  }

  const finalContent = `${content}`;

  try {
    const response = await axios.post(webhookURL, {
      content: finalContent
    });
    return response;
  } catch (error) {
    console.error('Error sending Discord notification:', error);
    throw error;
  }
}


export async function GET(req: NextRequest) {
  try {
    const isCronAuthorized = req.headers.get('Authorization') === `Bearer ${process.env.CRON_SECRET}`;

    if (!isCronAuthorized) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Make initial call to wake up the server
    await submitWebsiteForIndexing('upskills.io');

    // Wait for 10 seconds
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Submit all websites for indexing
    websites.forEach(submitWebsiteForIndexing);

    const message = `Website indexing process initiated for: ${websites.join(', ')}`;

    if (process.env.INDEX_WEBSITE_DISCORD_WEBHOOK_URL) {
      await sendDiscordNotification(message, true);
    }

    // Create a new response with the data
    const response = NextResponse.json({
      message: 'Website indexing process initiated',
      websites
    }, { status: 200 });

    // Set cache control headers
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('Error initiating website indexing:', error);
    const errorMessage = 'Failed to initiate website indexing';
    
    if (process.env.INDEX_WEBSITE_DISCORD_WEBHOOK_URL) {
      await sendDiscordNotification(errorMessage, false);
    }

    // Create error response with cache control headers
    const errorResponse = NextResponse.json({ error: errorMessage }, { status: 500 });
    errorResponse.headers.set('Cache-Control', 'no-store, max-age=0');
    errorResponse.headers.set('Pragma', 'no-cache');
    errorResponse.headers.set('Expires', '0');

    return errorResponse;
  }
}