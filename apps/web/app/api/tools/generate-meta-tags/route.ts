// File: app/api/tools/generate-meta-tags/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { description, url } = await request.json();

    if (!description || description.trim() === '') {
      return NextResponse.json(
        { error: 'Page description is required' },
        { status: 400 }
      );
    }

    // Direct prompt asking for meta tags in HTML format
    const prompt = `
Generate SEO-optimized meta tags in HTML format for a webpage with this description:
"${description}"
${url ? `\nWebsite URL: ${url}` : ''}

Return ONLY the HTML meta tags exactly as they should appear in the <head> section, for example:
<title>Page Title</title>
<meta name="title" content="Page Title" />
<meta name="description" content="Page description" />
<meta name="keywords" content="keyword1, keyword2, keyword3" />
<meta name="robots" content="index, follow" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta property="og:title" content="Open Graph Title" />
<meta property="og:description" content="Open Graph Description" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Twitter Title" />
<meta name="twitter:description" content="Twitter Description" />

Return ONLY the HTML tags, no explanations, JSON, or other text.
`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an SEO expert that replies only with clean, properly formatted HTML meta tags. No explanations or other text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7
    });
    
    // Get the raw HTML content directly from OpenAI
    const metaTagsHtml = completion.choices[0].message.content || '';
    
    // Also parse the meta tags to return as structured data for form population
    // This is a simple parser that extracts key information from the HTML tags
    const metaTags = parseMetaTags(metaTagsHtml);
    
    return NextResponse.json({ 
      metaTags,
      metaTagsHtml
    });
  } catch (error) {
    console.error('Error generating meta tags:', error);
    return NextResponse.json(
      { error: 'Failed to generate meta tags' },
      { status: 500 }
    );
  }
}

// Function to parse HTML meta tags into a structured object
function parseMetaTags(html: string): Record<string, string> {
  const result: Record<string, string> = {};
  
  // Extract title
  const titleMatch = html.match(/<title>(.*?)<\/title>/);
  if (titleMatch && titleMatch[1]) {
    result.title = titleMatch[1];
  }
  
  // Extract meta name tags
  const metaNameRegex = /<meta\s+name="([^"]+)"\s+content="([^"]+)"\s*\/?>/g;
  let match;
  while ((match = metaNameRegex.exec(html)) !== null) {
    const name = match[1];
    const content = match[2];
    
    switch (name) {
      case 'description':
        result.description = content;
        break;
      case 'keywords':
        result.keywords = content;
        break;
      case 'twitter:title':
        result.twitterTitle = content;
        break;
      case 'twitter:description':
        result.twitterDescription = content;
        break;
      case 'twitter:card':
        result.twitterCard = content;
        break;
      default:
        // Store other meta name tags
        result[name] = content;
    }
  }
  
  // Extract meta property tags (Open Graph)
  const metaPropertyRegex = /<meta\s+property="([^"]+)"\s+content="([^"]+)"\s*\/?>/g;
  while ((match = metaPropertyRegex.exec(html)) !== null) {
    const property = match[1];
    const content = match[2];
    
    switch (property) {
      case 'og:title':
        result.ogTitle = content;
        break;
      case 'og:description':
        result.ogDescription = content;
        break;
      case 'og:image':
        result.ogImage = content;
        break;
      default:
        // Store other og tags
        result[property.replace(':', '_')] = content;
    }
  }
  
  return result;
}