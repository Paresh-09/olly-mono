import { NextResponse } from "next/server";
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customPrice, productOptions, checkoutData } = body;

    const LEMON_SQUEEZY_API_KEY = process.env.LEMON_SQUEEZY_API_KEY;
    const STORE_ID = process.env.LEMON_STORE_ID;
    const LIFETIME_PRODUCT_ID = process.env.LEMON_SQ_LIFETIME_VARIANT_ID;

    if (!LEMON_SQUEEZY_API_KEY || !STORE_ID || !LIFETIME_PRODUCT_ID) {
      return new NextResponse(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
    }

    const users = parseInt(checkoutData.custom.users);
    const lifetimeCredits = parseInt(checkoutData.custom.lifetime_credits);

    // Determine base price based on number of users
    let basePrice;
    if (users === 1) basePrice = 100;
    else if (users <= 5) basePrice = 200;
    else if (users <= 10) basePrice = 500;
    else basePrice = 1000;

    // Prepare detailed checkout data
    const preparedCheckoutData = {
      custom: {
        plan_type: 'lifetime',
        users: users.toString(),
        lifetime_credits: lifetimeCredits.toString(),
        base_plan_price: basePrice.toString(),
        credit_price: checkoutData.custom.credit_price.toString(), // Convert to string
        total_price: customPrice.toString(),
        checkout_timestamp: new Date().toISOString(),
      }
    };

    const productName = `Olly AI 2.0 - Lifetime Access + ${lifetimeCredits} Credits`;
    const productDescription = `
• ${users} Active License${users > 1 ? 's' : ''}
• ${lifetimeCredits} LLM credits (lifetime)
• Lifetime access, support & priority assistance
• Access to all AI-powered tools: comment generation, virality scoring & similar post suggestions, AI Personalities & more
• Content summarization & 12+ languages supported
• Full access to local AI LLMs: Llama 3/3.1, Gemma 2, and Paid Models like GPT-4, Claude 3.5, Gemini 1.5 & more
• Cross-platform: LinkedIn, Twitter, Instagram, Reddit, YouTube & others
    `.trim();

    const response = await axios.post(
      'https://api.lemonsqueezy.com/v1/checkouts',
      {
        data: {
          type: 'checkouts',
          attributes: {
            custom_price: customPrice,
            product_options: {
              name: productName,
              description: productDescription,
              enabled_variants: [LIFETIME_PRODUCT_ID]
            },
            checkout_data: preparedCheckoutData,
            checkout_options: {
              embed: false,
              media: true,
              logo: true,
              desc: true,
              discount: true,
            },
            expires_at: null,
            preview: false
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: STORE_ID,
              },
            },
            variant: {
              data: {
                type: 'variants',
                id: LIFETIME_PRODUCT_ID,
              },
            },
          },
        },
      },
      {
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
          'Authorization': `Bearer ${LEMON_SQUEEZY_API_KEY}`,
        },
      }
    );

    if (!response.data.data.attributes.url) {
      console.error('Lemon Squeezy API Response:', response.data);
      return new NextResponse(JSON.stringify({ error: 'Invalid checkout URL received' }), { status: 500 });
    }

    const checkoutUrl = response.data.data.attributes.url;
    const previewData = response.data.data.attributes.preview;

    return new NextResponse(JSON.stringify({ checkoutUrl, previewData }), { status: 200 });
  } catch (error: any) {
    console.error('Lemon Squeezy API Error:', error.response ? error.response.data : error.message);
    return new NextResponse(JSON.stringify({ error: 'Error creating checkout', details: error.response?.data || error.message }), { status: 500 });
  }
}