// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import { validateRequest } from '@/lib/auth';

const DEFAULT_VARIANT_ID = '480251';
const DEFAULT_REDIRECT_URL = 'https://www.olly.social/checkout/success';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      variantId = DEFAULT_VARIANT_ID,
      customPrice,
      productOptions,
      checkoutOptions,
      discountCode,
      catches, // Optional parameter for the game flow
    } = body;

    const LEMON_SQUEEZY_API_KEY = process.env.LEMON_SQUEEZY_API_KEY;
    const STORE_ID = process.env.LEMON_STORE_ID;

    if (!LEMON_SQUEEZY_API_KEY || !STORE_ID) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Try to get user email, but don't require it
    let userEmail;
    try {
      const { user } = await validateRequest();
      userEmail = user?.email;
    } catch (error) {
      // Continue without email if validation fails
      console.log('No authenticated user found, continuing without email');
    }

    // Handle game-specific discount code if catches is provided
    let finalDiscountCode = discountCode;
    if (typeof catches === 'number') {
      const discountMapping = {
        1: process.env.HOLIDAYS_DISCOUNT_XMAS_10,
        2: process.env.HOLIDAYS_DISCOUNT_XMAS_20,
        3: process.env.HOLIDAYS_DISCOUNT_XMAS_30,
        4: process.env.HOLIDAYS_DISCOUNT_XMAS_50,
        5: process.env.HOLIDAYS_DISCOUNT_XMAS_100,
      };
      finalDiscountCode = discountMapping[catches as keyof typeof discountMapping] || null;
    }

    // Create checkout_data as an object, only including fields with valid values
    const checkoutData = {
      ...(userEmail && { email: userEmail }),
      ...(finalDiscountCode && { discount_code: finalDiscountCode }),
      custom: {},
      variant_quantities: []
    };

    const response = await axios.post(
      'https://api.lemonsqueezy.com/v1/checkouts',
      {
        data: {
          type: 'checkouts',
          attributes: {
            custom_price: customPrice || null,
            product_options: {
              ...productOptions,
              redirect_url: productOptions?.redirect_url || DEFAULT_REDIRECT_URL,
            },
            checkout_options: checkoutOptions || {},
            checkout_data: checkoutData,
            preview: true
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: STORE_ID
              }
            },
            variant: {
              data: {
                type: 'variants',
                id: variantId
              }
            }
          }
        }
      },
      {
        headers: {
          Accept: 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
          Authorization: `Bearer ${LEMON_SQUEEZY_API_KEY}`,
        },
      }
    );

    const checkoutUrl = response.data.data.attributes.url;
    return NextResponse.json({ checkoutUrl }, { status: 200 });
  } catch (error: any) {
    console.error(
      'Lemon Squeezy API Error:',
      error.response ? error.response.data : error.message
    );
    return NextResponse.json(
      { 
        error: 'Error creating checkout',
        details: error.response?.data || error.message
      }, 
      { status: 500 }
    );
  }
}