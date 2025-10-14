// app/api/apikeys/[apikeyid]/custom-knowledge/route.ts

import prismadb from '@/lib/prismadb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  try {
    const customKnowledge = await prismadb.apiKeyCustomKnowledge.findUnique({
      where: { apiKeyId: id },
    });

    if (!customKnowledge) {
      return NextResponse.json({ error: 'Custom knowledge not found' }, { status: 404 });
    }

    return NextResponse.json(customKnowledge);
  } catch (error) {
    console.error('Error fetching custom knowledge:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const data = await request.json();

  try {
    // First, check if the API key exists
    const existingApiKey = await prismadb.apiKey.findUnique({
      where: { id: id },
    });

    if (!existingApiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    // If the API key exists, create the custom knowledge
    const customKnowledge = await prismadb.apiKeyCustomKnowledge.create({
      data: {
        ...data,
        apiKeyId: id,
      },
    });

    return NextResponse.json(customKnowledge, { status: 201 });
  } catch (error) {
    console.error('Error creating custom knowledge:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const data = await request.json();

  try {
    // First, check if the API key exists
    const existingApiKey = await prismadb.apiKey.findUnique({
      where: { id: id },
    });

    if (!existingApiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    // If the API key exists, update the custom knowledge
    const customKnowledge = await prismadb.apiKeyCustomKnowledge.upsert({
      where: { apiKeyId: id },
      update: data,
      create: {
        ...data,
        apiKeyId: id,
      },
    });

    return NextResponse.json(customKnowledge);
  } catch (error) {
    console.error('Error updating custom knowledge:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}