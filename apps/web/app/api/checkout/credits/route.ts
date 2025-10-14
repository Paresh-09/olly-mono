import { NextResponse } from "next/server";
import axios from 'axios';
import { validateRequest } from "@/lib/auth";

export async function POST(req: Request) {
  const { user } = await validateRequest();
  try {
    const body = await req.json();
    const { customPrice, productOptions, checkoutData } = body;

    const credits = checkoutData?.custom?.credits;

    const LEMON_SQUEEZY_API_KEY = process.env.LEMON_SQUEEZY_API_KEY;
    const STORE_ID = process.env.LEMON_STORE_ID;
    const CREDIT_PRODUCT_ID = process.env.LEMON_SQ_CREDIT_VARIANT_ID;

    if (!LEMON_SQUEEZY_API_KEY || !STORE_ID || !CREDIT_PRODUCT_ID) {
      return new NextResponse(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
    }

    // Prepare checkout data with credit information
    const preparedCheckoutData = {
      ...checkoutData,
      custom: {
        ...checkoutData.custom,
        credits: credits != null ? credits.toString() : '0',
        is_credit_purchase: "true"
      },
      // Include email if user exists and has an email, otherwise use email from checkoutData if available
      email: user?.email || checkoutData?.email || ""
    };

    const response = await axios.post(
      'https://api.lemonsqueezy.com/v1/checkouts',
      {
        data: {
          type: 'checkouts',
          attributes: {
            custom_price: customPrice,
            product_options: {
              ...productOptions,
              enabled_variants: [CREDIT_PRODUCT_ID]
            },
            checkout_data: preparedCheckoutData,
            checkout_options: {
              embed: false,
              media: true,
              logo: true,
              desc: true,
              discount: true,
              subscription_preview: true
            },
            expires_at: null, // or set a specific expiration date
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
                id: CREDIT_PRODUCT_ID,
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