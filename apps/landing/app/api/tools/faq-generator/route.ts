import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { 
      productName, 
      productDescription, 
      faqType,
      faqTone,
      desiredQuestionCount,
      includeSchemaMarkup,
      specificQuestions
    } = await request.json();
    
    if (!productName) {
      return NextResponse.json(
        { error: 'Product/topic name is required' },
        { status: 400 }
      );
    }

    // Parse specific questions if provided
    let userSpecifiedQuestions: string[] = [];
    if (specificQuestions && specificQuestions.trim()) {
      userSpecifiedQuestions = specificQuestions
        .split('\n')
        .map((q:string) => q.trim())
        .filter((q:string) => q.length > 0);
    }

    // Build the system prompt
    let systemPrompt = `You are an expert FAQ generator specializing in creating comprehensive, accurate, and helpful FAQ sections for ${faqType} websites and products.
Create FAQs that:
- Answer the most common and important questions customers/users would have
- Are clear, concise, and easy to understand
- Use a ${faqTone} tone that matches the brand/product voice
- Follow best practices for FAQ structure and organization
- Cover different aspects including features, benefits, pricing, support, technical details, etc. as relevant to the product/topic
- Represent accurate information based on the product details provided
`;

    // Build the user prompt with all details
    let userPrompt = `Create a comprehensive FAQ section for the following product/topic:

Name: ${productName}`;

    if (productDescription) {
      userPrompt += `\nDescription: ${productDescription}`;
    }

    userPrompt += `\nFAQ Type: ${faqType}`;
    userPrompt += `\nTone: ${faqTone}`;
    userPrompt += `\nDesired Number of Questions: ${desiredQuestionCount}`;

    // Add specific questions if provided
    if (userSpecifiedQuestions.length > 0) {
      userPrompt += `\n\nPlease include answers to the following specific questions:\n`;
      userSpecifiedQuestions.forEach((q, i) => {
        userPrompt += `${i + 1}. ${q}\n`;
      });
    }

    userPrompt += `\nThe response should be a valid JSON object with an array of "faqs", where each FAQ item has a "question" and "answer" property. For example:

{
  "faqs": [
    {
      "question": "What is ${productName}?",
      "answer": "Detailed answer about the product..."
    },
    {
      "question": "Another common question?",
      "answer": "Answer to that question..."
    }
  ]
}

Each answer should be comprehensive but concise, typically 2-5 sentences. Make sure to generate exactly ${desiredQuestionCount} questions and answers, including any specific questions I provided (which count toward the total).`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2500
    });
      
    // Get the FAQs from OpenAI
    const responseContent = completion.choices[0].message.content || '';
    let generatedFaqs;
    
    try {
      const parsedResponse = JSON.parse(responseContent);
      generatedFaqs = parsedResponse.faqs || [];
      
      // Fallback if response doesn't match expected format
      if (!Array.isArray(generatedFaqs) || generatedFaqs.length === 0) {
        // Try to extract FAQs from a different format if possible
        if (typeof parsedResponse === 'object' && parsedResponse !== null) {
          // Look for any array property
          const possibleArrays = Object.values(parsedResponse).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            // Use the first array found
            generatedFaqs = possibleArrays[0];
          }
        }
        
        // If we still don't have valid FAQs, throw error
        if (!Array.isArray(generatedFaqs) || generatedFaqs.length === 0) {
          throw new Error('Invalid response format');
        }
      }
      
    } catch (error) {
      console.error('Error parsing JSON response:', error, responseContent);
      return NextResponse.json(
        { error: 'Failed to parse FAQs from the AI response' },
        { status: 500 }
      );
    }
    
    // Generate schema markup if requested
    let schemaMarkup = '';
    if (includeSchemaMarkup) {
      const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": generatedFaqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      };
      
      schemaMarkup = JSON.stringify(schema, null, 2);
    }
      
    return NextResponse.json({
      success: true,
      faqs: generatedFaqs,
      schemaMarkup: schemaMarkup
    });
  } catch (error) {
    console.error('Error generating FAQs:', error);
    return NextResponse.json(
      { error: 'Failed to generate FAQs' },
      { status: 500 }
    );
  }
}