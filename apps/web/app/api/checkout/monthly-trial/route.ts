// app/api/checkout/monthly-trial/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import { validateRequest } from "@/lib/auth";

const DEFAULT_REDIRECT_URL = "https://www.olly.social/checkout/success";
const MONTHLY_VARIANT_IDS = {
  1: process.env.MONTHLY_VARIANT_ID_1, // 1 user monthly
  5: process.env.MONTHLY_VARIANT_ID_5, // 5 users monthly
  10: process.env.MONTHLY_VARIANT_ID_10, // 10 users monthly
  20: process.env.MONTHLY_VARIANT_ID_20, // 20 users monthly
};


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userCount, redirectUrl } = body;
    // Get variant ID from server-side mapping
    const variantId =
      MONTHLY_VARIANT_IDS[userCount as keyof typeof MONTHLY_VARIANT_IDS];

    // Validate required parameters
    if (!variantId) {
      return NextResponse.json(
        { error: "variantId is required" },
        { status: 400 },
      );
    }

    const LEMON_SQUEEZY_API_KEY = process.env.LEMON_SQUEEZY_API_KEY;
    const STORE_ID = process.env.LEMON_STORE_ID;

 

    if (!LEMON_SQUEEZY_API_KEY || !STORE_ID) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    // Try to get user email for prefilling checkout
    let userEmail;
    try {
      const { user } = await validateRequest();
      userEmail = user?.email;
    } catch (error) {
      console.log("No authenticated user found, continuing without email");
    }

    // Create checkout data
    const checkoutData = {
      ...(userEmail && { email: userEmail }),
      custom: {},
      variant_quantities: [],
    };

    // Ensure variantId and STORE_ID are strings
    const payload = {
      data: {
        type: "checkouts",
        attributes: {
          product_options: {
            redirect_url: redirectUrl ? redirectUrl : DEFAULT_REDIRECT_URL,
          },
          checkout_options: {
            embed: false,
            media: true,
            logo: true,
            desc: true,
            discount: true,
            skip_trial: false,
          },
          checkout_data: checkoutData,
          preview: false, // Set to false for actual purchases
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: String(STORE_ID), // Ensure it's a string
            },
          },
          variant: {
            data: {
              type: "variants",
              id: String(variantId), // Ensure it's a string
            },
          },
        },
      },
    };



    const response = await axios.post(
      "https://api.lemonsqueezy.com/v1/checkouts",
      payload,
      {
        headers: {
          Accept: "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
          Authorization: `Bearer ${LEMON_SQUEEZY_API_KEY}`,
        },
      },
    );

    const checkoutUrl = response.data.data.attributes.url;

    return NextResponse.json({ checkoutUrl }, { status: 200 });
  } catch (error: any) {
    console.error("Full error object:", error);
    console.error(
      "Lemon Squeezy API Error:",
      error.response ? error.response.data : error.message,
    );

    return NextResponse.json(
      {
        error: "Error creating checkout",
        details: error.response?.data || error.message,
      },
      { status: 500 },
    );
  }
}
