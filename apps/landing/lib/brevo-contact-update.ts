import { NextResponse } from 'next/server';

interface ContactAttributes {
  FIRSTNAME?: string;
  LASTNAME?: string;
  SOURCE?: string;
  PAID?: boolean;  // Changed to boolean
  [key: string]: string | boolean | undefined;  // Updated index signature to allow boolean
}

interface UpdateContactParams {
  email: string;
  attributes: ContactAttributes;
  listIds?: number[];
  updateEnabled?: boolean;
}

export async function updateBrevoContact({
  email,
  attributes,
  listIds = [],
  updateEnabled = true
}: UpdateContactParams): Promise<NextResponse> {
  // Rest of the function remains the same
  const brevoApiEndpoint = "https://api.brevo.com/v3/contacts";
  const brevoApiKey = process.env.BREVO_API_KEY;

  if (!brevoApiKey) {
    console.error('BREVO_API_KEY is not defined in the environment variables');
    return new NextResponse('Server configuration error', { status: 500 });
  }

  const payload = {
    email,
    attributes,
    listIds,
    updateEnabled
  };

  try {
    const response = await fetch(brevoApiEndpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'api-key': brevoApiKey 
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error updating contact in Brevo:', errorData);
      return new NextResponse(`Error updating contact in Brevo: ${response.statusText}`, { status: response.status });
    }

    return new NextResponse('Contact updated successfully', { status: 200 });
  } catch (error: any) {
    console.error(`Error updating contact in Brevo: ${error.message}`);
    return new NextResponse(`Error updating contact in Brevo: ${error.message}`, { status: 500 });
  }
}