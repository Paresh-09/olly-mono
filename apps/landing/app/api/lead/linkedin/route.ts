import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import { z } from 'zod';

// Schema for validating search parameters
const linkedinSearchSchema = z.object({
  linkedinUrl: z.string().url()
});

// Function to search for a person by LinkedIn URL
async function searchPersonByLinkedIn(apiKey: string, linkedinUrl: string) {
  if (!linkedinUrl) {
    throw new Error('LinkedIn URL is required');
  }
  
  try {
    const response = await fetch('https://api.apollo.io/api/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Accept': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        linkedin_url: linkedinUrl,
        page: 1,
        per_page: 1 // We only need one result since we're searching by LinkedIn URL
      }),
    });

    if (!response.ok) {
      throw new Error(`Apollo API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching person:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const validatedData = linkedinSearchSchema.parse(body);
    
    // Get API key from environment variables
    const apiKey = process.env.APOLLO_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Apollo API key not configured' },
        { status: 500 }
      );
    }
    
    // Search for person by LinkedIn URL
    const apolloResponse = await searchPersonByLinkedIn(apiKey, validatedData.linkedinUrl);
    
    // Return the response directly
    return NextResponse.json(apolloResponse);
    
  } catch (error: any) {
    console.error('Error in LinkedIn search:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', message: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
} 