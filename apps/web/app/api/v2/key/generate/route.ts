// app/api/api-keys/route.ts
import { NextResponse } from 'next/server';
import prismadb from "@/lib/prismadb";
import { validateRequest } from "@/lib/auth";
import { generateApiKey } from "@/lib/utils";

export async function POST() {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check how many API keys the user already has
    const userApiKeys = await prismadb.userApiKey.findMany({
      where: {
        userId: user.id,
      },
    });

    // If user already has 5 API keys, return an error
    if (userApiKeys.length >= 5) {
      return NextResponse.json({ 
        error: "You have reached the maximum limit of 5 API keys. Please delete an existing key before creating a new one." 
      }, { status: 400 });
    }

    const newApiKey = generateApiKey();
    const createdApiKey = await prismadb.apiKey.create({
      data: {
        key: newApiKey,
        users: {
          create: {
            userId: user.id
          }
        }
      }
    });

    return NextResponse.json({ apiKey: createdApiKey });
  } catch (error) {
    console.error("Error generating new API key:", error);
    return NextResponse.json({ error: "Failed to generate new API key" }, { status: 500 });
  }
}